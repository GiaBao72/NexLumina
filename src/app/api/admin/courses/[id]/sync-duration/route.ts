import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function requireAdmin() {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "ADMIN") return null;
  return session;
}

// POST /api/admin/courses/[id]/sync-duration
// Gọi Bunny Stream API lấy duration thực tế cho tất cả lesson có bunnyVideoId
// Cập nhật lesson.duration (giây → phút) và course.totalDuration
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await requireAdmin())
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const libraryId = process.env.BUNNY_LIBRARY_ID!;
  const apiKey    = process.env.BUNNY_API_KEY!;

  if (!libraryId || !apiKey)
    return NextResponse.json({ error: "Thiếu cấu hình Bunny Stream" }, { status: 500 });

  try {
    // Lấy tất cả lesson của course có bunnyVideoId
    const lessons = await prisma.lesson.findMany({
      where: {
        section: { courseId: id },
        bunnyVideoId: { not: null },
      },
      select: { id: true, bunnyVideoId: true, duration: true },
    });

    if (lessons.length === 0)
      return NextResponse.json({ updated: 0, totalDuration: 0 });

    // Fetch duration từng video song song
    const results = await Promise.allSettled(
      lessons.map(async (lesson) => {
        const res = await fetch(
          `https://video.bunnycdn.com/library/${libraryId}/videos/${lesson.bunnyVideoId}`,
          { headers: { AccessKey: apiKey } }
        );
        if (!res.ok) throw new Error(`Bunny ${res.status} for ${lesson.bunnyVideoId}`);
        const data = await res.json();
        // Bunny trả `length` tính bằng giây
        const seconds: number = data.length ?? 0;
        return { id: lesson.id, seconds };
      })
    );

    // Cập nhật từng lesson — duration lưu dạng phút (làm tròn lên 1 nếu có video)
    let updated = 0;
    for (const r of results) {
      if (r.status === "fulfilled" && r.value.seconds > 0) {
        const minutes = Math.max(1, Math.round(r.value.seconds / 60));
        await prisma.lesson.update({
          where: { id: r.value.id },
          data:  { duration: minutes },
        });
        updated++;
      }
    }

    // Tính lại totalDuration cho course (tổng phút)
    const allLessons = await prisma.lesson.findMany({
      where: { section: { courseId: id } },
      select: { duration: true },
    });
    const totalDuration = allLessons.reduce((s, l) => s + (l.duration ?? 0), 0);

    await prisma.course.update({
      where: { id },
      data:  { totalDuration },
    });

    return NextResponse.json({ updated, totalDuration, total: lessons.length });
  } catch (err) {
    console.error("[sync-duration]", err);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
