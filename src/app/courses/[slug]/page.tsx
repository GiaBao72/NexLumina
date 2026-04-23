"use client";

import React, { useState, use, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { formatPrice } from "@/lib/mock-data";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useCart } from "@/context/CartContext";
import {
  Star, Clock, Users, PlayCircle, Check, ChevronDown,
  ChevronRight, BookOpen, Award, Globe, BarChart2,
  ShoppingCart, Zap, Heart, Share2, Lock, ChevronLeft,
  Monitor, Smartphone, Infinity, FileText, MessageSquare,
  AlertCircle,
} from "lucide-react";

/* ─── Types ─────────────────────────────────────────────────────────────────── */
interface ApiLesson {
  id: string; slug: string; title: string; duration: number; isFree: boolean; bunnyVideoId: string | null;
}
interface ApiSection {
  id: string; title: string; order: number;
  lessons: ApiLesson[];
}
interface ApiCourse {
  id: string; slug: string; title: string; description: string | null;
  thumbnail: string | null; previewVideo: string | null;
  price: number; salePrice: number | null;
  level: string; language: string; status: string;
  fakeRating: number | null; fakeReviews: number | null; fakeStudents: number | null;
  whatYouLearn: string[];
  instructor: { id: string; name: string | null; image: string | null } | null;
  category: { id: string; name: string; slug: string } | null;
  sections: ApiSection[];
  enrollments: { userId: string }[];
  _count: { enrollments: number; reviews: number };
}

const levelLabel: Record<string, string> = {
  BEGINNER: "Cơ bản", INTERMEDIATE: "Trung cấp", ADVANCED: "Nâng cao", ALL_LEVELS: "Mọi trình độ",
};

/* ─── Sub-components ─────────────────────────────────────────────────────────── */
function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} className={`h-3.5 w-3.5 ${s <= rating ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200"}`} />
      ))}
    </div>
  );
}

