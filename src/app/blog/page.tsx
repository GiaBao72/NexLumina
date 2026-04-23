"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpen, Clock, Tag, ArrowRight } from "lucide-react";

const POSTS = [
  {
    slug: "lo-trinh-hoc-lap-trinh-tu-zero",
    category: "Lập trình",
    tag: "Hướng dẫn",
    title: "Lộ trình học lập trình từ zero: Bắt đầu từ đâu?",
    excerpt:
      "Bạn chưa biết gì về lập trình và muốn bắt đầu? Bài viết này tổng hợp lộ trình thực chiến từ HTML/CSS đến Full-Stack theo thứ tự tối ưu nhất.",
    author: "Minh Khoa",
    date: "15 Tháng 4, 2026",
    readTime: "8 phút",
    cover: "bg-gradient-to-br from-teal-500 to-cyan-400",
  },
  {
    slug: "ui-ux-design-cho-nguoi-moi",
    category: "Thiết kế",
    tag: "Mới bắt đầu",
    title: "UI/UX Design cho người mới: Figma hay Adobe XD?",
    excerpt:
      "So sánh chi tiết hai công cụ thiết kế hàng đầu hiện nay, cùng lời khuyên thực tế để bạn chọn đúng công cụ phù hợp với mục tiêu nghề nghiệp.",
    author: "Thu Hà",
    date: "10 Tháng 4, 2026",
    readTime: "6 phút",
    cover: "bg-gradient-to-br from-purple-500 to-pink-400",
  },
  {
    slug: "data-analyst-2026",
    category: "Dữ liệu",
    tag: "Xu hướng",
    title: "Data Analyst 2026: Kỹ năng nào đang được tuyển dụng nhiều nhất?",
    excerpt:
      "Phân tích hơn 500 tin tuyển dụng Data Analyst tại Việt Nam, tổng hợp những kỹ năng, công cụ và mức lương thực tế bạn cần biết trước khi apply.",
    author: "Quốc Bảo",
    date: "5 Tháng 4, 2026",
    readTime: "10 phút",
    cover: "bg-gradient-to-br from-orange-400 to-amber-400",
  },
  {
    slug: "hoc-tieng-anh-thuong-mai-hieu-qua",
    category: "Ngoại ngữ",
    tag: "Kinh nghiệm",
    title: "Học tiếng Anh thương mại hiệu quả trong 3 tháng",
    excerpt:
      "Phương pháp học tiếng Anh B2 Business theo chu trình nghe–nói–đọc–viết, áp dụng được ngay từ tuần đầu tiên dù bạn bận rộn đến đâu.",
    author: "Lan Anh",
    date: "28 Tháng 3, 2026",
    readTime: "7 phút",
    cover: "bg-gradient-to-br from-green-500 to-emerald-400",
  },
  {
    slug: "ai-ml-co-ban-cho-dev",
    category: "AI & ML",
    tag: "Kỹ thuật",
    title: "AI/ML cơ bản cho Developer: Không cần toán cao cấp",
    excerpt:
      "Giải thích trực quan các khái niệm Machine Learning thường gặp dưới góc nhìn của lập trình viên — không cần nền toán chuyên sâu.",
    author: "Trí Dũng",
    date: "20 Tháng 3, 2026",
    readTime: "12 phút",
    cover: "bg-gradient-to-br from-blue-500 to-indigo-400",
  },
  {
    slug: "ky-nang-mem-cho-it",
    category: "Kỹ năng mềm",
    tag: "Phát triển bản thân",
    title: "5 kỹ năng mềm không thể thiếu để thăng tiến trong IT",
    excerpt:
      "Technical skill chỉ là nửa chặng đường. Bài viết phân tích kỹ năng giao tiếp, quản lý thời gian, tư duy phản biện và cách rèn luyện chúng trong công việc hàng ngày.",
    author: "Minh Khoa",
    date: "12 Tháng 3, 2026",
    readTime: "5 phút",
    cover: "bg-gradient-to-br from-rose-500 to-pink-400",
  },
];

