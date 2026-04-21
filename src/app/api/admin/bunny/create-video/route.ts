import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function requireAdmin() {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "ADMIN") return null;
  return session;
}

// POST /api/admin/bunny/create-video
export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { lessonId, title } = body;

    if (!lessonId || typeof lessonId !== "string") {
      return NextResponse.json({ error: "lessonId là bắt buộc" }, { status: 400 });
    }
    if (!title || typeof title !== "string" || !title.trim()) {
      return NextResponse.json({ error: "title là bắt buộc" }, { status: 400 });
    }

    const libraryId = process.env.BUNNY_LIBRARY_ID!;
    const apiKey    = process.env.BUNNY_API_KEY!;

    if (!libraryId || !apiKey) {
      return NextResponse.json({ error: "Thiếu cấu hình Bunny Stream" }, { status: 500 });
    }

    // Kiểm tra lesson tồn tại
    const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });
    if (!lesson) {
      return NextResponse.json({ error: "Lesson không tồn tại" }, { status: 404 });
    }

    // Nếu đã có video cũ → xóa trên Bunny trước
    if (lesson.bunnyVideoId) {
      try {
        await fetch(
          `https://video.bunnycdn.com/library/${libraryId}/videos/${lesson.bunnyVideoId}`,
          { method: "DELETE", headers: { AccessKey: apiKey } }
        );
      } catch (deleteErr) {
        console.warn("[bunny/create-video] Không thể xóa video cũ:", deleteErr);
      }
    }

    // Tạo video mới trên Bunny
    const createRes = await fetch(
      `https://video.bunnycdn.com/library/${libraryId}/videos`,
      {
        method: "POST",
        headers: {
          AccessKey: apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title: title.trim() }),
      }
    );

    if (!createRes.ok) {
      const errText = await createRes.text();
      console.error("[bunny/create-video] Bunny API error:", errText);
      return NextResponse.json({ error: "Không thể tạo video trên Bunny" }, { status: 502 });
    }

    const { guid: videoId } = await createRes.json();

    // Tính TUS signature
    const expiration = Math.floor(Date.now() / 1000) + 3600;
    const signature  = crypto
      .createHash("sha256")
      .update(`${libraryId}${apiKey}${expiration}${videoId}`)
      .digest("hex");

    // Cập nhật DB
    await prisma.lesson.update({
      where: { id: lessonId },
      data:  { bunnyVideoId: videoId },
    });

    return NextResponse.json({
      videoId,
      signature,
      expiration,
      libraryId,
      tusEndpoint: "https://video.bunnycdn.com/tusupload",
    });
  } catch (err) {
    console.error("[bunny/create-video] POST", err);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
