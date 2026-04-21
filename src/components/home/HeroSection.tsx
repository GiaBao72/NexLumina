"use client";

import Link from "next/link";
import { ArrowRight, PlayCircle, Star } from "lucide-react";
import { motion } from "framer-motion";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-gray-950 via-gray-900 to-teal-950 text-white">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-teal-500/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-orange-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 md:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-teal-500/10 border border-teal-500/20 px-4 py-1.5 text-sm text-teal-400 font-medium mb-6">
              <Star className="h-3.5 w-3.5 fill-teal-400" />
              Nền tảng học #1 Việt Nam
            </div>

            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight mb-6">
              Học kỹ năng{" "}
              <span className="bg-gradient-to-r from-teal-400 to-teal-300 bg-clip-text text-transparent">
                thực chiến
              </span>{" "}
              từ chuyên gia hàng đầu
            </h1>

            <p className="text-lg text-gray-400 leading-relaxed mb-8 max-w-lg">
              Hơn <strong className="text-white">500+ khóa học</strong> chất lượng cao về lập trình, thiết kế, kinh doanh và marketing. Học theo tốc độ của bạn, chứng chỉ được công nhận.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/courses"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-6 py-3.5 text-base font-semibold text-white hover:bg-teal-500 transition-colors shadow-lg shadow-teal-900/30"
              >
                Khám phá khóa học
                <ArrowRight className="h-4 w-4" />
              </Link>
              <button className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-700 px-6 py-3.5 text-base font-semibold text-gray-300 hover:bg-gray-800 transition-colors">
                <PlayCircle className="h-5 w-5 text-teal-400" />
                Xem demo miễn phí
              </button>
            </div>

            {/* Social proof */}
            <div className="mt-10 flex items-center gap-6">
              <div className="flex -space-x-2">
                {["A", "B", "C", "D"].map((l, i) => (
                  <div key={i} className="h-9 w-9 rounded-full border-2 border-gray-900 bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center text-xs font-bold text-white">
                    {l}
                  </div>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1 mb-0.5">
                  {[1,2,3,4,5].map(i => <Star key={i} className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />)}
                  <span className="text-sm font-semibold text-white ml-1">4.9</span>
                </div>
                <p className="text-xs text-gray-500">+12,000 học viên đang học</p>
              </div>
            </div>
          </motion.div>

          {/* Right — Course card preview */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            <div className="relative rounded-2xl overflow-hidden bg-gray-800/50 border border-gray-700/50 backdrop-blur-sm p-6 shadow-2xl">
              <div className="aspect-video rounded-xl bg-gradient-to-br from-teal-800 to-teal-600 flex items-center justify-center mb-5">
                <PlayCircle className="h-16 w-16 text-white/80" />
              </div>
              <h3 className="font-heading font-semibold text-white text-lg mb-1">
                React & Next.js từ 0 đến Pro
              </h3>
              <p className="text-sm text-gray-400 mb-4">42 bài học · 18 giờ · Cập nhật 2025</p>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-2xl font-bold text-white">1.299.000₫</span>
                  <span className="ml-2 text-sm text-gray-500 line-through">2.599.000₫</span>
                </div>
                <span className="rounded-full bg-orange-500 px-3 py-1 text-xs font-bold text-white">-50%</span>
              </div>
              <button className="mt-4 w-full rounded-xl bg-teal-600 py-3 text-sm font-semibold text-white hover:bg-teal-500 transition-colors">
                Đăng ký ngay
              </button>
            </div>

            {/* Floating badge */}
            <div className="absolute -bottom-4 -left-6 rounded-xl bg-white shadow-xl p-3 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center text-lg">🎓</div>
              <div>
                <p className="text-xs font-semibold text-gray-900">Hoàn thành khoá học</p>
                <p className="text-xs text-gray-500">Nhận chứng chỉ ngay</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
