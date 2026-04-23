import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function requireAdmin() {
  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "ADMIN") return null;
    return session;
  } catch { return null; }
}

/**
 * POST /api/admin/bulk-upload/prepare
 * Nhận metadata (courseId + danh sách file paths), tạo Section + Lesson trong DB,
 * trả về lessonId + Bunny videoId + TUS signature để client upload từng file riêng.
 *
 * Body JSON:
 * {
 *   courseId: string,
 *   files: Array<{ path: string, name: string, size: number }>
 * }
 */
export async function POST(req: NextRequest) {
  if (!await requireAdmin())
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const libraryId = process.env.BUNNY_LIBRARY_ID!;
  const apiKey    = process.env.BUNNY_API_KEY!;

  if (!libraryId || !apiKey)
    return NextResponse.json({ error: "Thiếu cấu hình Bunny Stream" }, { status: 500 });

  const body = await req.json();
  const { courseId, files } = body as {
    courseId: string;
    files: Array<{ path: string; name: string; size: number }>;
  };

  if (!courseId || !files?.length)
    return NextResponse.json({ error: "Thiếu courseId hoặc files" }, { status: 400 });

  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) return NextResponse.json({ error: "Course không tồn tại" }, { status: 404 });

  const VIDEO_EXT = [".mp4", ".mov", ".avi", ".mkv", ".webm"];

  // Parse path → sectionName, fileName, lessonTitle
  function parsePath(filePath: string) {
    const parts = filePath.split("/");
    let sectionName: string, fileName: string;
    if (parts.length >= 3) {
      sectionName = parts[parts.length - 2];
      fileName    = parts[parts.length - 1];
    } else if (parts.length === 2) {
      sectionName = parts[0];
      fileName    = parts[1];
    } else {
      sectionName = "Chưa phân loại";
      fileName    = parts[0];
    }
    // Bỏ prefix số thứ tự: "01 - ", "01. ", "01_"
    const cleanName = (s: string) => s.replace(/^\d+[-_.\s]+/, "").trim() || s;
    const ext = "." + fileName.split(".").pop()!.toLowerCase();
    const lessonTitle = cleanName(fileName.replace(/\.[^.]+$/, ""));
    return { sectionName: cleanName(sectionName), fileName, ext, lessonTitle };
  }

  // Chỉ xử lý video
  const videoFiles = files.filter(f => {
    const ext = "." + f.name.split(".").pop()!.toLowerCase();
    return VIDEO_EXT.includes(ext);
  });

  if (!videoFiles.length)
    return NextResponse.json({ error: "Không có file video nào" }, { status: 400 });

  // Lấy order hiện tại
  const existingSectionCount = await prisma.section.count({ where: { courseId } });

  // Tạo sections theo thứ tự xuất hiện (duy nhất)
  const sectionNames = [...new Set(videoFiles.map(f => parsePath(f.path).sectionName))];
  const sectionMap = new Map<string, string>(); // name → id

  for (let i = 0; i < sectionNames.length; i++) {
    const name = sectionNames[i];
    const sec = await prisma.section.create({
      data: { title: name, order: existingSectionCount + i + 1, courseId },
    });
    sectionMap.set(name, sec.id);
  }

  // Tạo lesson + Bunny video cho từng file
  const lessonCountMap = new Map<string, number>();
  const results = [];

  for (const f of videoFiles) {
    const { sectionName, fileName, lessonTitle } = parsePath(f.path);
    const sectionId = sectionMap.get(sectionName)!;
    const count = lessonCountMap.get(sectionId) ?? 0;

    // Tạo lesson
    const lesson = await prisma.lesson.create({
      data: {
        title:     lessonTitle,
        slug:      `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        order:     count + 1,
        isFree:    false,
        duration:  0,
        sectionId,
      },
    });
    lessonCountMap.set(sectionId, count + 1);

    // Tạo video trên Bunny
    const createRes = await fetch(
      `https://video.bunnycdn.com/library/${libraryId}/videos`,
      {
        method:  "POST",
        headers: { AccessKey: apiKey, "Content-Type": "application/json" },
        body:    JSON.stringify({ title: lessonTitle }),
      }
    );

    if (!createRes.ok) {
      // Xóa lesson vừa tạo nếu Bunny fail
      await prisma.lesson.delete({ where: { id: lesson.id } });
      results.push({ path: f.path, fileName, error: "Bunny create video failed" });
      continue;
    }

    const { guid: videoId } = await createRes.json();

    // Lưu bunnyVideoId vào lesson
    await prisma.lesson.update({
      where: { id: lesson.id },
      data:  { bunnyVideoId: videoId },
    });

    // Tính TUS signature (dùng cho TUS upload nếu cần, hiện dùng PUT)
    results.push({
      path:        f.path,
      fileName,
      lessonTitle,
      sectionName,
      lessonId:    lesson.id,
      videoId,
      // Upload qua proxy — không trả key ra client
      uploadUrl:   `/api/admin/bulk-upload/video/${videoId}`,
    });
  }

  // Cập nhật totalLessons
  const total = await prisma.lesson.count({ where: { section: { courseId } } });
  await prisma.course.update({ where: { id: courseId }, data: { totalLessons: total } });

  return NextResponse.json({ ok: true, results });
}
