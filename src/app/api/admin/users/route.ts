import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function requireAdmin() {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "ADMIN") return null;
  return session;
}

const VALID_ROLES = ["STUDENT", "ADMIN"];

// GET /api/admin/users?page=1&limit=10&search=&role=
export async function GET(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = req.nextUrl;
    const page     = Math.max(1, parseInt(searchParams.get("page")  ?? "1",  10) || 1);
    const limit    = Math.min(50, parseInt(searchParams.get("limit") ?? "10", 10) || 10);
    const search = searchParams.get("search")?.trim() ?? "";
    const role   = searchParams.get("role") ?? "";

    const where: any = {};
    if (search) {
      where.OR = [
        { name:  { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }
    if (role && VALID_ROLES.includes(role)) {
      where.role = role;
    }

    const [users, total, studentCount, adminCount] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip:    (page - 1) * limit,
        take:    limit,
        select: {
          id:        true,
          name:      true,
          email:     true,
          role:      true,
          banned:    true,
          createdAt: true,
          _count:    { select: { enrollments: true } },
        },
      }),
      prisma.user.count({ where }),
      prisma.user.count({ where: { role: "STUDENT" } }),
      prisma.user.count({ where: { role: "ADMIN" } }),
    ]);

    return NextResponse.json({
      users, total, page, limit,
      totalPages: Math.ceil(total / limit),
      roleCounts: { STUDENT: studentCount, ADMIN: adminCount },
    });
  } catch (err) {
    console.error("[admin/users] GET", err);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}

// PATCH /api/admin/users — ban/unban hoặc đổi role
export async function PATCH(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id, action, role } = await req.json();
    if (!id) return NextResponse.json({ error: "Thiếu user id" }, { status: 400 });

    // Chặn tự ban/đổi role bản thân
    if (id === (session.user as any).id) {
      return NextResponse.json({ error: "Không thể thực hiện hành động này trên tài khoản của chính bạn" }, { status: 403 });
    }

    if (action === "ban") {
      const user = await prisma.user.update({ where: { id }, data: { banned: true } });
      return NextResponse.json({ success: true, user });
    }
    if (action === "unban") {
      const user = await prisma.user.update({ where: { id }, data: { banned: false } });
      return NextResponse.json({ success: true, user });
    }
    if (action === "setRole" && role) {
      // Validate role enum
      if (!VALID_ROLES.includes(role)) {
        return NextResponse.json(
          { error: `role không hợp lệ. Chỉ chấp nhận: ${VALID_ROLES.join(", ")}` },
          { status: 400 }
        );
      }
      const user = await prisma.user.update({ where: { id }, data: { role } });
      return NextResponse.json({ success: true, user });
    }

    return NextResponse.json({ error: "Action không hợp lệ" }, { status: 400 });
  } catch (err) {
    console.error("[admin/users] PATCH", err);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
