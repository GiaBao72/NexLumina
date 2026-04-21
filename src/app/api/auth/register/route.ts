import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

interface RegisterBody {
  name?: string;
  email?: string;
  password?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: RegisterBody = await req.json();
    const { name, email, password } = body;

    // ── Validate ──────────────────────────────────────────
    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "Họ tên không được để trống." }, { status: 400 });
    }

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email không được để trống." }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json({ error: "Địa chỉ email không hợp lệ." }, { status: 400 });
    }

    if (!password || typeof password !== "string") {
      return NextResponse.json({ error: "Mật khẩu không được để trống." }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Mật khẩu phải có ít nhất 8 ký tự." }, { status: 400 });
    }

    // ── Check duplicate email ─────────────────────────────
    const normalizedEmail = email.trim().toLowerCase();
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Email này đã được sử dụng. Vui lòng dùng email khác hoặc đăng nhập." },
        { status: 409 }
      );
    }

    // ── Hash password ─────────────────────────────────────
    const hashedPassword = await bcrypt.hash(password, 12);

    // ── Create user ───────────────────────────────────────
    await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        role: "STUDENT",
      },
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    console.error("[register] error:", err);
    return NextResponse.json(
      { error: "Đã xảy ra lỗi máy chủ. Vui lòng thử lại sau." },
      { status: 500 }
    );
  }
}
