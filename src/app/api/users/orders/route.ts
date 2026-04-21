import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id as string;

    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            course: {
              select: { id: true, title: true, slug: true, thumbnail: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Map to a clean shape for the client
    const mapped = orders.map((order) => ({
      id: order.id,
      total: order.total,
      status: order.status,
      stripePaymentId: order.stripePaymentId,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      items: order.items.map((item) => ({
        id: item.id,
        price: item.price,
        course: item.course,
      })),
    }));

    return NextResponse.json({ orders: mapped });
  } catch (err) {
    console.error("[users/orders] GET error:", err);
    return NextResponse.json(
      { error: "Đã xảy ra lỗi máy chủ. Vui lòng thử lại sau." },
      { status: 500 }
    );
  }
}
