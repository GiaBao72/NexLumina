import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();
    const startOfMonth     = new Date(now.getFullYear(), now.getMonth(),     1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const [
      totalUsers,
      newUsersThisMonth,
      totalCourses,
      publishedCourses,
      draftCourses,
      archivedCourses,
      totalOrders,
      ordersThisMonth,
      revenueThisMonthData,
      revenueLastMonthData,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.course.count(),
      prisma.course.count({ where: { status: "PUBLISHED" } }),
      prisma.course.count({ where: { status: "DRAFT" } }),
      prisma.course.count({ where: { status: "ARCHIVED" } }),
      prisma.order.count({ where: { status: "PAID" } }),
      prisma.order.count({ where: { status: "PAID", createdAt: { gte: startOfMonth } } }),
      // Revenue tháng này (từ đầu tháng đến hiện tại)
      prisma.order.aggregate({
        where: { status: "PAID", createdAt: { gte: startOfMonth } },
        _sum:  { total: true },
      }),
      // Revenue tháng trước (nguyên tháng)
      prisma.order.aggregate({
        where: { status: "PAID", createdAt: { gte: startOfLastMonth, lt: startOfMonth } },
        _sum:  { total: true },
      }),
    ]);

    const revenueThisMonth = revenueThisMonthData._sum.total ?? 0;
    const revenueLastMonth = revenueLastMonthData._sum.total ?? 0;

    // revenueGrowth: % tăng trưởng tháng này so với tháng trước
    const revenueGrowth = revenueLastMonth > 0
      ? Math.round(((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100)
      : null;

    // Doanh thu 7 ngày qua (mỗi ngày)
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const recentOrders = await prisma.order.findMany({
      where:  { status: "PAID", createdAt: { gte: sevenDaysAgo } },
      select: { total: true, createdAt: true },
    });

    // Group by ngày
    const dayLabels = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
    const chartData = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(sevenDaysAgo);
      d.setDate(sevenDaysAgo.getDate() + i);
      const dayOrders = recentOrders.filter((o) => {
        const od = new Date(o.createdAt);
        return od.getDate() === d.getDate() && od.getMonth() === d.getMonth() && od.getFullYear() === d.getFullYear();
      });
      return {
        label: dayLabels[d.getDay()],
        value: dayOrders.reduce((s, o) => s + o.total, 0),
      };
    });

    // 5 đơn hàng gần nhất
    const latestOrders = await prisma.order.findMany({
      where:   { status: "PAID" },
      orderBy: { createdAt: "desc" },
      take:    5,
      include: {
        user:  { select: { name: true, email: true } },
        items: { include: { course: { select: { title: true } } } },
      },
    });

    // Top 5 khóa học theo doanh thu thực (qua orderItems)
    const topCoursesRaw = await prisma.orderItem.groupBy({
      by: ["courseId"],
      where: { order: { status: "PAID" } },
      _sum: { price: true },
      _count: { courseId: true },
      orderBy: { _sum: { price: "desc" } },
      take: 5,
    });

    const topCourseIds = topCoursesRaw.map((r) => r.courseId);
    const topCourseDetails = await prisma.course.findMany({
      where: { id: { in: topCourseIds } },
      include: {
        _count: { select: { enrollments: true } },
      },
    });

    const topCourses = topCourseIds.map((id) => {
      const detail  = topCourseDetails.find((c) => c.id === id);
      const revenue = topCoursesRaw.find((r) => r.courseId === id)?._sum.price ?? 0;
      return detail ? {
        id:          detail.id,
        title:       detail.title,
        enrollments: detail._count.enrollments,
        revenue,
        status:      detail.status,
      } : null;
    }).filter(Boolean);

    return NextResponse.json({
      stats: {
        revenueThisMonth,
        totalRevenue: revenueThisMonth,   // alias giữ backward compat
        revenueGrowth,
        totalUsers,
        newUsersThisMonth,
        totalCourses,
        publishedCourses,
        draftCourses,
        archivedCourses,
        totalOrders,
        ordersThisMonth,
      },
      chartData,
      latestOrders: latestOrders.map((o) => ({
        id:          o.id,
        userName:    o.user.name,
        userEmail:   o.user.email,
        courseTitle: o.items[0]?.course.title ?? "—",
        total:       o.total,
        status:      o.status,
        createdAt:   o.createdAt,
      })),
      topCourses,
    });
  } catch (err) {
    console.error("[admin/stats] GET", err);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