const CATEGORIES = ["Tất cả", "Lập trình", "Thiết kế", "Dữ liệu", "AI & ML", "Ngoại ngữ", "Kỹ năng mềm"];

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState("Tất cả");

  const filtered =
    activeCategory === "Tất cả"
      ? POSTS
      : POSTS.filter((p) => p.category === activeCategory);

  const featured = filtered[0];
  const sideCards = filtered.slice(1, 3);
  const restCards = filtered.slice(3);

  return (
    <main className="min-h-screen bg-[#F0FDFA]">
      {/* Hero */}
      <section className="bg-gradient-to-br from-teal-700 via-teal-600 to-cyan-500 py-20 px-4">
        <div className="mx-auto max-w-4xl text-center text-white">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium mb-6">
            <BookOpen className="h-4 w-4" />
            Blog NexLumina
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">
            Kiến thức & Kinh nghiệm học tập
          </h1>
          <p className="text-teal-100 text-lg max-w-2xl mx-auto">
            Bài viết thực chiến, hướng dẫn chi tiết và xu hướng công nghệ mới nhất từ đội ngũ NexLumina.
          </p>
        </div>
      </section>

      {/* Category Filter */}
      <section className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2 overflow-x-auto py-3 scrollbar-hide">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  cat === activeCategory
                    ? "bg-teal-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-teal-50 hover:text-teal-700"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Posts Grid */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="text-base font-medium">Chưa có bài viết trong lĩnh vực này.</p>
            <button
              onClick={() => setActiveCategory("Tất cả")}
              className="mt-4 text-sm text-teal-600 hover:underline"
            >
              Xem tất cả bài viết
            </button>
          </div>
        ) : (
          <>
            {/* Featured */}
            <div className="mb-10">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-teal-600 mb-6">
                Bài nổi bật
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Big card */}
                {featured && (
                  <Link
                    href={`/blog/${featured.slug}`}
                    className="lg:col-span-3 group rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow border border-gray-100"
                  >
                    <div className={`h-52 w-full ${featured.cover} flex items-center justify-center`}>
                      <BookOpen className="h-14 w-14 text-white/60" />
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="rounded-full bg-teal-50 text-teal-700 text-xs font-semibold px-3 py-1">
                          {featured.category}
                        </span>
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {featured.readTime}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-teal-700 transition-colors">
                        {featured.title}
                      </h3>
                      <p className="text-gray-500 text-sm line-clamp-2">{featured.excerpt}</p>
                      <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
                        <span>{featured.author} · {featured.date}</span>
                        <span className="flex items-center gap-1 text-teal-600 font-medium group-hover:gap-2 transition-all">
                          Đọc tiếp <ArrowRight className="h-3 w-3" />
                        </span>
                      </div>
                    </div>
                  </Link>
                )}

                {/* Side cards */}
                {sideCards.length > 0 && (
                  <div className="lg:col-span-2 flex flex-col gap-4">
                    {sideCards.map((post) => (
                      <Link
                        key={post.slug}
                        href={`/blog/${post.slug}`}
                        className="group flex gap-4 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-4"
                      >
                        <div className={`shrink-0 h-20 w-20 rounded-xl ${post.cover} flex items-center justify-center`}>
                          <BookOpen className="h-8 w-8 text-white/60" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-semibold text-teal-700">{post.category}</span>
                          <h3 className="text-sm font-bold text-gray-900 mt-0.5 line-clamp-2 group-hover:text-teal-700 transition-colors">
                            {post.title}
                          </h3>
                          <p className="mt-1 text-xs text-gray-400 flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {post.readTime} · {post.date}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Rest */}
            {restCards.length > 0 && (
              <>
                <h2 className="text-sm font-semibold uppercase tracking-widest text-teal-600 mb-6">
                  Tất cả bài viết
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {restCards.map((post) => (
                    <Link
                      key={post.slug}
                      href={`/blog/${post.slug}`}
                      className="group rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                    >
                      <div className={`h-40 w-full ${post.cover} flex items-center justify-center`}>
                        <BookOpen className="h-10 w-10 text-white/60" />
                      </div>
                      <div className="p-5">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="rounded-full bg-teal-50 text-teal-700 text-xs font-semibold px-3 py-1 flex items-center gap-1">
                            <Tag className="h-3 w-3" /> {post.tag}
                          </span>
                        </div>
                        <h3 className="font-bold text-gray-900 text-sm line-clamp-2 group-hover:text-teal-700 transition-colors">
                          {post.title}
                        </h3>
                        <p className="mt-2 text-xs text-gray-500 line-clamp-2">{post.excerpt}</p>
                        <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
                          <span>{post.author}</span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {post.readTime}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </>
        )}

        {/* Coming soon notice */}
        <div className="mt-12 rounded-2xl bg-teal-50 border border-teal-100 p-8 text-center">
          <p className="text-teal-700 font-semibold text-lg mb-1">Thêm bài viết đang được chuẩn bị</p>
          <p className="text-teal-600 text-sm">
            Đăng ký nhận tin ở footer để nhận thông báo bài viết mới nhất.
          </p>
        </div>
      </section>
    </main>
  );
}
