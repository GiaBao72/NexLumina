"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

interface FieldErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  /* ── Password strength indicator ─────────────────────── */
  function passwordStrength(pw: string): { score: number; label: string; color: string } {
    if (!pw) return { score: 0, label: "", color: "" };
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    const map = [
      { label: "Rất yếu", color: "bg-red-400" },
      { label: "Yếu", color: "bg-orange-400" },
      { label: "Trung bình", color: "bg-yellow-400" },
      { label: "Mạnh", color: "bg-teal-500" },
      { label: "Rất mạnh", color: "bg-teal-600" },
    ];
    return { score, ...map[score] };
  }
  const strength = passwordStrength(password);

  /* ── Client-side validation ───────────────────────────── */
  function validate(): boolean {
    const errs: FieldErrors = {};
    if (!name.trim()) errs.name = "Vui lòng nhập họ tên.";
    if (!email.trim()) {
      errs.email = "Vui lòng nhập email.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = "Địa chỉ email không hợp lệ.";
    }
    if (!password) {
      errs.password = "Vui lòng nhập mật khẩu.";
    } else if (password.length < 8) {
      errs.password = "Mật khẩu phải có ít nhất 8 ký tự.";
    }
    if (!confirmPassword) {
      errs.confirmPassword = "Vui lòng xác nhận mật khẩu.";
    } else if (password !== confirmPassword) {
      errs.confirmPassword = "Mật khẩu xác nhận không khớp.";
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  /* ── Submit ───────────────────────────────────────────── */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error ?? "Đăng ký thất bại. Vui lòng thử lại.");
      } else {
        router.push("/login?registered=1");
      }
    } catch {
      setError("Đã xảy ra lỗi kết nối. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }

  const inputBase =
    "w-full rounded-lg border bg-gray-50 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:bg-white focus:ring-2";
  const inputOk = "border-gray-200 focus:border-teal-500 focus:ring-teal-500/20";
  const inputErr = "border-red-300 focus:border-red-400 focus:ring-red-400/20 bg-red-50";

  return (
    <main className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-orange-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl shadow-teal-100/50 border border-teal-100/60 px-8 py-10">

          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <Link href="/" className="flex items-center gap-2 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 shadow-md shadow-teal-200">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-2xl text-gray-900 tracking-tight">
                Nex<span className="text-teal-600">Lumina</span>
              </span>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Tạo tài khoản</h1>
            <p className="text-sm text-gray-500 text-center">
              Miễn phí. Học ngay hôm nay, không cần thẻ tín dụng.
            </p>
          </div>

          {/* Global error */}
          {error && (
            <div className="mb-5 flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Họ tên */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">
                Họ tên
              </label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => { setName(e.target.value); setFieldErrors((p) => ({ ...p, name: undefined })); }}
                placeholder="Nguyễn Văn A"
                className={`${inputBase} ${fieldErrors.name ? inputErr : inputOk}`}
              />
              {fieldErrors.name && (
                <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> {fieldErrors.name}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setFieldErrors((p) => ({ ...p, email: undefined })); }}
                placeholder="you@example.com"
                className={`${inputBase} ${fieldErrors.email ? inputErr : inputOk}`}
              />
              {fieldErrors.email && (
                <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> {fieldErrors.email}
                </p>
              )}
            </div>

            {/* Mật khẩu */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                Mật khẩu
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setFieldErrors((p) => ({ ...p, password: undefined })); }}
                  placeholder="Tối thiểu 8 ký tự"
                  className={`${inputBase} pr-10 ${fieldErrors.password ? inputErr : inputOk}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {/* Strength bar */}
              {password && (
                <div className="mt-2 space-y-1">
                  <div className="flex gap-1">
                    {[0, 1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          i < strength.score ? strength.color : "bg-gray-100"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-400">Độ mạnh: <span className="font-medium text-gray-600">{strength.label}</span></p>
                </div>
              )}
              {fieldErrors.password && (
                <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> {fieldErrors.password}
                </p>
              )}
            </div>

            {/* Xác nhận mật khẩu */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1.5">
                Xác nhận mật khẩu
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setFieldErrors((p) => ({ ...p, confirmPassword: undefined })); }}
                  placeholder="Nhập lại mật khẩu"
                  className={`${inputBase} pr-10 ${fieldErrors.confirmPassword ? inputErr : inputOk}`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label={showConfirm ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
                {/* Match indicator */}
                {confirmPassword && password === confirmPassword && (
                  <CheckCircle2 className="absolute right-9 top-1/2 -translate-y-1/2 h-4 w-4 text-teal-500" />
                )}
              </div>
              {fieldErrors.confirmPassword && (
                <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> {fieldErrors.confirmPassword}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-teal-600 px-4 py-3 text-sm font-semibold text-white shadow-sm shadow-teal-200 transition hover:bg-teal-700 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 mt-1"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? "Đang tạo tài khoản…" : "Tạo tài khoản"}
            </button>
          </form>

          {/* Login link */}
          <p className="mt-6 text-center text-sm text-gray-500">
            Đã có tài khoản?{" "}
            <Link href="/login" className="font-semibold text-teal-600 hover:text-teal-700 hover:underline">
              Đăng nhập
            </Link>
          </p>
        </div>

        {/* Footer note */}
        <p className="mt-6 text-center text-xs text-gray-400">
          Bằng cách đăng ký, bạn đồng ý với{" "}
          <Link href="/terms" className="underline hover:text-gray-600">Điều khoản dịch vụ</Link>{" "}
          và{" "}
          <Link href="/privacy" className="underline hover:text-gray-600">Chính sách bảo mật</Link>.
        </p>
      </div>
    </main>
  );
}
