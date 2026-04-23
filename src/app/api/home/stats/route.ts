import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
// Cache 5 phút — số liệu trang chủ không cần realtime
export const revalidate = 300;

export async function GET() {
  try {
    const [totalCourses, totalStudents] = await Promise.all([
      prisma.course.count({ where: { status: "PUBLISHED" } }),
      prisma.user.count({ where: { role: "STUDENT" } }),
    ]);

    return NextResponse.json({
      totalCourses,
      totalStudents,
      satisfactionRate: 98,
    });
  } catch (err) {
    console.error("[/api/home/stats]", err);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
