"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Category } from "@/types";

// Màu fallback theo index nếu DB không có color
const COLORS = [
  "bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-100",
  "bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-100",
  "bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-100",
  "bg-green-50 hover:bg-green-100 text-green-700 border-green-100",
  "bg-pink-50 hover:bg-pink-100 text-pink-700 border-pink-100",
  "bg-yellow-50 hover:bg-yellow-100 text-yellow-700 border-yellow-100",
  "bg-teal-50 hover:bg-teal-100 text-teal-700 border-teal-100",
  "bg-red-50 hover:bg-red-100 text-red-700 border-red-100",
];

// Fallback tĩnh hiển thị trong khi chờ fetch (skeleton tránh layout shift)
const FALLBACK: Category[] = Array.from({ length: 8 }, (_, i) => ({
  id: `placeholder-${i}`,
  name: "",
  slug: "",
  description: null,
  icon: null,
  color: null,
  _count: { courses: 0 },
}));

export default function CategoriesSection() {
  const [categories, setCategories] = useState<Category[]>(FALLBACK);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => {
        const list: Category[] = d.categories ?? d ?? [];
        if (list.length > 0) setCategories(list);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

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
          {categories.map((cat, idx) => {
            const colorClass = cat.color ?? COLORS[idx % COLORS.length];

            if (loading || !cat.slug) {
              return (
                <div
                  key={cat.id}
                  className="flex flex-col items-center gap-3 rounded-2xl border p-5 bg-gray-50 animate-pulse"
                >
                  <div className="h-10 w-10 rounded-full bg-gray-200" />
                  <div className="h-3 w-20 rounded bg-gray-200" />
                  <div className="h-2 w-12 rounded bg-gray-200" />
                </div>
              );
            }

            return (
              <Link
                key={cat.id}
                href={`/courses?category=${cat.slug}`}
                className={`flex flex-col items-center gap-3 rounded-2xl border p-5 transition-all hover:-translate-y-1 hover:shadow-md ${colorClass}`}
              >
                <span className="text-4xl">{cat.icon ?? "📁"}</span>
                <span className="font-semibold text-sm text-center leading-snug">
                  {cat.name}
                </span>
                <span className="text-xs opacity-70">
                  {cat._count?.courses ?? 0} khóa học
                </span>
              </Link>
            );
          })}
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
