import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendPasswordResetEmail(email: string, token: string) {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const resetUrl = `${baseUrl}/forgot-password?token=${token}&email=${encodeURIComponent(email)}`;

  await transporter.sendMail({
    from: `"NexLumina" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Đặt lại mật khẩu NexLumina",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: auto; padding: 32px; border: 1px solid #e5e7eb; border-radius: 12px;">
        <div style="text-align:center; margin-bottom:24px;">
          <div style="display:inline-flex; background:#0d9488; border-radius:10px; padding:10px;">
            <span style="color:white; font-size:20px; font-weight:bold;">NexLumina</span>
          </div>
        </div>
        <h2 style="color:#111827; font-size:20px; margin-bottom:8px;">Đặt lại mật khẩu</h2>
        <p style="color:#4b5563; line-height:1.6;">
          Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản <strong>${email}</strong>.
          Nhấn vào nút bên dưới để tiếp tục. Liên kết có hiệu lực trong <strong>30 phút</strong>.
        </p>
        <div style="text-align:center; margin:28px 0;">
          <a href="${resetUrl}" style="background:#0d9488; color:white; padding:12px 28px; border-radius:8px; text-decoration:none; font-weight:600; font-size:15px;">
            Đặt lại mật khẩu
          </a>
        </div>
        <p style="color:#9ca3af; font-size:13px; line-height:1.5;">
          Nếu bạn không yêu cầu, hãy bỏ qua email này — mật khẩu sẽ không thay đổi.<br/>
          Liên kết hết hạn sau 30 phút.
        </p>
        <hr style="border:none; border-top:1px solid #f3f4f6; margin:24px 0;"/>
        <p style="color:#d1d5db; font-size:11px; text-align:center;">© ${new Date().getFullYear()} NexLumina. All rights reserved.</p>
      </div>
    `,
  });
}
