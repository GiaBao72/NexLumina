import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id as string;
    const body = await req.json();
    const { courseId } = body;

    if (!courseId || typeof courseId !== "string") {
      return NextResponse.json({ error: "courseId không hợp lệ" }, { status: 400 });
    }

    // Validate course exists
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) {
      return NextResponse.json({ error: "Khóa học không tồn tại" }, { status: 404 });
    }

    // Upsert enrollment to avoid duplicate errors
    await prisma.enrollment.upsert({
      where: { userId_courseId: { userId, courseId } },
      create: { userId, courseId },
      update: {},
    });

    return NextResponse.json({ success: true, enrolled: true });
  } catch (err) {
    console.error("[enroll] error:", err);
    return NextResponse.json(
      { error: "Đã xảy ra lỗi máy chủ. Vui lòng thử lại sau." },
      { status: 500 }
    );
  }
}
