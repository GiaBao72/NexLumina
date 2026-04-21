"use client";

import { useState, useMemo, useEffect, useCallback, Suspense } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { levelLabel, formatPrice } from "@/lib/mock-data";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Star, Clock, Search, SlidersHorizontal, X, Users, BookOpen, ArrowUpDown, PlayCircle } from "lucide-react";

interface ApiCourse {
  id: string; title: string; slug: string; description: string;
  thumbnail: string | null; price: number; salePrice: number | null;
  level: string; status: string; featured: boolean;
  totalLessons: number; totalDuration: number;
  instructor: { name: string | null; image: string | null };
  category: { name: string; slug: string };
  _count: { enrollments: number; reviews: number };
}
interface ApiCategory { id: string; name: string; slug: string; icon: string | null }

function CourseSkeleton() {
  return (
    <div className="rounded-2xl bg-white border border-gray-100 overflow-hidden animate-pulse">
      <div className="aspect-video bg-gray-200" />
      <div className="p-4 space-y-2">
        <div className="h-3 bg-gray-200 rounded w-1/3" />
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
        <div className="h-px bg-gray-100 my-2" />
        <div className="flex justify-between"><div className="h-5 bg-gray-200 rounded w-1/4" /><div className="h-4 bg-gray-200 rounded w-1/5" /></div>
      </div>
    </div>
  );
}

function CoursesPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [courses, setCourses] = useState<ApiCourse[]>([]);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCats, setSelectedCats] = useState<string[]>(() => {
    const cat = searchParams.get("category");
    return cat ? [cat] : [];
  });
  const [selectedLevel, setSelectedLevel] = useState("");
  const [priceFilter, setPriceFilter] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [sortBy, setSortBy] = useState("popular");

  // Fetch courses from API
  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (selectedCats.length === 1) params.set("category", selectedCats[0]);
      if (sortBy !== "price-asc" && sortBy !== "price-desc") params.set("sort", sortBy);
      const res = await fetch(`/api/courses?${params}`);
      if (res.ok) {
        const data = await res.json();
        setCourses(data.courses ?? []);
      }
    } catch {}
    setLoading(false);
  }, [search, selectedCats, sortBy]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(fetchCourses, 300);
    return () => clearTimeout(t);
  }, [fetchCourses]);

  // Fetch categories once
  useEffect(() => {
    fetch("/api/courses?sort=newest")
      .then(r => r.ok ? r.json() : { courses: [] })
      .then(data => {
        const cats: Record<string, ApiCategory> = {};
        (data.courses ?? []).forEach((c: ApiCourse) => {
          if (!cats[c.category.slug]) cats[c.category.slug] = { id: c.category.slug, name: c.category.name, slug: c.category.slug, icon: null };
        });
        setCategories(Object.values(cats));
      })
      .catch(() => {});
  }, []);

  // Client-side sort for price
  const sorted = useMemo(() => {
    let list = [...courses];
    if (selectedLevel) list = list.filter(c => c.level === selectedLevel);
    if (priceFilter === "free") list = list.filter(c => c.price === 0);
    if (priceFilter === "paid") list = list.filter(c => c.price > 0);
    if (sortBy === "price-asc") list.sort((a, b) => (a.salePrice ?? a.price) - (b.salePrice ?? b.price));
    if (sortBy === "price-desc") list.sort((a, b) => (b.salePrice ?? b.price) - (a.salePrice ?? a.price));
    if (sortBy === "rating") list.sort((a, b) => b._count.reviews - a._count.reviews);
    return list;
  }, [courses, selectedLevel, priceFilter, sortBy]);

  const toggleCat = (slug: string) => {
    setSelectedCats(prev => prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug]);
  };

  const hasFilter = selectedCats.length > 0 || selectedLevel || priceFilter;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-br from-gray-950 to-teal-950 text-white py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4">
              Tất cả <span className="text-teal-400">khóa học</span>
            </h1>
            <p className="text-gray-400 text-lg mb-8 max-w-xl mx-auto">
              Khóa học chất lượng cao từ các chuyên gia hàng đầu
            </p>
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm khóa học, giảng viên..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-teal-400 transition-colors"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          {/* Mobile filter toggle */}
          <div className="flex items-center justify-between mb-6 lg:hidden">
            <span className="text-sm text-gray-600">{sorted.length} khóa học</span>
            <button
              onClick={() => setShowFilter(!showFilter)}
              className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Bộ lọc {hasFilter && <span className="ml-1 rounded-full bg-teal-600 text-white text-xs w-5 h-5 flex items-center justify-center">{selectedCats.length + (selectedLevel ? 1 : 0) + (priceFilter ? 1 : 0)}</span>}
            </button>
          </div>

          <div className="flex gap-8">
            {/* Sidebar */}
            <aside className={`${showFilter ? "block" : "hidden"} lg:block w-full lg:w-64 flex-shrink-0`}>
              <div className="sticky top-24 space-y-6">
                {hasFilter && (
                  <button
                    onClick={() => { setSelectedCats([]); setSelectedLevel(""); setPriceFilter(""); }}
                    className="text-sm text-teal-600 hover:underline flex items-center gap-1"
                  >
                    <X className="h-3 w-3" /> Xóa bộ lọc
                  </button>
                )}

                {/* Categories */}
                {categories.length > 0 && (
                  <div>
                    <h3 className="font-heading font-semibold text-gray-900 mb-3">Lĩnh vực</h3>
                    <div className="space-y-2">
                      {categories.map((cat) => (
                        <label key={cat.slug} className="flex items-center gap-2.5 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={selectedCats.includes(cat.slug)}
                            onChange={() => toggleCat(cat.slug)}
                            className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                          />
                          <span className="text-sm text-gray-700 group-hover:text-teal-600 transition-colors">
                            {cat.icon} {cat.name}
                          </span>
                          <span className="ml-auto text-xs text-gray-400">
                            {courses.filter(c => c.category.slug === cat.slug).length}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Level */}
                <div>
                  <h3 className="font-heading font-semibold text-gray-900 mb-3">Trình độ</h3>
                  <div className="space-y-2">
                    {(["", "BEGINNER", "INTERMEDIATE", "ADVANCED"] as const).map((lvl) => (
                      <label key={lvl} className="flex items-center gap-2.5 cursor-pointer group">
                        <input
                          type="radio"
                          name="level"
                          checked={selectedLevel === lvl}
                          onChange={() => setSelectedLevel(lvl)}
                          className="h-4 w-4 border-gray-300 text-teal-600 focus:ring-teal-500"
                        />
                        <span className="text-sm text-gray-700 group-hover:text-teal-600 transition-colors">
                          {lvl === "" ? "Tất cả" : levelLabel[lvl]}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price */}
                <div>
                  <h3 className="font-heading font-semibold text-gray-900 mb-3">Giá</h3>
                  <div className="space-y-2">
                    {[["", "Tất cả"], ["free", "Miễn phí"], ["paid", "Có phí"]].map(([val, label]) => (
                      <label key={val} className="flex items-center gap-2.5 cursor-pointer group">
                        <input
                          type="radio"
                          name="price"
                          checked={priceFilter === val}
                          onChange={() => setPriceFilter(val)}
                          className="h-4 w-4 border-gray-300 text-teal-600 focus:ring-teal-500"
                        />
                        <span className="text-sm text-gray-700 group-hover:text-teal-600 transition-colors">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </aside>

            {/* Grid */}
            <div className="flex-1 min-w-0">
              <div className="hidden lg:flex items-center justify-between mb-6">
                <span className="text-sm text-gray-600">
                  <strong className="text-gray-900">{sorted.length}</strong> khóa học
                </span>
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="h-4 w-4 text-gray-400" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-teal-500 bg-white"
                  >
                    <option value="popular">Phổ biến nhất</option>
                    <option value="rating">Đánh giá cao</option>
                    <option value="newest">Mới nhất</option>
                    <option value="price-asc">Giá tăng dần</option>
                    <option value="price-desc">Giá giảm dần</option>
                  </select>
                </div>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => <CourseSkeleton key={i} />)}
                </div>
              ) : sorted.length === 0 ? (
                <div className="text-center py-20">
                  <div className="text-5xl mb-4">🔍</div>
                  <h3 className="font-heading font-semibold text-gray-900 text-xl mb-2">Không tìm thấy khóa học</h3>
                  <p className="text-gray-500 mb-6">Thử thay đổi từ khóa hoặc bộ lọc</p>
                  <button
                    onClick={() => { setSearch(""); setSelectedCats([]); setSelectedLevel(""); setPriceFilter(""); }}
                    className="rounded-xl bg-teal-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 transition-colors"
                  >
                    Xóa bộ lọc
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {sorted.map((course) => (
                    <Link
                      key={course.id}
                      href={`/courses/${course.slug}`}
                      className="group rounded-2xl bg-white border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
                    >
                      {/* Thumbnail */}
                      <div className="relative aspect-video bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center overflow-hidden">
                        {course.thumbnail ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={course.thumbnail} alt={course.title} className="h-full w-full object-cover" />
                        ) : (
                          <div className="text-white/20 text-7xl font-bold select-none">{course.title.charAt(0)}</div>
                        )}
                        {course.featured && (
                          <span className="absolute top-3 left-3 rounded-full px-2.5 py-0.5 text-xs font-bold text-white bg-yellow-500">Nổi bật</span>
                        )}
                        {course.price === 0 && (
                          <span className="absolute top-3 left-3 rounded-full px-2.5 py-0.5 text-xs font-bold text-white bg-green-500">Miễn phí</span>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-4">
                        <span className="text-xs text-teal-600 font-semibold uppercase tracking-wide">{course.category.name}</span>
                        <h3 className="font-heading font-semibold text-gray-900 text-sm mt-1 mb-1.5 line-clamp-2 leading-snug group-hover:text-teal-600 transition-colors">
                          {course.title}
                        </h3>
                        <p className="text-xs text-gray-500 mb-3">{course.instructor.name ?? "NexLumina"}</p>

                        <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                          <span className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span>({course._count.reviews.toLocaleString()})</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {course._count.enrollments.toLocaleString()}
                          </span>
                          <span className="flex items-center gap-1 ml-auto">
                            <BookOpen className="h-3 w-3" />
                            {course.totalLessons} bài
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                          <div className="flex items-center gap-2">
                            <span className={`font-bold text-base ${course.price === 0 ? "text-green-600" : "text-gray-900"}`}>
                              {formatPrice(course.salePrice !== null ? course.salePrice : course.price)}
                            </span>
                            {course.salePrice !== null && course.price > 0 && (
                              <span className="text-xs text-gray-400 line-through">{formatPrice(course.price)}</span>
                            )}
                          </div>
                          <span className="text-xs rounded-full bg-gray-100 text-gray-600 px-2 py-0.5">
                            {levelLabel[course.level as keyof typeof levelLabel] ?? course.level}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function CoursesPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><div className="text-gray-400">Đang tải...</div></div>}>
      <CoursesPageInner />
    </Suspense>
  );
}
