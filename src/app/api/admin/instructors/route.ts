import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function requireAdmin() {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "ADMIN") return null;
  return session;
}

// GET /api/admin/instructors — lấy danh sách user có role INSTRUCTOR
export async function GET(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const search = req.nextUrl.searchParams.get("search")?.trim() ?? "";
    const where: any = { role: "INSTRUCTOR" };
    if (search) {
      where.OR = [
        { name:  { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const [instructors, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { name: "asc" },
        select: {
          id: true, name: true, email: true, image: true,
          createdAt: true, banned: true,
          _count: { select: { courses: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json({ instructors, total });
  } catch (err) {
    console.error("[admin/instructors] GET", err);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}

// POST /api/admin/instructors — tạo user mới với role INSTRUCTOR
export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { name, email, password } = await req.json();
    if (!name?.trim() || !email?.trim() || !password) {
      return NextResponse.json({ error: "Thiếu name, email hoặc password" }, { status: 400 });
    }

    const bcrypt = await import("bcryptjs");
    const hashed = await bcrypt.hash(password, 10);

    const instructor = await prisma.user.create({
      data: { name: name.trim(), email: email.trim().toLowerCase(), password: hashed, role: "INSTRUCTOR" },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    return NextResponse.json({ success: true, instructor }, { status: 201 });
  } catch (err: any) {
    if (err?.code === "P2002") return NextResponse.json({ error: "Email đã tồn tại trong hệ thống" }, { status: 409 });
    console.error("[admin/instructors] POST", err);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}

// PATCH /api/admin/instructors — cập nhật thông tin
export async function PATCH(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id, name, banned } = await req.json();
    if (!id) return NextResponse.json({ error: "Thiếu id" }, { status: 400 });

    const updateData: any = {};
    if (name !== undefined) updateData.name = name?.trim() || null;
    if (banned !== undefined) updateData.banned = Boolean(banned);

    const instructor = await prisma.user.update({
      where: { id, role: "INSTRUCTOR" },
      data: updateData,
      select: { id: true, name: true, email: true, banned: true },
    });

    return NextResponse.json({ success: true, instructor });
  } catch (err: any) {
    if (err?.code === "P2025") return NextResponse.json({ error: "Giảng viên không tồn tại" }, { status: 404 });
    console.error("[admin/instructors] PATCH", err);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
