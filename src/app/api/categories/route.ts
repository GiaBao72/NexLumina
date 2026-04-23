import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 300; // cache 5 phút

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        icon: true,
        color: true,
        _count: {
          select: { courses: { where: { status: "PUBLISHED" } } },
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ categories });
  } catch (err) {
    console.error("[/api/categories]", err);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
