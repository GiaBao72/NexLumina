import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// POST /api/orders — create order for authenticated user
export async function POST(req: NextRequest) {
  // 1. Require authenticated session
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Bạn cần đăng nhập để đặt hàng." }, { status: 401 });
  }
  const userId = session.user.id;

  // 2. Parse body
  let body: { items?: { id: string; price: number }[]; total?: number; paymentMethod?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Request body không hợp lệ." }, { status: 400 });
  }

  const { items, total, paymentMethod } = body;

  // 3. Validate
  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "Giỏ hàng trống." }, { status: 400 });
  }
  if (typeof total !== "number" || total <= 0) {
    return NextResponse.json({ error: "Tổng tiền không hợp lệ." }, { status: 400 });
  }

  // 4. Create order with items in a transaction
  try {
    // Create the order (PENDING)
    const order = await prisma.order.create({
      data: {
        userId,
        total,
        status: "PENDING",
        // stripePaymentId is the only free-text field available — store paymentMethod here
        stripePaymentId: paymentMethod ?? null,
        items: {
          create: items.map((i) => ({
            courseId: i.id,
            price: i.price,
          })),
        },
      },
    });

    // Create enrollments for each course (skip duplicates if already enrolled)
    await prisma.enrollment.createMany({
      data: items.map((i) => ({
        userId,
        courseId: i.id,
      })),
      skipDuplicates: true,
    });

    // Simulate payment success → mark order PAID
    await prisma.order.update({
      where: { id: order.id },
      data: { status: "PAID" },
    });

    // 5. Return orderId
    return NextResponse.json({ orderId: order.id, status: "PAID" });
  } catch (err) {
    console.error("[POST /api/orders] error:", err);
    return NextResponse.json({ error: "Tạo đơn hàng thất bại. Vui lòng thử lại." }, { status: 500 });
  }
}
