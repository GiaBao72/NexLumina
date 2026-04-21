import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function requireAdmin() {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "ADMIN") return null;
  return session;
}

const VALID_ORDER_STATUSES = ["PENDING", "PAID", "FAILED", "REFUNDED"];

// GET /api/admin/orders?page=1&limit=10&status=&search=
export async function GET(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = req.nextUrl;
    const page   = Math.max(1, parseInt(searchParams.get("page")  ?? "1",  10) || 1);
    const limit  = Math.min(50, parseInt(searchParams.get("limit") ?? "10", 10) || 10);
    const status = searchParams.get("status") ?? "";
    const search = searchParams.get("search")?.trim() ?? "";

    const where: any = {};
    if (status && VALID_ORDER_STATUSES.includes(status)) where.status = status;
    if (search) {
      where.user = { OR: [
        { name:  { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ]};
    }

    const [orders, total, pendingCount, paidCount, failedCount, refundedCount] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user:  { select: { name: true, email: true } },
          items: { include: { course: { select: { title: true } } } },
        },
      }),
      prisma.order.count({ where }),
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.order.count({ where: { status: "PAID" } }),
      prisma.order.count({ where: { status: "FAILED" } }),
      prisma.order.count({ where: { status: "REFUNDED" } }),
    ]);

    return NextResponse.json({
      orders, total, page, limit,
      totalPages: Math.ceil(total / limit),
      statusCounts: { PENDING: pendingCount, PAID: paidCount, FAILED: failedCount, REFUNDED: refundedCount },
    });
  } catch (err) {
    console.error("[admin/orders] GET", err);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}

// PATCH /api/admin/orders — update status
export async function PATCH(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id, status } = await req.json();
    if (!id || !status) return NextResponse.json({ error: "Thiếu id hoặc status" }, { status: 400 });

    // Validate status enum
    if (!VALID_ORDER_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: `status không hợp lệ. Chỉ chấp nhận: ${VALID_ORDER_STATUSES.join(", ")}` },
        { status: 400 }
      );
    }

    const order = await prisma.order.update({ where: { id }, data: { status } });
    return NextResponse.json({ success: true, order });
  } catch (err) {
    console.error("[admin/orders] PATCH", err);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
