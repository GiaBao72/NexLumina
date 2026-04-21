import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function requireAdmin() {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "ADMIN") return null;
  return session;
}

// DELETE /api/admin/bunny/[videoId]
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ videoId: string }> }
) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { videoId } = await params;

    if (!videoId) {
      return NextResponse.json({ error: "videoId là bắt buộc" }, { status: 400 });
    }

    const libraryId = process.env.BUNNY_LIBRARY_ID!;
    const apiKey    = process.env.BUNNY_API_KEY!;

    if (!libraryId || !apiKey) {
      return NextResponse.json({ error: "Thiếu cấu hình Bunny Stream" }, { status: 500 });
    }

    // Lấy lessonId từ body (optional)
    let lessonId: string | undefined;
    try {
      const body = await req.json();
      lessonId = body?.lessonId;
    } catch {
      // body rỗng hoặc không phải JSON — bỏ qua
    }

    // Gọi Bunny DELETE
    const deleteRes = await fetch(
      `https://video.bunnycdn.com/library/${libraryId}/videos/${videoId}`,
      { method: "DELETE", headers: { AccessKey: apiKey } }
    );

    if (!deleteRes.ok) {
      const errText = await deleteRes.text();
      console.error("[bunny/delete-video] Bunny API error:", errText);
      // Chỉ bỏ qua nếu 404 (video không tồn tại — đã bị xóa trước đó)
      // Các lỗi khác (auth, network) → fail sớm để tránh orphan
      if (deleteRes.status !== 404) {
        return NextResponse.json({ error: `Bunny API lỗi (${deleteRes.status}). Video vẫn còn tồn tại.` }, { status: 502 });
      }
    }

    // Clear DB nếu có lessonId
    if (lessonId && typeof lessonId === "string") {
      await prisma.lesson.update({
        where: { id: lessonId },
        data:  { bunnyVideoId: null, duration: 0 },
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[bunny/delete-video] DELETE", err);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
