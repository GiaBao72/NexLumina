import Link from "next/link";

const categories = [
  { name: "Lập trình Web", icon: "💻", count: 120, slug: "lap-trinh-web", color: "bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-100" },
  { name: "Thiết kế UI/UX", icon: "🎨", count: 85, slug: "thiet-ke", color: "bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-100" },
  { name: "Marketing", icon: "📣", count: 67, slug: "marketing", color: "bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-100" },
  { name: "Data Science", icon: "📊", count: 54, slug: "data-science", color: "bg-green-50 hover:bg-green-100 text-green-700 border-green-100" },
  { name: "Mobile App", icon: "📱", count: 43, slug: "mobile-app", color: "bg-pink-50 hover:bg-pink-100 text-pink-700 border-pink-100" },
  { name: "AI & Machine Learning", icon: "🤖", count: 38, slug: "ai-ml", color: "bg-yellow-50 hover:bg-yellow-100 text-yellow-700 border-yellow-100" },
  { name: "Kinh doanh", icon: "💼", count: 72, slug: "kinh-doanh", color: "bg-teal-50 hover:bg-teal-100 text-teal-700 border-teal-100" },
  { name: "Ngoại ngữ", icon: "🌐", count: 61, slug: "ngoai-ngu", color: "bg-red-50 hover:bg-red-100 text-red-700 border-red-100" },
];

export default function CategoriesSection() {
  return (
    <section className="py-20 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Khám phá theo lĩnh vực
          </h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            Tìm khóa học phù hợp với mục tiêu của bạn từ hàng trăm chủ đề đa dạng.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/courses?category=${cat.slug}`}
              className={`flex flex-col items-center gap-3 rounded-2xl border p-5 transition-all hover:-translate-y-1 hover:shadow-md ${cat.color}`}
            >
              <span className="text-4xl">{cat.icon}</span>
              <span className="font-semibold text-sm text-center leading-snug">{cat.name}</span>
              <span className="text-xs opacity-70">{cat.count} khóa học</span>
            </Link>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 rounded-xl border-2 border-teal-600 px-6 py-3 text-sm font-semibold text-teal-600 hover:bg-teal-50 transition-colors"
          >
            Xem tất cả lĩnh vực →
          </Link>
        </div>
      </div>
    </section>
  );
}
