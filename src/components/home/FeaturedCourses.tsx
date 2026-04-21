import Link from "next/link";
import { Star, Clock, PlayCircle } from "lucide-react";
import { mockCourses, formatPrice } from "@/lib/mock-data";

// Chỉ lấy 4 khóa featured đầu tiên
const featured = mockCourses.filter((c) => c.featured).slice(0, 4);

export default function FeaturedCourses() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-12">
          <div>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Khóa học nổi bật
            </h2>
            <p className="text-gray-500 text-lg">Được lựa chọn bởi hàng nghìn học viên.</p>
          </div>
          <Link
            href="/courses"
            className="hidden md:inline-flex text-sm font-semibold text-teal-600 hover:underline"
          >
            Xem tất cả →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featured.map((c) => (
            <Link
              key={c.id}
              href={`/courses/${c.slug}`}
              className="group rounded-2xl bg-white border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
            >
              {/* Thumbnail */}
              <div className={`relative aspect-video bg-gradient-to-br ${c.gradient} flex items-center justify-center`}>
                <PlayCircle className="h-12 w-12 text-white/70 group-hover:text-white transition-colors" />
                {c.badge && (
                  <span className="absolute top-3 left-3 rounded-full bg-orange-500 px-2.5 py-0.5 text-xs font-bold text-white">
                    {c.badge}
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <span className="text-xs text-teal-600 font-semibold uppercase tracking-wide">{c.category}</span>
                <h3 className="font-heading font-semibold text-gray-900 text-sm mt-1 mb-2 line-clamp-2 leading-snug">
                  {c.title}
                </h3>
                <p className="text-xs text-gray-500 mb-3">{c.instructor}</p>

                <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                  <span className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <strong className="text-gray-800">{c.rating}</strong>
                    <span>({c.reviewCount.toLocaleString()})</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />{c.totalDuration}
                  </span>
                </div>

                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                  {c.salePrice ? (
                    <>
                      <span className="font-bold text-gray-900 text-base">{formatPrice(c.salePrice)}</span>
                      <span className="text-xs text-gray-400 line-through">{formatPrice(c.price)}</span>
                    </>
                  ) : (
                    <span className="font-bold text-gray-900 text-base">{formatPrice(c.price)}</span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-10 md:hidden">
          <Link href="/courses" className="inline-flex items-center gap-2 rounded-xl border-2 border-teal-600 px-6 py-3 text-sm font-semibold text-teal-600 hover:bg-teal-50 transition-colors">
            Xem tất cả khóa học →
          </Link>
        </div>
      </div>
    </section>
  );
}
