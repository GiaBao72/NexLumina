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
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// GET /api/admin/lessons?courseId=xxx
export async function GET(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const courseId = req.nextUrl.searchParams.get("courseId");
    if (!courseId) return NextResponse.json({ error: "Thiếu courseId" }, { status: 400 });

    const sections = await prisma.section.findMany({
      where: { courseId },
      include: {
        lessons: { orderBy: { order: "asc" } },
      },
      orderBy: { order: "asc" },
    });

    return NextResponse.json({ sections });
  } catch (err) {
    console.error("[admin/lessons] GET", err);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}

// POST /api/admin/lessons
export async function POST(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { action } = body;

    if (action === "createSection") {
      const { courseId, title } = body;
      if (!courseId || !title) return NextResponse.json({ error: "Thiếu courseId hoặc title" }, { status: 400 });

      const count = await prisma.section.count({ where: { courseId } });
      const section = await prisma.section.create({
        data: { title, order: count + 1, courseId },
        include: { lessons: true },
      });
      return NextResponse.json({ success: true, section }, { status: 201 });
    }

    if (action === "createLesson") {
      const { sectionId, title } = body;
      if (!sectionId || !title) return NextResponse.json({ error: "Thiếu sectionId hoặc title" }, { status: 400 });

      const count = await prisma.lesson.count({ where: { sectionId } });
      // Slug unique check
      let slug = slugify(title);
      let slugCount = 0;
      while (await prisma.lesson.findFirst({ where: { slug } })) {
        slug = `${slugify(title)}-${++slugCount}`;
      }
      const lesson = await prisma.lesson.create({
        data: {
          title: title.trim(),
          slug,
          order: count + 1,
          sectionId,
          isFree: false,
        },
      });
      return NextResponse.json({ success: true, lesson }, { status: 201 });
    }

    return NextResponse.json({ error: "action không hợp lệ" }, { status: 400 });
  } catch (err) {
    console.error("[admin/lessons] POST", err);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}

// PATCH /api/admin/lessons
export async function PATCH(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { action } = body;

    if (action === "updateLesson") {
      const { lessonId, title, slug, description, isFree, duration, order } = body;
      if (!lessonId) return NextResponse.json({ error: "Thiếu lessonId" }, { status: 400 });

      const updateData: any = {};
      if (title !== undefined) {
        if (!title.trim()) return NextResponse.json({ error: "Title không được để trống" }, { status: 400 });
        updateData.title = title.trim();
      }
      if (slug !== undefined) {
        const trimmedSlug = slug.trim();
        if (!trimmedSlug) return NextResponse.json({ error: "Slug không được để trống" }, { status: 400 });
        // Check slug unique trong cùng section
        const existing = await prisma.lesson.findFirst({ where: { slug: trimmedSlug, NOT: { id: lessonId } } });
        if (existing) return NextResponse.json({ error: "Slug đã tồn tại trong hệ thống" }, { status: 409 });
        updateData.slug = trimmedSlug;
      }
      if (description !== undefined) updateData.description = description;
      if (isFree !== undefined) updateData.isFree = Boolean(isFree);
      if (duration !== undefined) updateData.duration = Number(duration);
      if (order !== undefined) updateData.order = Number(order);

      const lesson = await prisma.lesson.update({ where: { id: lessonId }, data: updateData });
      return NextResponse.json({ success: true, lesson });
    }

    if (action === "updateSection") {
      const { sectionId, title } = body;
      if (!sectionId) return NextResponse.json({ error: "Thiếu sectionId" }, { status: 400 });

      const updateData: any = {};
      if (title !== undefined) {
        if (!title.trim()) return NextResponse.json({ error: "Title không được để trống" }, { status: 400 });
        updateData.title = title.trim();
      }

      const section = await prisma.section.update({ where: { id: sectionId }, data: updateData });
      return NextResponse.json({ success: true, section });
    }

    return NextResponse.json({ error: "action không hợp lệ" }, { status: 400 });
  } catch (err) {
    console.error("[admin/lessons] PATCH", err);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}

// DELETE /api/admin/lessons
export async function DELETE(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { action } = body;

    if (action === "deleteLesson") {
      const { lessonId } = body;
      if (!lessonId) return NextResponse.json({ error: "Thiếu lessonId" }, { status: 400 });
      await prisma.lesson.delete({ where: { id: lessonId } });
      return NextResponse.json({ success: true });
    }

    if (action === "deleteSection") {
      const { sectionId } = body;
      if (!sectionId) return NextResponse.json({ error: "Thiếu sectionId" }, { status: 400 });
      // Cascade xóa lessons via onDelete: Cascade trong schema
      await prisma.section.delete({ where: { id: sectionId } });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "action không hợp lệ" }, { status: 400 });
  } catch (err) {
    console.error("[admin/lessons] DELETE", err);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
