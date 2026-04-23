import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ orderCode: string }> }
) {
  const { orderCode } = await params;
  const code = BigInt(orderCode);

  const order = await prisma.order.findUnique({
    where: { payosOrderCode: code },
    select: { id: true, status: true, userId: true },
  });

  if (!order) {
    return NextResponse.json({ error: "Không tìm thấy đơn hàng" }, { status: 404 });
  }

  return NextResponse.json({ orderId: order.id, status: order.status });
}
