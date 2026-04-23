import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 300;

// Màu mặc định fallback theo index nếu category chưa có color
const FALLBACK_COLORS = [
  "bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-100",
  "bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-100",
  "bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-100",
  "bg-green-50 hover:bg-green-100 text-green-700 border-green-100",
  "bg-pink-50 hover:bg-pink-100 text-pink-700 border-pink-100",
  "bg-yellow-50 hover:bg-yellow-100 text-yellow-700 border-yellow-100",
  "bg-teal-50 hover:bg-teal-100 text-teal-700 border-teal-100",
  "bg-red-50 hover:bg-red-100 text-red-700 border-red-100",
];

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { courses: { _count: "desc" } },
      include: { _count: { select: { courses: true } } },
    });

    const data = categories.map((cat, i) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      icon: cat.icon ?? "📂",
      count: cat._count.courses,
      color: FALLBACK_COLORS[i % FALLBACK_COLORS.length],
    }));

    return NextResponse.json({ categories: data });
  } catch (err) {
    console.error("[/api/home/categories]", err);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
