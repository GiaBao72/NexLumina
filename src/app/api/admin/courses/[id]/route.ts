import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function requireAdmin() {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "ADMIN") return null;
  return session;
}

// GET /api/admin/courses/[id]
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;

    const [course, sections, recentEnrollments, totalRevenue] = await Promise.all([
      prisma.course.findUnique({
        where: { id },
        include: {
          category: { select: { id: true, name: true, slug: true } },
          _count: { select: { enrollments: true, reviews: true } },
        },
      }),
      prisma.section.findMany({
        where: { courseId: id },
        include: {
          lessons: {
            orderBy: { order: "asc" },
            select: {
              id: true, title: true, slug: true, order: true,
              isFree: true, duration: true, description: true,
              thumbnail: true,
            },
          },
        },
        orderBy: { order: "asc" },
      }),
      prisma.enrollment.findMany({
        where: { courseId: id },
        orderBy: { createdAt: "desc" },
        take: 20,
        include: {
          user: { select: { id: true, name: true, email: true, image: true } },
        },
      }),
      prisma.orderItem.aggregate({
        where: { courseId: id, order: { status: "PAID" } },
        _sum: { price: true },
      }),
    ]);

    if (!course) return NextResponse.json({ error: "Không tìm thấy khóa học" }, { status: 404 });

    return NextResponse.json({
      course,
      sections,
      recentEnrollments,
      totalRevenue: totalRevenue._sum.price ?? 0,
    });
  } catch (err) {
    console.error("[admin/courses/[id]] GET", err);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}

// PUT /api/admin/courses/[id] — cập nhật thông tin khóa học
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const body = await req.json();
    const {
      title, description, price, salePrice,
      level, status, featured, thumbnail,
      previewVideo, categoryId, language,
    } = body;

    const existing = await prisma.course.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Không tìm thấy khóa học" }, { status: 404 });

    const updated = await prisma.course.update({
      where: { id },
      data: {
        ...(title !== undefined && { title: String(title) }),
        ...(description !== undefined && { description: String(description) }),
        ...(price !== undefined && { price: Number(price) }),
        ...(salePrice !== undefined && { salePrice: salePrice ? Number(salePrice) : null }),
        ...(level !== undefined && { level: String(level) as any }),
        ...(status !== undefined && { status: String(status) as any }),
        ...(featured !== undefined && { featured: Boolean(featured) }),
        ...(thumbnail !== undefined && { thumbnail: String(thumbnail) }),
        ...(previewVideo !== undefined && { previewVideo: String(previewVideo) }),
        ...(categoryId !== undefined && { categoryId: String(categoryId) }),
        ...(language !== undefined && { language: String(language) }),
      },
    });

    return NextResponse.json({ course: updated });
  } catch (err) {
    console.error("[admin/courses/[id]] PUT", err);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}

// DELETE /api/admin/courses/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const course = await prisma.course.findUnique({
      where: { id },
      include: { _count: { select: { enrollments: true } } },
    });
    if (!course) return NextResponse.json({ error: "Không tìm thấy khóa học" }, { status: 404 });
    if (course._count.enrollments > 0)
      return NextResponse.json({ error: "Không thể xóa khóa học đã có học viên" }, { status: 400 });

    await prisma.course.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[admin/courses/[id]] DELETE", err);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
