"use client";

import Link from "next/link";
import { BookOpen, Share2, Globe, Send } from "lucide-react";
import { useState } from "react";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const khamPhaLinks: { label: string; href: string }[] = [
  { label: "Khóa học", href: "/courses" },
  { label: "Lộ trình học", href: "/courses" },
  { label: "Blog", href: "/courses" },
  { label: "Giảng viên", href: "/courses" },
];

const hoTroLinks: { label: string; href: string }[] = [
  { label: "Trung tâm trợ giúp", href: "/" },
  { label: "Chính sách hoàn tiền", href: "/" },
  { label: "Điều khoản dịch vụ", href: "/terms" },
  { label: "Liên hệ", href: "/" },
];

export default function Footer() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!EMAIL_REGEX.test(email.trim())) {
      setError("Vui lòng nhập email hợp lệ.");
      return;
    }
    setError("");
    setSubmitted(true);
  }

  return (
    <footer className="bg-gray-950 text-gray-400">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 font-heading font-bold text-xl mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-600">
                <BookOpen className="h-4 w-4 text-white" />
              </div>
              <span className="text-white">Nex<span className="text-teal-400">Lumina</span></span>
            </Link>
            <p className="text-sm leading-relaxed text-gray-500">
              Nền tảng học trực tuyến chất lượng cao, giúp bạn làm chủ kỹ năng và phát triển sự nghiệp.
            </p>
            <div className="mt-4 flex gap-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="hover:text-teal-400 transition-colors"
              >
                <Share2 className="h-5 w-5" />
              </a>
              <a
                href="https://x.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X (Twitter)"
                className="hover:text-teal-400 transition-colors"
              >
                <Globe className="h-5 w-5" />
              </a>
              <a
                href="https://t.me"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Telegram"
                className="hover:text-teal-400 transition-colors"
              >
                <Send className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Khám phá */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Khám phá</h4>
            <ul className="space-y-2 text-sm">
              {khamPhaLinks.map(({ label, href }) => (
                <li key={label}>
                  <Link href={href} className="hover:text-teal-400 transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Hỗ trợ */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Hỗ trợ</h4>
            <ul className="space-y-2 text-sm">
              {hoTroLinks.map(({ label, href }) => (
                <li key={label}>
                  <Link href={href} className="hover:text-teal-400 transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Nhận tin mới</h4>
            <p className="text-sm text-gray-500 mb-3">Cập nhật khóa học và ưu đãi mới nhất.</p>

            {submitted ? (
              <p className="text-sm text-teal-400 font-medium">
                Cảm ơn! Chúng tôi sẽ gửi tin tức mới nhất.
              </p>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError("");
                    }}
                    placeholder="Email của bạn"
                    className="flex-1 rounded-lg bg-gray-800 border border-gray-700 px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-teal-500"
                  />
                  <button
                    type="submit"
                    className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700 transition-colors"
                  >
                    Gửi
                  </button>
                </div>
                {error && (
                  <p className="text-xs text-red-400">{error}</p>
                )}
              </form>
            )}
          </div>
        </div>

        <div className="mt-12 border-t border-gray-800 pt-6 text-center text-xs text-gray-600">
          © {new Date().getFullYear()} NexLumina. Tất cả quyền được bảo lưu.
        </div>
      </div>
    </footer>
  );
}
