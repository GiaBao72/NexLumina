import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function requireAdmin() {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "ADMIN") return null;
  return session;
}

function slugify(str: string) {
  return str.trim().toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d").replace(/[^a-z0-9\s-]/g, "")
    .trim().replace(/\s+/g, "-");
}

// GET /api/admin/categories
export async function GET(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const search = req.nextUrl.searchParams.get("search")?.trim() ?? "";
    const where: any = search ? { name: { contains: search, mode: "insensitive" } } : {};

    const [categories, total] = await Promise.all([
      prisma.category.findMany({
        where,
        orderBy: { name: "asc" },
        include: { _count: { select: { courses: true } } },
      }),
      prisma.category.count({ where }),
    ]);

    return NextResponse.json({ categories, total });
  } catch (err) {
    console.error("[admin/categories] GET", err);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}

// POST /api/admin/categories
export async function POST(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { name, description, icon } = await req.json();
    if (!name?.trim()) return NextResponse.json({ error: "Tên danh mục không được để trống" }, { status: 400 });

    const baseSlug = slugify(name);
    let slug = baseSlug;
    let count = 0;
    while (await prisma.category.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${++count}`;
    }

    const category = await prisma.category.create({
      data: { name: name.trim(), slug, description: description?.trim() || null, icon: icon?.trim() || null },
    });

    return NextResponse.json({ success: true, category }, { status: 201 });
  } catch (err: any) {
    if (err?.code === "P2002") return NextResponse.json({ error: "Tên danh mục đã tồn tại" }, { status: 409 });
    console.error("[admin/categories] POST", err);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}

// PATCH /api/admin/categories
export async function PATCH(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id, name, description, icon } = await req.json();
    if (!id) return NextResponse.json({ error: "Thiếu id" }, { status: 400 });
    if (!name?.trim()) return NextResponse.json({ error: "Tên không được để trống" }, { status: 400 });

    const updateData: any = { name: name.trim() };
    if (description !== undefined) updateData.description = description?.trim() || null;
    if (icon !== undefined) updateData.icon = icon?.trim() || null;

    const category = await prisma.category.update({ where: { id }, data: updateData });
    return NextResponse.json({ success: true, category });
  } catch (err: any) {
    if (err?.code === "P2002") return NextResponse.json({ error: "Tên đã tồn tại" }, { status: 409 });
    if (err?.code === "P2025") return NextResponse.json({ error: "Danh mục không tồn tại" }, { status: 404 });
    console.error("[admin/categories] PATCH", err);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}

// DELETE /api/admin/categories
export async function DELETE(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "Thiếu id" }, { status: 400 });

    const courseCount = await prisma.course.count({ where: { categoryId: id } });
    if (courseCount > 0) {
      return NextResponse.json({
        error: `Không thể xóa: danh mục đang có ${courseCount} khóa học. Hãy chuyển khóa học sang danh mục khác trước.`,
      }, { status: 409 });
    }

    await prisma.category.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    if (err?.code === "P2025") return NextResponse.json({ error: "Danh mục không tồn tại" }, { status: 404 });
    console.error("[admin/categories] DELETE", err);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
