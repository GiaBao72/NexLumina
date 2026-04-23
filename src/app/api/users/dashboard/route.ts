import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id as string;

    // Query enrollments with course + progress details
    const enrollments = await prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          include: {
            _count: { select: { enrollments: true, reviews: true } },
          },
        },
        progress: true,
      },
      orderBy: { createdAt: "desc" },
      take: 6,
    });

    // Map enrollments to enrolled courses with progress %
    const enrolledCourses = enrollments.map((enroll) => {
      const totalLessons = enroll.course.totalLessons ?? 0;
      const completedLessons = enroll.progress.filter((p) => p.completed).length;
      const progressPct =
        totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

      return {
        enrollmentId: enroll.id,
        courseId: enroll.course.id,
        title: enroll.course.title,
        slug: enroll.course.slug,
        thumbnail: enroll.course.thumbnail,
        totalLessons: enroll.course.totalLessons,
        totalDuration: enroll.course.totalDuration,
        level: enroll.course.level,
        progressPct,
        enrolledAt: enroll.createdAt,
        status: enroll.status,
        completedAt: enroll.completedAt,
      };
    });

    // Stats
    const totalEnrollments = await prisma.enrollment.count({ where: { userId } });
    const completedEnrollments = await prisma.enrollment.count({
      where: { userId, status: "COMPLETED" },
    });

    // Total duration (seconds) across all enrolled courses
    const allEnrollments = await prisma.enrollment.findMany({
      where: { userId },
      select: { course: { select: { totalDuration: true } } },
    });
    const totalSeconds = allEnrollments.reduce(
      (sum, e) => sum + (e.course.totalDuration ?? 0),
      0
    );
    const totalHours = Math.round((totalSeconds / 3600) * 10) / 10; // round to 1 decimal

    // Average rating from user's reviews
    const reviewsAgg = await prisma.review.aggregate({
      where: { userId },
      _avg: { rating: true },
    });
    const avgRating = reviewsAgg._avg.rating
      ? Math.round((reviewsAgg._avg.rating * 10) / 10)
      : null;

    return NextResponse.json({
      enrolledCourses,
      stats: {
        totalCourses: totalEnrollments,
        completedCourses: completedEnrollments,
        totalHours,
        avgRating,
      },
    });
  } catch (err) {
    console.error("[users/dashboard] GET error:", err);
    return NextResponse.json(
      { error: "Đã xảy ra lỗi máy chủ. Vui lòng thử lại sau." },
      { status: 500 }
    );
  }
}
