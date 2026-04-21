import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const category = searchParams.get("category")?.trim() ?? "";
    const search   = searchParams.get("search")?.trim() ?? "";
    const sort     = searchParams.get("sort") ?? "popular";

    const where: any = { status: "PUBLISHED" };

    if (category) {
      where.category = { slug: category };
    }

    if (search) {
      where.OR = [
        { title:       { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { instructor:  { name: { contains: search, mode: "insensitive" } } },
      ];
    }

    // Determine orderBy
    let orderBy: any = { createdAt: "desc" };
    if (sort === "newest")  orderBy = { createdAt: "desc" };
    if (sort === "popular") orderBy = { enrollments: { _count: "desc" } };
    if (sort === "rating")  orderBy = { reviews: { _count: "desc" } };

    const courses = await prisma.course.findMany({
      where,
      orderBy,
      include: {
        instructor: { select: { name: true, image: true } },
        category:   { select: { name: true, slug: true } },
        _count:     { select: { enrollments: true, reviews: true } },
      },
    });

    return NextResponse.json({ courses });
  } catch (err) {
    console.error("[/api/courses] GET error:", err);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
