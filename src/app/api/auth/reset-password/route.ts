import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { token, email, password } = await req.json();

    if (!token || !email || !password) {
      return NextResponse.json({ error: "Thiếu thông tin bắt buộc." }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Mật khẩu phải có ít nhất 8 ký tự." }, { status: 400 });
    }

    const normalized = email.trim().toLowerCase();

    const record = await prisma.passwordResetToken.findUnique({ where: { token } });

    if (!record || record.email !== normalized) {
      return NextResponse.json({ error: "Liên kết không hợp lệ." }, { status: 400 });
    }

    if (record.used) {
      return NextResponse.json({ error: "Liên kết này đã được sử dụng." }, { status: 400 });
    }

    if (record.expires < new Date()) {
      await prisma.passwordResetToken.delete({ where: { token } });
      return NextResponse.json({ error: "Liên kết đã hết hạn. Vui lòng yêu cầu lại." }, { status: 400 });
    }

    const hashed = await bcrypt.hash(password, 12);

    await prisma.$transaction([
      prisma.user.update({
        where: { email: normalized },
        data: { password: hashed },
      }),
      prisma.passwordResetToken.update({
        where: { token },
        data: { used: true },
      }),
    ]);

    return NextResponse.json({ message: "Mật khẩu đã được đặt lại thành công." });
  } catch (err) {
    console.error("[reset-password]", err);
    return NextResponse.json({ error: "Có lỗi xảy ra, vui lòng thử lại." }, { status: 500 });
  }
}
