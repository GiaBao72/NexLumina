import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function requireAdmin() {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "ADMIN") return null;
  return session;
}

const VALID_STATUSES = ["DRAFT", "PUBLISHED", "ARCHIVED"];
const VALID_LEVELS  = ["BEGINNER", "INTERMEDIATE", "ADVANCED"];
const VALID_ACTIONS = ["publish", "archive", "draft"];

// GET /api/admin/courses?page=1&limit=10&search=&status=&category=
export async function GET(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = req.nextUrl;
    const page     = Math.max(1, parseInt(searchParams.get("page")  ?? "1",  10) || 1);
    const limit    = Math.min(50, parseInt(searchParams.get("limit") ?? "10", 10) || 10);
    const search   = searchParams.get("search")?.trim() ?? "";
    const status   = searchParams.get("status") ?? "";
    const category = searchParams.get("category") ?? "";

    const where: any = {};
    if (search) where.title = { contains: search, mode: "insensitive" };
    if (status && VALID_STATUSES.includes(status)) where.status = status;
    if (category) where.category = { slug: category };

    // Lấy count theo status tổng DB (không theo filter search/category để hiện đúng stats)
    const [courses, total, publishedCount, draftCount, archivedCount] = await Promise.all([
      prisma.course.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          instructor: { select: { id: true, name: true } },
          category:   { select: { id: true, name: true, slug: true } },
          _count:     { select: { enrollments: true } },
        },
      }),
      prisma.course.count({ where }),
      prisma.course.count({ where: { status: "PUBLISHED" } }),
      prisma.course.count({ where: { status: "DRAFT" } }),
      prisma.course.count({ where: { status: "ARCHIVED" } }),
    ]);

    return NextResponse.json({
      courses, total, page, limit,
      totalPages: Math.ceil(total / limit),
      statusCounts: { PUBLISHED: publishedCount, DRAFT: draftCount, ARCHIVED: archivedCount },
    });
  } catch (err) {
    console.error("[admin/courses] GET", err);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}

// POST /api/admin/courses — tạo mới
export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { title, description, price, salePrice, level, status, categoryId, instructorId, featured, thumbnail } = body;

    if (!title?.trim() || !description || !categoryId || !instructorId) {
      return NextResponse.json({ error: "Thiếu thông tin bắt buộc (title, categoryId, instructorId)" }, { status: 400 });
    }

    // Validate price
    const priceNum = Number(price) || 0;
    const salePriceNum = salePrice ? Number(salePrice) : null;
    if (priceNum < 0) return NextResponse.json({ error: "Giá không được âm" }, { status: 400 });
    if (salePriceNum !== null && salePriceNum > priceNum) {
      return NextResponse.json({ error: "Giá khuyến mãi không được lớn hơn giá gốc" }, { status: 400 });
    }

    // Validate level enum
    if (level && !VALID_LEVELS.includes(level)) {
      return NextResponse.json({ error: `level không hợp lệ. Chỉ chấp nhận: ${VALID_LEVELS.join(", ")}` }, { status: 400 });
    }

    // Validate status enum
    if (status && !VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: `status không hợp lệ. Chỉ chấp nhận: ${VALID_STATUSES.join(", ")}` }, { status: 400 });
    }

    // Tạo slug từ title
    const baseSlug = title.trim().toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d").replace(/[^a-z0-9\s-]/g, "")
      .trim().replace(/\s+/g, "-");

    // Đảm bảo slug unique
    let slug = baseSlug;
    let count = 0;
    while (await prisma.course.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${++count}`;
    }

    const course = await prisma.course.create({
      data: {
        title: title.trim(), description, slug,
        price: priceNum,
        salePrice: salePriceNum,
        level:  level  || "BEGINNER",
        status: status || "DRAFT",
        categoryId, instructorId,
        featured:  Boolean(featured),
        thumbnail: thumbnail || null,
      },
      include: { instructor: { select: { id: true, name: true } }, category: { select: { id: true, name: true, slug: true } } },
    });

    return NextResponse.json({ success: true, course }, { status: 201 });
  } catch (err) {
    console.error("[admin/courses] POST", err);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}

// PATCH /api/admin/courses — update status / field
export async function PATCH(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { ids, id, action, ...fields } = body;

    // Bulk action
    if (ids && Array.isArray(ids)) {
      // Validate ids là string array
      if (!ids.every((i: any) => typeof i === "string")) {
        return NextResponse.json({ error: "ids phải là mảng string" }, { status: 400 });
      }
      if (!VALID_ACTIONS.includes(action)) {
        return NextResponse.json({ error: `action không hợp lệ. Chỉ chấp nhận: ${VALID_ACTIONS.join(", ")}` }, { status: 400 });
      }
      const statusMap: Record<string, string> = { publish: "PUBLISHED", archive: "ARCHIVED", draft: "DRAFT" };
      await prisma.course.updateMany({ where: { id: { in: ids } }, data: { status: statusMap[action] as any } });
      return NextResponse.json({ success: true });
    }

    // Single update
    if (!id) return NextResponse.json({ error: "Thiếu id" }, { status: 400 });

    const updateData: any = {};
    if (action === "publish") updateData.status = "PUBLISHED";
    else if (action === "archive") updateData.status = "ARCHIVED";
    else if (action === "draft") updateData.status = "DRAFT";
    else {
      // Edit fields
      const allowed = ["title", "description", "price", "salePrice", "level", "status", "featured", "thumbnail", "categoryId", "instructorId"];
      allowed.forEach((k) => { if (fields[k] !== undefined) updateData[k] = fields[k]; });
      if (updateData.price     !== undefined) updateData.price     = Number(updateData.price);
      if (updateData.salePrice !== undefined) updateData.salePrice = updateData.salePrice ? Number(updateData.salePrice) : null;
      if (updateData.level  && !VALID_LEVELS.includes(updateData.level)) {
        return NextResponse.json({ error: `level không hợp lệ. Chỉ chấp nhận: ${VALID_LEVELS.join(", ")}` }, { status: 400 });
      }
      if (updateData.status && !VALID_STATUSES.includes(updateData.status)) {
        return NextResponse.json({ error: `status không hợp lệ. Chỉ chấp nhận: ${VALID_STATUSES.join(", ")}` }, { status: 400 });
      }
    }

    const course = await prisma.course.update({ where: { id }, data: updateData });
    return NextResponse.json({ success: true, course });
  } catch (err) {
    console.error("[admin/courses] PATCH", err);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}

// DELETE /api/admin/courses
export async function DELETE(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { ids } = await req.json();
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "Thiếu ids" }, { status: 400 });
    }
    if (!ids.every((i: any) => typeof i === "string")) {
      return NextResponse.json({ error: "ids phải là mảng string" }, { status: 400 });
    }

    // Kiểm tra enrollment trước khi xóa
    const enrollmentCount = await prisma.enrollment.count({
      where: { courseId: { in: ids } },
    });
    if (enrollmentCount > 0) {
      return NextResponse.json({
        error: `Không thể xóa: ${enrollmentCount} học viên đã đăng ký các khóa này. Hãy lưu trữ thay vì xóa.`,
      }, { status: 409 });
    }

    await prisma.course.deleteMany({ where: { id: { in: ids } } });
    return NextResponse.json({ success: true, deleted: ids.length });
  } catch (err) {
    console.error("[admin/courses] DELETE", err);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