function fmtDuration(sec: number): string {
  if (!sec) return "0:00";
  const m = Math.floor(sec / 60), s = sec % 60;
  if (m >= 60) return `${Math.floor(m / 60)}h${m % 60 > 0 ? ` ${m % 60}p` : ""}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function SectionAccordion({ section, open, onToggle, courseSlug, enrolled }: {
  section: ApiSection; open: boolean; onToggle: () => void; courseSlug: string; enrolled: boolean;
}) {
  const totalSec = section.lessons.reduce((a, l) => a + (l.duration || 0), 0);
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button onClick={onToggle} className="w-full flex items-center justify-between px-4 py-3.5 bg-gray-50 hover:bg-gray-100 transition-colors text-left">
        <div className="flex items-center gap-3">
          <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform flex-shrink-0 ${open ? "rotate-180" : ""}`} />
          <div>
            <p className="font-semibold text-sm text-gray-900">{section.title}</p>
            <p className="text-xs text-gray-500 mt-0.5">{section.lessons.length} bài · {fmtDuration(totalSec)}</p>
          </div>
        </div>
      </button>
      {open && (
        <ul className="divide-y divide-gray-100">
          {section.lessons.map((lesson) => {
            const canView = lesson.isFree || enrolled;
            return (
              <li key={lesson.id}>
                {canView ? (
                  <Link href={`/learn/${courseSlug}/${lesson.slug}`} className="flex items-center gap-3 px-4 py-3 hover:bg-teal-50 transition-colors group">
                    <div className="flex-shrink-0 h-7 w-7 rounded-full bg-teal-50 group-hover:bg-teal-100 flex items-center justify-center transition-colors">
                      <PlayCircle className="h-3.5 w-3.5 text-teal-600" />
                    </div>
                    <span className="text-sm text-gray-700 flex-1 group-hover:text-teal-700 transition-colors">{lesson.title}</span>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {lesson.isFree && <span className="text-xs bg-teal-100 text-teal-700 rounded px-1.5 py-0.5 font-medium">Miễn phí</span>}
                      <span className="text-xs text-gray-400">{fmtDuration(lesson.duration)}</span>
                    </div>
                  </Link>
                ) : (
                  <div className="flex items-center gap-3 px-4 py-3">
                    <div className="flex-shrink-0 h-7 w-7 rounded-full bg-gray-100 flex items-center justify-center">
                      <Lock className="h-3.5 w-3.5 text-gray-400" />
                    </div>
                    <span className="text-sm text-gray-400 flex-1">{lesson.title}</span>
                    <span className="text-xs text-gray-400 flex-shrink-0">{fmtDuration(lesson.duration)}</span>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function PriceCard({ course, enrolled, enrollLoading, inCart, courseSlug, onEnroll, onAddToCart }: {
  course: ApiCourse; enrolled: boolean; enrollLoading: boolean; inCart: boolean; courseSlug: string; onEnroll: () => void; onAddToCart: () => void;
}) {
  const displayPrice = course.salePrice ?? course.price;
  const discount = course.salePrice != null && course.price > 0 ? Math.round((1 - course.salePrice / course.price) * 100) : 0;
  const totalLessons = course.sections.reduce((a, s) => a + s.lessons.length, 0);

  return (
    <div className="rounded-2xl border border-gray-200 shadow-xl shadow-gray-200/50 bg-white overflow-hidden">
      <div className="relative aspect-video bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center cursor-pointer group">
        {course.thumbnail ? (
          <img src={course.thumbnail} alt={course.title} className="absolute inset-0 w-full h-full object-cover" />
        ) : null}
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
        <div className="relative flex flex-col items-center gap-2">
          <div className="h-14 w-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/40 group-hover:scale-110 transition-transform">
            <PlayCircle className="h-7 w-7 text-white" />
          </div>
          <span className="text-white text-xs font-medium bg-black/30 rounded px-2 py-0.5">Xem trước khóa học</span>
        </div>
      </div>
      <div className="p-5">
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-3xl font-bold text-gray-900">{formatPrice(displayPrice)}</span>
          {discount > 0 && <span className="text-base text-gray-400 line-through">{formatPrice(course.price)}</span>}
        </div>
        {discount > 0 && (
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm font-semibold text-orange-600 bg-orange-50 rounded px-2 py-0.5">-{discount}%</span>
            <span className="text-xs text-gray-500">Giảm giá có hạn!</span>
          </div>
        )}
        {enrolled ? (
          <Link href={`/learn/${courseSlug}/${course.sections[0]?.lessons[0]?.slug ?? "intro"}`}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 py-3.5 text-sm font-bold text-white hover:bg-teal-700 transition-colors shadow-sm shadow-teal-200">
            <PlayCircle className="h-4 w-4" /> Tiếp tục học
          </Link>
        ) : (
          <>
            <button onClick={onEnroll} disabled={enrollLoading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 py-3.5 text-sm font-bold text-white hover:bg-teal-700 active:scale-[0.99] transition-all shadow-sm shadow-teal-200 mb-3 disabled:opacity-60 disabled:cursor-not-allowed">
              {enrollLoading ? <><span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> Đang xử lý...</> : <><Zap className="h-4 w-4" /> Đăng ký ngay</>}
            </button>
            {inCart ? (
              <Link href="/cart" className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-teal-500 py-3.5 text-sm font-bold text-teal-600 hover:bg-teal-50 transition-colors mb-4">
                <ShoppingCart className="h-4 w-4" /> Xem giỏ hàng →
              </Link>
            ) : (
              <button onClick={onAddToCart} className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-gray-200 py-3.5 text-sm font-bold text-gray-700 hover:border-teal-500 hover:text-teal-600 transition-colors mb-4">
                <ShoppingCart className="h-4 w-4" /> Thêm vào giỏ hàng
              </button>
            )}
          </>
        )}
        <p className="text-center text-xs text-gray-400 mb-4">Đảm bảo hoàn tiền 30 ngày</p>
        <div className="space-y-2.5">
          <p className="text-sm font-semibold text-gray-900">Khóa học bao gồm:</p>
          {[
            { icon: Monitor, label: `${totalLessons} bài video on-demand` },
            { icon: Smartphone, label: "Truy cập trên mobile & PC" },
            { icon: FileText, label: `${totalLessons} bài học + bài tập` },
            { icon: MessageSquare, label: "Cộng đồng Q&A hỗ trợ" },
            { icon: Infinity, label: "Truy cập trọn đời" },
            { icon: Award, label: "Chứng chỉ hoàn thành" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2.5 text-sm text-gray-600">
              <Icon className="h-4 w-4 text-teal-500 flex-shrink-0" />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────────────────────────── */
export default function CourseDetailPage({ params: paramsPromise }: { params: Promise<{ slug: string }> }) {
  const params = use(paramsPromise);
  const router = useRouter();
  const { data: session } = useSession();
  const { addItem, hasItem } = useCart();

  const [course, setCourse] = useState<ApiCourse | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [openSections, setOpenSections] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"overview" | "curriculum" | "reviews">("overview");
  const [enrolled, setEnrolled] = useState(false);
  const [enrollLoading, setEnrollLoading] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const [showAllSections, setShowAllSections] = useState(false);

  // Fetch course từ API thật
  useEffect(() => {
    fetch(`/api/courses/${params.slug}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data?.course) { setNotFound(true); setLoading(false); return; }
        setCourse(data.course);
        setOpenSections([data.course.sections[0]?.id].filter(Boolean));
        // Kiểm tra đã enroll chưa
        if (session?.user) {
          const uid = (session.user as any).id;
          setEnrolled(data.course.enrollments.some((e: { userId: string }) => e.userId === uid));
        }
        setLoading(false);
      })
      .catch(() => { setNotFound(true); setLoading(false); });
  }, [params.slug, session]);

  if (loading) return (
    <div className="flex flex-col min-h-screen"><Navbar />
      <main className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <div className="h-10 w-10 rounded-full border-4 border-teal-200 border-t-teal-600 animate-spin" />
          <span className="text-sm">Đang tải khóa học...</span>
        </div>
      </main>
      <Footer />
    </div>
  );

  if (notFound || !course) return (
    <div className="flex flex-col min-h-screen"><Navbar />
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">Không tìm thấy khóa học</h1>
          <p className="text-gray-500 mb-6">Khóa học này không tồn tại hoặc đã bị xóa.</p>
          <Link href="/courses" className="rounded-xl bg-teal-600 px-6 py-3 text-sm font-bold text-white hover:bg-teal-700 transition-colors">
            Xem tất cả khóa học
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );

  const rating = course.fakeRating ?? 4.8;
  const reviewCount = course.fakeReviews ?? course._count.reviews;
  const studentCount = course.fakeStudents ?? course._count.enrollments;
  const totalLessons = course.sections.reduce((a, s) => a + s.lessons.length, 0);
  const totalSec = course.sections.flatMap(s => s.lessons).reduce((a, l) => a + (l.duration || 0), 0);
  const totalDuration = fmtDuration(totalSec);
  const sectionsToShow = showAllSections ? course.sections : course.sections.slice(0, 3);
  const displayPrice = course.salePrice ?? course.price;
  const discount = course.salePrice != null && course.price > 0 ? Math.round((1 - course.salePrice / course.price) * 100) : 0;

  const ratingBreakdown = [
    { stars: 5, count: 70 }, { stars: 4, count: 20 }, { stars: 3, count: 7 }, { stars: 2, count: 2 }, { stars: 1, count: 1 },
  ];
  const totalRating = ratingBreakdown.reduce((a, b) => a + b.count, 0);

  const toggleSection = (id: string) =>
    setOpenSections(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);

  const handleEnroll = async () => {
    if (!session) { router.push(`/login?callbackUrl=/courses/${course.slug}`); return; }
    setEnrollLoading(true);
    try {
      const res = await fetch("/api/enroll", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId: course.id }),
      });
      if (res.ok) setEnrolled(true);
      else { const d = await res.json(); alert(d.error ?? "Đăng ký thất bại."); }
    } catch { alert("Lỗi kết nối. Vui lòng thử lại."); }
    finally { setEnrollLoading(false); }
  };

  const handleAddToCart = () => {
    addItem({
      id: course.id, title: course.title, slug: course.slug,
      instructor: course.instructor?.name ?? "NexLumina",
      category: course.category?.name ?? "",
      price: course.price, salePrice: course.salePrice ?? undefined,
      gradient: "from-teal-500 to-teal-700",
      badge: undefined, rating, totalLessons, totalDuration,
    });
  };

  const tabs = [
    { id: "overview", label: "Tổng quan" },
    { id: "curriculum", label: "Nội dung" },
    { id: "reviews", label: `Đánh giá (${reviewCount.toLocaleString()})` },
  ] as const;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <div className="bg-gray-950 text-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
              <div className="lg:col-span-2">
                <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-4 flex-wrap">
                  <Link href="/" className="hover:text-teal-400 transition-colors">Trang chủ</Link>
                  <ChevronRight className="h-3 w-3 flex-shrink-0" />
                  <Link href="/courses" className="hover:text-teal-400 transition-colors">Khóa học</Link>
                  {course.category && (<><ChevronRight className="h-3 w-3 flex-shrink-0" /><span className="text-gray-300">{course.category.name}</span></>)}
                </nav>
                {course.category && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-500/20 text-teal-400 text-xs font-semibold px-3 py-1 mb-3 border border-teal-500/30">
                    <span className="h-1.5 w-1.5 rounded-full bg-teal-400 inline-block" />{course.category.name}
                  </span>
                )}
                <h1 className="font-heading text-2xl md:text-3xl lg:text-4xl font-bold mb-3 leading-tight">{course.title}</h1>
                <p className="text-gray-300 text-sm md:text-base leading-relaxed mb-5 max-w-2xl">{course.description}</p>
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <strong className="text-yellow-400">{rating}</strong>
                    <span className="text-gray-400">({reviewCount.toLocaleString()} đánh giá)</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-400"><Users className="h-4 w-4" /><span>{studentCount.toLocaleString()} học viên</span></div>
                  <div className="flex items-center gap-1 text-gray-400"><Clock className="h-4 w-4" /><span>{totalDuration}</span></div>
                  <div className="flex items-center gap-1 text-gray-400"><BarChart2 className="h-4 w-4" /><span>{levelLabel[course.level] ?? course.level}</span></div>
                  <div className="flex items-center gap-1 text-gray-400"><Globe className="h-4 w-4" /><span>{course.language === "vi" ? "Tiếng Việt" : course.language}</span></div>
                </div>
                {course.instructor && (
                  <div className="flex items-center gap-2 mt-4">
                    <div className="h-8 w-8 rounded-full bg-teal-600 flex items-center justify-center text-white text-xs font-bold overflow-hidden">
                      {course.instructor.image ? <img src={course.instructor.image} alt={course.instructor.name ?? ""} className="w-full h-full object-cover" /> : (course.instructor.name?.slice(0, 2).toUpperCase() ?? "GV")}
                    </div>
                    <span className="text-sm text-gray-300">Giảng viên: <span className="text-teal-400 font-semibold">{course.instructor.name}</span></span>
                  </div>
                )}
              </div>
              <div className="hidden lg:block lg:col-span-1">
                <div className="sticky top-20">
                  <PriceCard course={course} enrolled={enrolled} enrollLoading={enrollLoading} inCart={hasItem(course.id)} courseSlug={course.slug} onEnroll={handleEnroll} onAddToCart={handleAddToCart} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile price bar */}
        <div className="lg:hidden border-b border-gray-200 bg-white px-4 py-4">
          <div className="flex items-baseline gap-3 mb-3">
            <span className="text-2xl font-bold text-gray-900">{formatPrice(displayPrice)}</span>
            {discount > 0 && (<><span className="text-base text-gray-400 line-through">{formatPrice(course.price)}</span><span className="text-sm font-bold text-orange-600 bg-orange-50 rounded px-2 py-0.5">-{discount}%</span></>)}
          </div>
          <div className="flex gap-3">
            {enrolled ? (
              <Link href={`/learn/${course.slug}/${course.sections[0]?.lessons[0]?.slug ?? "intro"}`}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-teal-600 py-3 text-sm font-bold text-white hover:bg-teal-700 transition-colors">
                <PlayCircle className="h-4 w-4" /> Tiếp tục học
              </Link>
            ) : (
              <>
                <button onClick={handleEnroll} disabled={enrollLoading}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-teal-600 py-3 text-sm font-bold text-white hover:bg-teal-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
                  {enrollLoading ? <><span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />Đang xử lý...</> : <><Zap className="h-4 w-4" /> Đăng ký ngay</>}
                </button>
                {hasItem(course.id) ? (
                  <Link href="/cart" className="h-12 w-12 flex-shrink-0 rounded-xl border-2 border-teal-500 bg-teal-50 flex items-center justify-center text-teal-600">
                    <ShoppingCart className="h-5 w-5" />
                  </Link>
                ) : (
                  <button onClick={handleAddToCart} className="h-12 w-12 flex-shrink-0 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:border-teal-400 hover:text-teal-600 transition-colors">
                    <ShoppingCart className="h-5 w-5" />
                  </button>
                )}
                <button onClick={() => setWishlisted(!wishlisted)}
                  className={`h-12 w-12 flex-shrink-0 rounded-xl border flex items-center justify-center transition-colors ${wishlisted ? "border-red-300 bg-red-50 text-red-500" : "border-gray-200 text-gray-500 hover:border-red-300 hover:text-red-500"}`}>
                  <Heart className={`h-5 w-5 ${wishlisted ? "fill-red-500" : ""}`} />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Tab Bar */}
        <div className="sticky top-16 z-30 bg-white border-b border-gray-200 shadow-sm">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex gap-1">
              {tabs.map((tab) => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-3.5 text-sm font-semibold border-b-2 transition-colors ${activeTab === tab.id ? "border-teal-600 text-teal-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            <div className="lg:col-span-2 space-y-8">

              {/* OVERVIEW */}
              {activeTab === "overview" && (
                <>
                  {course.whatYouLearn.length > 0 && (
                    <section className="rounded-2xl border border-teal-200 bg-teal-50/50 p-6">
                      <h2 className="font-heading text-xl font-bold text-gray-900 mb-4">Bạn sẽ học được gì?</h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {course.whatYouLearn.map((item) => (
                          <div key={item} className="flex items-start gap-2.5">
                            <div className="h-5 w-5 rounded-full bg-teal-500 flex items-center justify-center flex-shrink-0 mt-0.5"><Check className="h-3 w-3 text-white" /></div>
                            <span className="text-sm text-gray-700">{item}</span>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}
                  <section>
                    <h2 className="font-heading text-xl font-bold text-gray-900 mb-3">Mô tả khóa học</h2>
                    <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed space-y-3">
                      <p>{course.description}</p>
                      <p>Khóa học được thiết kế để bạn có thể học theo nhịp độ của mình, với các bài tập thực hành sau mỗi module. Bạn sẽ nhận chứng chỉ hoàn thành sau khi kết thúc.</p>
                      <p>Với <strong>{studentCount.toLocaleString()} học viên</strong> đã đăng ký, đây là một trong những khóa học được đánh giá cao nhất trên NexLumina.</p>
                    </div>
                  </section>
                  {course.instructor && (
                    <section className="rounded-2xl border border-gray-200 bg-white p-6">
                      <h2 className="font-heading text-xl font-bold text-gray-900 mb-4">Giảng viên</h2>
                      <div className="flex items-start gap-4">
                        <div className="h-16 w-16 rounded-full bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center text-white font-bold text-lg flex-shrink-0 overflow-hidden">
                          {course.instructor.image ? <img src={course.instructor.image} alt="" className="w-full h-full object-cover" /> : (course.instructor.name?.slice(0, 2).toUpperCase() ?? "GV")}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 text-base">{course.instructor.name}</p>
                          <p className="text-sm text-teal-600 mb-2">Chuyên gia {course.category?.name ?? "NexLumina"}</p>
                          <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-3">
                            <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" /> {rating} đánh giá</span>
                            <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {studentCount.toLocaleString()} học viên</span>
                            <span className="flex items-center gap-1"><BookOpen className="h-3.5 w-3.5" /> {course.sections.length} chương</span>
                          </div>
                          <p className="text-sm text-gray-600">Chuyên gia với nhiều năm kinh nghiệm thực chiến. Đam mê chia sẻ kiến thức và giúp học viên đạt được mục tiêu.</p>
                        </div>
                      </div>
                    </section>
                  )}
                </>
              )}

              {/* CURRICULUM */}
              {activeTab === "curriculum" && (
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="font-heading text-xl font-bold text-gray-900">Nội dung khóa học</h2>
                      <p className="text-sm text-gray-500 mt-0.5">{course.sections.length} chương · {totalLessons} bài học · {totalDuration}</p>
                    </div>
                    <button onClick={() => setOpenSections(openSections.length > 0 ? [] : course.sections.map(s => s.id))} className="text-sm text-teal-600 hover:underline">
                      {openSections.length > 0 ? "Thu gọn tất cả" : "Mở rộng tất cả"}
                    </button>
                  </div>
                  <div className="space-y-3">
                    {sectionsToShow.map((section) => (
                      <SectionAccordion key={section.id} section={section} open={openSections.includes(section.id)} onToggle={() => toggleSection(section.id)} courseSlug={course.slug} enrolled={enrolled} />
                    ))}
                  </div>
                  {!showAllSections && course.sections.length > 3 && (
                    <button onClick={() => setShowAllSections(true)} className="mt-4 w-full rounded-xl border border-gray-200 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                      <ChevronDown className="h-4 w-4" /> Xem thêm {course.sections.length - 3} chương
                    </button>
                  )}
                  {!enrolled && (
                    <div className="mt-6 rounded-xl bg-amber-50 border border-amber-200 p-4 flex items-start gap-3">
                      <Lock className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-amber-800">Đăng ký để mở khóa toàn bộ nội dung</p>
                        <p className="text-xs text-amber-600 mt-0.5">Hiện tại bạn chỉ có thể xem các bài học miễn phí.</p>
                      </div>
                    </div>
                  )}
                </section>
              )}

              {/* REVIEWS */}
              {activeTab === "reviews" && (
                <section>
                  <h2 className="font-heading text-xl font-bold text-gray-900 mb-6">Đánh giá học viên</h2>
                  <div className="flex flex-col sm:flex-row items-center gap-6 rounded-2xl bg-white border border-gray-200 p-6 mb-6">
                    <div className="text-center flex-shrink-0">
                      <div className="text-6xl font-bold text-teal-600">{rating}</div>
                      <StarRow rating={Math.round(rating)} />
                      <p className="text-xs text-gray-500 mt-1">Đánh giá khóa học</p>
                    </div>
                    <div className="flex-1 w-full space-y-2">
                      {ratingBreakdown.map(({ stars, count }) => (
                        <div key={stars} className="flex items-center gap-2.5">
                          <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                            <div className="h-2 rounded-full bg-teal-400 transition-all" style={{ width: `${(count / totalRating) * 100}%` }} />
                          </div>
                          <StarRow rating={stars} />
                          <span className="text-xs text-gray-500 w-6 text-right">{count}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {reviewCount === 0 ? (
                    <div className="text-center py-10 text-gray-400">
                      <MessageSquare className="h-10 w-10 mx-auto mb-3 opacity-40" />
                      <p className="text-sm">Chưa có đánh giá nào. Hãy là người đầu tiên!</p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 text-center">Đánh giá sẽ hiển thị sau khi học viên hoàn thành khóa học.</p>
                  )}
                </section>
              )}
            </div>

            {/* Sidebar desktop */}
            <div className="hidden lg:block lg:col-span-1">
              <div className="sticky top-32">
                <PriceCard course={course} enrolled={enrolled} enrollLoading={enrollLoading} inCart={hasItem(course.id)} courseSlug={course.slug} onEnroll={handleEnroll} onAddToCart={handleAddToCart} />
                <div className="flex gap-3 mt-3">
                  <button onClick={() => setWishlisted(!wishlisted)}
                    className={`flex-1 flex items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-medium transition-colors ${wishlisted ? "border-red-300 bg-red-50 text-red-500" : "border-gray-200 text-gray-600 hover:border-red-300 hover:text-red-500"}`}>
                    <Heart className={`h-4 w-4 ${wishlisted ? "fill-red-500" : ""}`} /> {wishlisted ? "Đã lưu" : "Yêu thích"}
                  </button>
                  <button
                    onClick={() => {
                      const url = window.location.href;
                      if (navigator.share) {
                        navigator.share({ title: course.title, url });
                      } else {
                        navigator.clipboard.writeText(url).then(() => alert("Đã copy link!"));
                      }
                    }}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-600 hover:border-gray-300 transition-colors">
                    <Share2 className="h-4 w-4" /> Chia sẻ
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
