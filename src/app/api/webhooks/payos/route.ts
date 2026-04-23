import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPayOS } from "@/lib/payos";

export const dynamic = "force-dynamic";

// PayOS gọi webhook này sau khi user thanh toán thành công
export async function POST(req: NextRequest) {
  let body: unknown;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Invalid body" }, { status: 400 }); }

  // Verify webhook signature
  try {
    getPayOS().verifyPaymentWebhookData(body as Parameters<ReturnType<typeof getPayOS>["verifyPaymentWebhookData"]>[0]);
  } catch (err) {
    console.error("[webhook/payos] Invalid signature", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const data = body as {
    orderCode?: number;
    code?: string;
    desc?: string;
    data?: { orderCode: number; status: string };
  };

  // PayOS structure: body.data.orderCode, body.data.status
  const orderCode = data?.data?.orderCode ?? data?.orderCode;
  const status = data?.data?.status ?? data?.code;

  if (!orderCode) {
    return NextResponse.json({ error: "Missing orderCode" }, { status: 400 });
  }

  const order = await prisma.order.findUnique({
    where: { payosOrderCode: BigInt(orderCode) },
    include: { items: { select: { courseId: true } } },
  });

  if (!order) {
    // Không crash — PayOS retry nhiều lần
    return NextResponse.json({ success: true });
  }

  if (status === "PAID" || status === "00") {
    // Đã xử lý rồi thì skip
    if (order.status === "PAID") {
      return NextResponse.json({ success: true });
    }

    await prisma.$transaction([
      // Cập nhật trạng thái đơn hàng
      prisma.order.update({
        where: { id: order.id },
        data: { status: "PAID" },
      }),
      // Tạo enrollments
      prisma.enrollment.createMany({
        data: order.items.map(item => ({
          userId: order.userId,
          courseId: item.courseId,
        })),
        skipDuplicates: true,
      }),
    ]);

    console.log(`[webhook/payos] Order ${order.id} PAID — ${order.items.length} courses enrolled`);
  } else if (status === "CANCELLED" || status === "CANCEL") {
    await prisma.order.update({
      where: { id: order.id },
      data: { status: "CANCELLED" },
    });
  }

  return NextResponse.json({ success: true });
}
