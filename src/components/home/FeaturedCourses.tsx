"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Star, Clock, PlayCircle } from "lucide-react";
import type { Course } from "@/types";

function formatPrice(price: number) {
  return price === 0 ? "Miễn phí" : price.toLocaleString("vi-VN") + "₫";
}

export default function FeaturedCourses() {
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    fetch("/api/courses?featured=true&limit=4")
      .then((r) => r.json())
      .then((d) => {
        if (d.courses) setCourses(d.courses.slice(0, 4));
      })
      .catch(() => {});
  }, []);

  const GRADIENTS = [
    "from-blue-600 to-teal-500",
    "from-purple-600 to-pink-500",
    "from-green-600 to-teal-500",
    "from-violet-600 to-purple-700",
    "from-orange-500 to-red-500",
    "from-sky-500 to-blue-600",
  ];

  return (
    <section id="featured-courses" className="py-20 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-12">
          <div>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Khóa học nổi bật
            </h2>
            <p className="text-gray-500 text-lg">Được lựa chọn bởi hàng nghìn học viên.</p>
          </div>
          <Link href="/courses" className="hidden md:inline-flex text-sm font-semibold text-teal-600 hover:underline">
            Xem tất cả →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {courses.length === 0
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-2xl bg-white border border-gray-100 overflow-hidden animate-pulse">
                  <div className="aspect-video bg-gray-200" />
                  <div className="p-4 space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-1/3" />
                    <div className="h-4 bg-gray-200 rounded w-full" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              ))
            : courses.map((c, idx) => {
                const rating = c.fakeRating ?? 4.8;
                const reviewCount = c.fakeReviews ?? c._count?.reviews ?? 0;
                const grad = GRADIENTS[idx % GRADIENTS.length];
                return (
                  <Link
                    key={c.id}
                    href={`/courses/${c.slug}`}
                    className="group rounded-2xl bg-white border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
                  >
                    <div className={`relative aspect-video bg-gradient-to-br ${grad} flex items-center justify-center`}>
                      {c.thumbnail ? (
                        <img src={c.thumbnail} alt={c.title} className="absolute inset-0 w-full h-full object-cover" />
                      ) : (
                        <PlayCircle className="h-12 w-12 text-white/70 group-hover:text-white transition-colors" />
                      )}
                      {c.badge && (
                        <span className="absolute top-3 left-3 rounded-full bg-orange-500 px-2.5 py-0.5 text-xs font-bold text-white">
                          {c.badge}
                        </span>
                      )}
                    </div>
                    <div className="p-4">
                      <span className="text-xs text-teal-600 font-semibold uppercase tracking-wide">
                        {c.category?.name}
                      </span>
                      <h3 className="font-heading font-semibold text-gray-900 text-sm mt-1 mb-2 line-clamp-2 leading-snug">
                        {c.title}
                      </h3>
                      <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <strong className="text-gray-800">{rating}</strong>
                          {reviewCount > 0 && <span>({reviewCount.toLocaleString()})</span>}
                        </span>
                        {c.totalDuration && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />{c.totalDuration}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                        {c.salePrice != null && c.salePrice > 0 ? (
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
                );
              })}
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
