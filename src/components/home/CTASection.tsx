import Link from "next/link";

export default function CTASection() {
  return (
    <section className="py-20 bg-gradient-to-br from-teal-600 to-teal-800 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
      </div>
      <div className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
        <div className="text-5xl mb-6">🚀</div>
        <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-4">
          Bắt đầu hành trình học của bạn ngay hôm nay
        </h2>
        <p className="text-teal-100 text-lg mb-8 max-w-xl mx-auto">
          Tham gia cùng 12.000+ học viên đang học tại NexLumina. Đăng ký miễn phí, không cần thẻ tín dụng.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/register"
            className="rounded-xl bg-white px-8 py-3.5 text-base font-bold text-teal-700 hover:bg-teal-50 transition-colors shadow-lg"
          >
            Đăng ký miễn phí
          </Link>
          <Link
            href="/courses"
            className="rounded-xl border-2 border-white/50 px-8 py-3.5 text-base font-semibold text-white hover:bg-white/10 transition-colors"
          >
            Xem khóa học
          </Link>
        </div>
        <p className="mt-5 text-teal-200 text-xs">✓ Miễn phí mãi mãi &nbsp;·&nbsp; ✓ Không spam &nbsp;·&nbsp; ✓ Hủy bất cứ lúc nào</p>
      </div>
    </section>
  );
}
