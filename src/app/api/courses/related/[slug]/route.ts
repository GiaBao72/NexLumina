import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const current = await prisma.course.findUnique({
      where: { slug },
      select: { id: true, categoryId: true },
    });

    if (!current) {
      return NextResponse.json({ courses: [] });
    }

    const courses = await prisma.course.findMany({
      where: {
        status: "PUBLISHED",
        id: { not: current.id },
        categoryId: current.categoryId ?? undefined,
      },
      orderBy: { enrollments: { _count: "desc" } },
      take: 4,
      include: {
        category: { select: { name: true, slug: true } },
        _count: { select: { enrollments: true } },
      },
    });

    // Nếu không đủ 4 khóa cùng category, bổ sung khóa phổ biến khác
    if (courses.length < 4) {
      const extra = await prisma.course.findMany({
        where: {
          status: "PUBLISHED",
          id: { notIn: [current.id, ...courses.map((c) => c.id)] },
        },
        orderBy: { enrollments: { _count: "desc" } },
        take: 4 - courses.length,
        include: {
          category: { select: { name: true, slug: true } },
          _count: { select: { enrollments: true } },
        },
      });
      courses.push(...extra);
    }

    return NextResponse.json({ courses });
  } catch (err) {
    console.error("[/api/courses/related]", err);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
