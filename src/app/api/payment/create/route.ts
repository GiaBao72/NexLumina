import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getPayOS } from "@/lib/payos";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Cần đăng nhập" }, { status: 401 });
  }
  const userId = session.user.id;

  let body: { items?: { id: string; title: string; price: number }[]; total?: number; discount?: number };
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Body không hợp lệ" }, { status: 400 }); }

  const { items, total, discount = 0 } = body;
  if (!Array.isArray(items) || items.length === 0 || typeof total !== "number" || total <= 0) {
    return NextResponse.json({ error: "Dữ liệu không hợp lệ" }, { status: 400 });
  }

  // Kiểm tra user đã mua chưa
  const alreadyEnrolled = await prisma.enrollment.findMany({
    where: { userId, courseId: { in: items.map(i => i.id) } },
    select: { courseId: true },
  });
  if (alreadyEnrolled.length > 0) {
    const names = alreadyEnrolled.map(e => e.courseId).join(", ");
    return NextResponse.json({ error: `Bạn đã đăng ký khóa học này rồi (${names})` }, { status: 400 });
  }

  // Validate giá từ DB (bảo mật — không tin client)
  const courses = await prisma.course.findMany({
    where: { id: { in: items.map(i => i.id) } },
    select: { id: true, title: true, price: true, salePrice: true },
  });
  if (courses.length !== items.length) {
    return NextResponse.json({ error: "Một số khóa học không tồn tại" }, { status: 400 });
  }

  const serverTotal = courses.reduce((sum, c) => {
    return sum + (c.salePrice !== null && c.salePrice !== undefined ? c.salePrice : c.price);
  }, 0);
  // Cho phép sai lệch ±1000 VND do làm tròn
  if (Math.abs(serverTotal - (total + discount)) > 1000) {
    return NextResponse.json({ error: "Tổng tiền không khớp" }, { status: 400 });
  }

  const orderCode = Date.now(); // unique BigInt — đủ dùng
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

  try {
    // Tạo order PENDING trong DB
    const order = await prisma.order.create({
      data: {
        userId,
        total,
        status: "PENDING",
        payosOrderCode: BigInt(orderCode),
        paymentMethod: "payos",
        items: {
          create: courses.map(c => ({
            courseId: c.id,
            price: c.salePrice !== null && c.salePrice !== undefined ? c.salePrice : c.price,
          })),
        },
      },
    });

    // Tạo PayOS payment link
    const paymentData = await getPayOS().createPaymentLink({
      orderCode,
      amount: Math.round(total),
      description: `NexLumina ${items.length > 1 ? `${items.length} khoá` : courses[0]?.title?.slice(0, 25) ?? "Khóa học"}`,
      items: courses.map(c => ({
        name: c.title.slice(0, 50),
        quantity: 1,
        price: Math.round(c.salePrice !== null && c.salePrice !== undefined ? c.salePrice : c.price),
      })),
      returnUrl: `${baseUrl}/payment/return?orderCode=${orderCode}`,
      cancelUrl: `${baseUrl}/payment/cancel?orderCode=${orderCode}`,
    });

    return NextResponse.json({
      checkoutUrl: paymentData.checkoutUrl,
      orderCode,
      orderId: order.id,
    });
  } catch (err) {
    console.error("[payment/create]", err);
    return NextResponse.json({ error: "Không tạo được link thanh toán. Vui lòng thử lại." }, { status: 500 });
  }
}
