const steps = [
  {
    step: "01",
    icon: "🔍",
    title: "Chọn khóa học",
    desc: "Duyệt qua 500+ khóa học từ nhiều lĩnh vực. Xem preview miễn phí trước khi đăng ký.",
    color: "bg-teal-50 border-teal-200",
    stepColor: "text-teal-600",
  },
  {
    step: "02",
    icon: "💳",
    title: "Đăng ký & thanh toán",
    desc: "Thanh toán an toàn qua Stripe. Trả một lần, học trọn đời. Hoàn tiền trong 30 ngày.",
    color: "bg-orange-50 border-orange-200",
    stepColor: "text-orange-600",
  },
  {
    step: "03",
    icon: "🎬",
    title: "Học theo tốc độ của bạn",
    desc: "Video HD chất lượng cao, xem lại không giới hạn. Học trên mọi thiết bị, mọi lúc mọi nơi.",
    color: "bg-blue-50 border-blue-200",
    stepColor: "text-blue-600",
  },
  {
    step: "04",
    icon: "🏆",
    title: "Nhận chứng chỉ",
    desc: "Hoàn thành khóa học và nhận chứng chỉ được công nhận. Chia sẻ lên LinkedIn dễ dàng.",
    color: "bg-green-50 border-green-200",
    stepColor: "text-green-600",
  },
];

export default function HowItWorks() {
  return (
    <section className="py-20 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Chỉ 4 bước để bắt đầu
          </h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            Đơn giản, nhanh chóng và hiệu quả. Hàng nghìn người đã thay đổi sự nghiệp với NexLumina.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s, i) => (
            <div
              key={s.step}
              className={`relative rounded-2xl border p-6 ${s.color} flex flex-col gap-4`}
            >
              <div className="flex items-center justify-between">
                <span className="text-4xl">{s.icon}</span>
                <span className={`font-heading text-4xl font-black opacity-20 ${s.stepColor}`}>{s.step}</span>
              </div>
              <div>
                <h3 className="font-heading font-semibold text-gray-900 text-base mb-2">{s.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{s.desc}</p>
              </div>
              {/* Connector */}
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 -right-4 text-gray-300 text-xl z-10">→</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
