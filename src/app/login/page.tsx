"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { BookOpen, Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";

/* ─── Inner component (needs useSearchParams) ──────────────────────────────── */
function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [justRegistered, setJustRegistered] = useState(false);

  useEffect(() => {
    if (searchParams.get("registered") === "1") {
      setJustRegistered(true);
    }
    const err = searchParams.get("error");
    if (err) {
      setError("Email hoặc mật khẩu không đúng. Vui lòng thử lại.");
    }
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Vui lòng nhập đầy đủ email và mật khẩu.");
      return;
    }

    setLoading(true);
    try {
      const result = await signIn("credentials", {
        email: email.trim(),
        password,
        redirect: false,
        callbackUrl: "/dashboard",
      });

      if (result?.error) {
        setError("Email hoặc mật khẩu không đúng. Vui lòng thử lại.");
      } else if (result?.url) {
        router.push(result.url);
      }
    } catch {
      setError("Đã xảy ra lỗi. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  }

  return (
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
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Đăng nhập</h1>
        <p className="text-sm text-gray-500 text-center">
          Chào mừng trở lại! Tiếp tục hành trình học tập của bạn.
        </p>
      </div>

      {/* Success banner */}
      {justRegistered && (
        <div className="mb-5 flex items-start gap-2 rounded-lg bg-teal-50 border border-teal-200 px-4 py-3 text-sm text-teal-700">
          <svg className="h-4 w-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span>Đăng ký thành công! Hãy đăng nhập để bắt đầu.</span>
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div className="mb-5 flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
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
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-500/20"
          />
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Mật khẩu
            </label>
            <Link
              href="/forgot-password"
              className="text-xs text-teal-600 hover:text-teal-700 hover:underline font-medium"
            >
              Quên mật khẩu?
            </Link>
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 pr-10 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-500/20"
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
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 rounded-lg bg-teal-600 px-4 py-3 text-sm font-semibold text-white shadow-sm shadow-teal-200 transition hover:bg-teal-700 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? "Đang đăng nhập…" : "Đăng nhập"}
        </button>
      </form>

      {/* Divider */}
      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-gray-100" />
        <span className="text-xs text-gray-400 font-medium">hoặc</span>
        <div className="h-px flex-1 bg-gray-100" />
      </div>

      {/* Google OAuth — disabled, coming soon */}
      <div className="relative group">
        <button
          type="button"
          disabled
          aria-disabled="true"
          className="w-full flex items-center justify-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-medium text-gray-400 cursor-not-allowed select-none"
        >
          {/* Google SVG */}
          <svg className="h-4 w-4 opacity-40" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Tiếp tục với Google
        </button>
        {/* Tooltip */}
        <div className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-800 px-3 py-1.5 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
          Sắp ra mắt
          <span className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-gray-800" />
        </div>
      </div>

      {/* Register link */}
      <p className="mt-6 text-center text-sm text-gray-500">
        Chưa có tài khoản?{" "}
        <Link href="/register" className="font-semibold text-teal-600 hover:text-teal-700 hover:underline">
          Đăng ký
        </Link>
      </p>
    </div>
  );
}

/* ─── Skeleton shown while Suspense resolves search params ─────────────────── */
function LoginSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-xl shadow-teal-100/50 border border-teal-100/60 px-8 py-10 animate-pulse">
      <div className="flex flex-col items-center mb-8">
        <div className="h-10 w-10 rounded-xl bg-teal-100 mb-6" />
        <div className="h-6 w-32 rounded bg-gray-100 mb-2" />
        <div className="h-4 w-52 rounded bg-gray-100" />
      </div>
      <div className="space-y-5">
        <div className="h-10 rounded-lg bg-gray-100" />
        <div className="h-10 rounded-lg bg-gray-100" />
        <div className="h-11 rounded-lg bg-teal-100" />
      </div>
    </div>
  );
}

/* ─── Page export ───────────────────────────────────────────────────────────── */
export default function LoginPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-orange-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Suspense fallback={<LoginSkeleton />}>
          <LoginForm />
        </Suspense>

        {/* Footer note */}
        <p className="mt-6 text-center text-xs text-gray-400">
          Bằng cách đăng nhập, bạn đồng ý với{" "}
          <Link href="/terms" className="underline hover:text-gray-600">Điều khoản dịch vụ</Link>{" "}
          và{" "}
          <Link href="/privacy" className="underline hover:text-gray-600">Chính sách bảo mật</Link>.
        </p>
      </div>
    </main>
  );
}
