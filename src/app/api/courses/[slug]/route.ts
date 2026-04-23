import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const course = await prisma.course.findUnique({
      where: { slug },
      include: {
        category:   { select: { id: true, name: true, slug: true } },
        sections: {
          orderBy: { order: "asc" },
          include: {
            lessons: {
              orderBy: { order: "asc" },
            },
          },
        },
        enrollments: { select: { userId: true } },
        _count:      { select: { enrollments: true, reviews: true } },
      },
    });

    if (!course) {
      return NextResponse.json({ error: "Khóa học không tồn tại" }, { status: 404 });
    }

    return NextResponse.json({ course });
  } catch (err) {
    console.error("[/api/courses/[slug]] GET error:", err);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
