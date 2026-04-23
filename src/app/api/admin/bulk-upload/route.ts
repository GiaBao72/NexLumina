import crypto from "crypto";
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
 * POST /api/admin/bulk-upload
 *
 * Body (multipart/form-data):
 *   courseId: string
 *   files: File[]  (với webkitRelativePath trong metadata)
 *   paths: JSON string — mảng relative path tương ứng từng file
 *          vd: ["Section 1/bai-1.mp4", "Section 1/bai-2.mp4", "Section 2/bai-3.mp4"]
 *
 * Flow:
 *  1. Parse files + paths
 *  2. Group theo folder (= Section)
 *  3. Với mỗi Section: tạo DB record nếu chưa có
 *  4. Với mỗi .mp4/.mov/.avi → tạo Lesson + tạo Bunny video + upload blob
 *  5. Với mỗi .pdf/.docx/.zip → tạo LessonAttachment (Bunny Storage)
 *  6. Trả về danh sách đã tạo
 */
export async function POST(req: NextRequest) {
  if (!await requireAdmin())
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const libraryId = process.env.BUNNY_LIBRARY_ID!;
  const apiKey    = process.env.BUNNY_API_KEY!;

  if (!libraryId || !apiKey)
    return NextResponse.json({ error: "Thiếu cấu hình Bunny Stream" }, { status: 500 });

  try {
    const formData = await req.formData();
    const courseId = formData.get("courseId") as string;
    if (!courseId) return NextResponse.json({ error: "Thiếu courseId" }, { status: 400 });

    // Đảm bảo course tồn tại
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) return NextResponse.json({ error: "Course không tồn tại" }, { status: 404 });

    const pathsRaw = formData.get("paths") as string;
    const paths: string[] = JSON.parse(pathsRaw || "[]");
    const files: File[] = formData.getAll("files") as File[];

    if (files.length !== paths.length)
      return NextResponse.json({ error: "Số lượng file và paths không khớp" }, { status: 400 });

    // Group files theo folder (loại bỏ root folder đầu tiên)
    type FileEntry = { file: File; relativePath: string; sectionName: string; fileName: string };
    const entries: FileEntry[] = files.map((file, i) => {
      const parts = paths[i].split("/");
      // Nếu có ≥2 cấp: parts[0]=rootFolder, parts[1]=sectionFolder, parts[2]=file
      // Nếu chỉ 2 cấp: parts[0]=sectionFolder, parts[1]=file
      // Nếu 1 cấp: không có section
      let sectionName: string;
      let fileName: string;
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
      return { file, relativePath: paths[i], sectionName: sectionName.replace(/^\d+[-_.\s]+/, '').trim() || sectionName, fileName };
    });

    // Lấy section count hiện tại để set order đúng
    const existingSectionCount = await prisma.section.count({ where: { courseId } });

    // Tạo sections theo thứ tự xuất hiện
    const sectionMap = new Map<string, string>(); // sectionName → sectionId
    const uniqueSections = [...new Set(entries.map(e => e.sectionName))];
    for (let i = 0; i < uniqueSections.length; i++) {
      const name = uniqueSections[i];
      const section = await prisma.section.create({
        data: { title: name, order: existingSectionCount + i + 1, courseId },
      });
      sectionMap.set(name, section.id);
    }

    // Xử lý từng file
    const VIDEO_EXT = [".mp4", ".mov", ".avi", ".mkv", ".webm"];
    const DOC_EXT   = [".pdf", ".docx", ".doc", ".xlsx", ".zip", ".pptx"];

    const results: Array<{
      type: "video" | "doc" | "skip";
      sectionName: string;
      fileName: string;
      lessonTitle?: string;
      videoId?: string;
      error?: string;
    }> = [];

    // Group theo section để set lesson order
    const lessonCountMap = new Map<string, number>();

    for (const entry of entries) {
      const { file, sectionName, fileName } = entry;
      const ext = "." + fileName.split(".").pop()!.toLowerCase();
      const sectionId = sectionMap.get(sectionName)!;

      if (VIDEO_EXT.includes(ext)) {
        // Lấy title từ tên file (bỏ extension + số thứ tự prefix)
        const rawTitle = fileName.replace(/\.[^.]+$/, "").replace(/^\d+[-_.\s]+/, "").trim();
        const lessonTitle = rawTitle || fileName;

        // Tạo lesson trong DB
        const count = lessonCountMap.get(sectionId) ?? 0;
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
          results.push({ type: "video", sectionName, fileName, lessonTitle, error: "Bunny create failed" });
          continue;
        }

        const { guid: videoId } = await createRes.json();

        // Upload video lên Bunny qua TUS (dùng HTTP PUT cho đơn giản khi test)
        const buffer = await file.arrayBuffer();
        const uploadRes = await fetch(
          `https://video.bunnycdn.com/library/${libraryId}/videos/${videoId}`,
          {
            method:  "PUT",
            headers: { AccessKey: apiKey, "Content-Type": "application/octet-stream" },
            body:    buffer,
          }
        );

        if (!uploadRes.ok) {
          results.push({ type: "video", sectionName, fileName, lessonTitle, videoId, error: "Bunny upload failed" });
          continue;
        }

        // Cập nhật lesson với bunnyVideoId
        await prisma.lesson.update({
          where: { id: lesson.id },
          data:  { bunnyVideoId: videoId },
        });

        results.push({ type: "video", sectionName, fileName, lessonTitle, videoId });

      } else if (DOC_EXT.includes(ext)) {
        // Attachment — bỏ qua trong phase này (cần gắn vào lesson nào?)
        results.push({ type: "doc", sectionName, fileName });
      } else {
        results.push({ type: "skip", sectionName, fileName });
      }
    }

    // Cập nhật totalLessons cho course
    const totalLessons = await prisma.lesson.count({
      where: { section: { courseId } },
    });
    await prisma.course.update({
      where: { id: courseId },
      data:  { totalLessons },
    });

    return NextResponse.json({
      success: true,
      sectionsCreated: uniqueSections.length,
      results,
    });

  } catch (err) {
    console.error("[bulk-upload]", err);
    return NextResponse.json({ error: "Lỗi server: " + String(err) }, { status: 500 });
  }
}
