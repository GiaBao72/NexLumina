import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Trần Minh Khoa",
    role: "Frontend Developer tại FPT Software",
    avatar: "TMK",
    rating: 5,
    color: "from-teal-500 to-teal-700",
    content:
      "Sau 3 tháng học React & Next.js trên NexLumina, mình đã pass được phỏng vấn vào FPT. Nội dung thực chiến, giảng viên nhiệt tình, hoàn toàn xứng đáng với số tiền bỏ ra.",
  },
  {
    name: "Nguyễn Thị Mai",
    role: "UI/UX Designer Freelance",
    avatar: "NTM",
    rating: 5,
    color: "from-purple-500 to-purple-700",
    content:
      "Khóa Figma của NexLumina giúp mình từ không biết gì về design đến nhận được dự án freelance đầu tiên chỉ sau 2 tháng. Cực kỳ chi tiết và thực tế.",
  },
  {
    name: "Lê Văn Đức",
    role: "Data Analyst tại Vingroup",
    avatar: "LVD",
    rating: 5,
    color: "from-orange-500 to-orange-600",
    content:
      "Python & Data Science trên NexLumina là lựa chọn tốt nhất mình từng làm. Từ một kế toán viên, mình chuyển sang làm data analyst sau 6 tháng học nghiêm túc.",
  },
];

export default function TestimonialsSection() {
  return (
    <section className="py-20 bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-4">
            Học viên nói gì về chúng tôi
          </h2>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Hơn 12.000 học viên đã thay đổi sự nghiệp với NexLumina.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="rounded-2xl bg-gray-900 border border-gray-800 p-6 flex flex-col gap-4 hover:border-teal-800 transition-colors"
            >
              <Quote className="h-8 w-8 text-teal-500 opacity-60" />
              <p className="text-gray-300 text-sm leading-relaxed flex-1">{t.content}</p>
              <div className="flex items-center gap-1 mb-2">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-gray-800">
                <div className={`h-10 w-10 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-xs font-bold text-white`}>
                  {t.avatar}
                </div>
                <div>
                  <p className="font-semibold text-white text-sm">{t.name}</p>
                  <p className="text-xs text-gray-500">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
