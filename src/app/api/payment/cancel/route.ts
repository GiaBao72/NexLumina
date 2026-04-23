import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { orderCode } = await req.json().catch(() => ({}));
  if (!orderCode) return NextResponse.json({ ok: true });

  try {
    await prisma.order.updateMany({
      where: {
        payosOrderCode: BigInt(orderCode),
        status: "PENDING", // chỉ hủy nếu chưa thanh toán
      },
      data: { status: "CANCELLED" as any },
    });
  } catch { }

  return NextResponse.json({ ok: true });
}
