import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET /api/lessons/[slug]/token
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    // Phải đăng nhập
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId   = (session.user as any).id as string;
    const userRole = (session.user as any).role as string;
    const { slug } = await params;

    // Lấy lesson + section + course
    const lesson = await prisma.lesson.findFirst({
      where: { slug },
      include: {
        section: {
          include: {
            course: true,
          },
        },
      },
    });

    if (!lesson) {
      return NextResponse.json({ error: "Lesson không tồn tại" }, { status: 404 });
    }

    if (!lesson.bunnyVideoId) {
      return NextResponse.json({ error: "Lesson chưa có video" }, { status: 404 });
    }

    const videoId  = lesson.bunnyVideoId;
    const courseId = lesson.section.courseId;

    // Admin luôn pass
    const isPrivileged = userRole === "ADMIN";

    if (!isPrivileged && !lesson.isFree) {
      // Kiểm tra enrollment
      const enrollment = await prisma.enrollment.findUnique({
        where: { userId_courseId: { userId, courseId } },
      });

      if (!enrollment) {
        return NextResponse.json(
          { error: "Bạn chưa đăng ký khóa học này" },
          { status: 403 }
        );
      }
    }

    // Generate token
    const libraryId = process.env.BUNNY_LIBRARY_ID ?? "";
    const tokenKey  = process.env.BUNNY_TOKEN_KEY  ?? "";
    const expires   = Math.floor(Date.now() / 1000) + 86400; // 24h

    let embedUrl: string;

    if (tokenKey) {
      const token = crypto
        .createHash("sha256")
        .update(tokenKey + videoId + expires)
        .digest("hex");

      const qs = new URLSearchParams({
        token,
        expires:           String(expires),
        autoplay:          "false",
        preload:           "true",
        showSpeed:         "true",
        rememberPosition:  "true",
      });
      embedUrl = `https://iframe.mediadelivery.net/embed/${libraryId}/${videoId}?${qs.toString()}`;
    } else {
      // Dev mode — không có token
      const qs = new URLSearchParams({
        autoplay:         "false",
        preload:          "true",
        showSpeed:        "true",
        rememberPosition: "true",
      });
      embedUrl = `https://iframe.mediadelivery.net/embed/${libraryId}/${videoId}?${qs.toString()}`;
    }

    return NextResponse.json({
      embedUrl,
      videoId,
      expires,
      lessonTitle: lesson.title,
    });
  } catch (err) {
    console.error("[lessons/slug/token] GET", err);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
