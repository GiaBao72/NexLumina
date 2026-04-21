import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email không hợp lệ." }, { status: 400 });
    }

    const normalized = email.trim().toLowerCase();

    // Luôn trả về success để không lộ email có tồn tại hay không
    const user = await prisma.user.findUnique({ where: { email: normalized } });

    if (user) {
      // Xóa token cũ của email này (nếu có)
      await prisma.passwordResetToken.deleteMany({ where: { email: normalized } });

      const token = crypto.randomBytes(32).toString("hex");
      const expires = new Date(Date.now() + 30 * 60 * 1000); // 30 phút

      await prisma.passwordResetToken.create({
        data: { email: normalized, token, expires },
      });

      await sendPasswordResetEmail(normalized, token);
    }

    return NextResponse.json({
      message: "Nếu email tồn tại, chúng tôi đã gửi link đặt lại mật khẩu.",
    });
  } catch (err) {
    console.error("[forgot-password]", err);
    return NextResponse.json({ error: "Có lỗi xảy ra, vui lòng thử lại." }, { status: 500 });
  }
}
