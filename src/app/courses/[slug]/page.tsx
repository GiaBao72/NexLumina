"use client";

import React, { useState, use } from "react";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { mockCourses, levelLabel, formatPrice } from "@/lib/mock-data";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useCart } from "@/context/CartContext";
import {
  Star, Clock, Users, PlayCircle, Check, ChevronDown,
  ChevronRight, BookOpen, Award, Globe, BarChart2,
  ShoppingCart, Zap, Heart, Share2, Lock, ChevronLeft,
  Monitor, Smartphone, Infinity, FileText, MessageSquare,
  Volume2, AlertCircle,
} from "lucide-react";

/* ─── Mock data ───────────────────────────────────────────────────────────────── */
const mockSections = [
  {
    id: "s1", title: "Giới thiệu & Cài đặt môi trường", totalDuration: "19:27",
    lessons: [
      { id: "l1", slug: "gioi-thieu-khoa-hoc", title: "Giới thiệu khóa học", duration: "05:12", isFree: true, type: "video" },
      { id: "l2", slug: "cai-dat-moi-truong", title: "Cài đặt Node.js & VS Code", duration: "08:45", isFree: true, type: "video" },
      { id: "l3", slug: "tong-quan-du-an", title: "Tổng quan dự án thực tế", duration: "06:30", isFree: false, type: "video" },
    ],
  },
  {
    id: "s2", title: "Nền tảng cơ bản", totalDuration: "40:35",
    lessons: [
      { id: "l4", slug: "khai-niem-cot-loi", title: "Khái niệm cốt lõi", duration: "12:20", isFree: false, type: "video" },
      { id: "l5", slug: "thuc-hanh-dau-tien", title: "Thực hành đầu tiên", duration: "18:00", isFree: false, type: "video" },
      { id: "l6", slug: "bai-tap-quiz", title: "Bài tập & Quiz kiểm tra", duration: "10:15", isFree: false, type: "quiz" },
    ],
  },
  {
    id: "s3", title: "Xây dựng dự án thực tế", totalDuration: "60:30",
    lessons: [
      { id: "l7", slug: "phan-tich-yeu-cau", title: "Phân tích yêu cầu dự án", duration: "15:00", isFree: false, type: "video" },
      { id: "l8", slug: "xay-dung-tung-buoc", title: "Xây dựng từng bước", duration: "25:30", isFree: false, type: "video" },
      { id: "l9", slug: "deploy-hoan-thien", title: "Deploy & hoàn thiện sản phẩm", duration: "20:00", isFree: false, type: "video" },
    ],
  },
  {
    id: "s4", title: "Nâng cao & Best Practices", totalDuration: "38:10",
    lessons: [
      { id: "l10", slug: "performance-optimization", title: "Performance Optimization", duration: "14:40", isFree: false, type: "video" },
      { id: "l11", slug: "security-tips", title: "Security Tips thực tế", duration: "12:00", isFree: false, type: "video" },
      { id: "l12", slug: "chung-chi-hoan-thanh", title: "Nhận chứng chỉ hoàn thành", duration: "11:30", isFree: false, type: "video" },
    ],
  },
];

const mockReviews = [
  { id: "r1", name: "Trần Minh Khoa", avatar: "TMK", rating: 5, date: "2 ngày trước", comment: "Khóa học rất thực tế và dễ hiểu. Giảng viên giải thích rõ ràng, có nhiều bài tập hands-on. Mình đã apply được ngay vào công việc sau 2 tuần học!" },
  { id: "r2", name: "Nguyễn Thu Hà", avatar: "NTH", rating: 5, date: "1 tuần trước", comment: "Nội dung cập nhật và chất lượng cao. Cộng đồng hỗ trợ nhiệt tình. Recommend mạnh cho ai muốn học nghiêm túc." },
  { id: "r3", name: "Lê Văn Đức", avatar: "LVD", rating: 4, date: "2 tuần trước", comment: "Tốt cho người mới bắt đầu. Phần nâng cao có thể đi sâu hơn một chút nhưng nhìn chung rất đáng tiền." },
  { id: "r4", name: "Phạm Thị Mai", avatar: "PTM", rating: 5, date: "3 tuần trước", comment: "Đây là khóa học tốt nhất mình từng học online. Lộ trình rõ ràng, bài tập thực tế. Mình đã landing được công việc mơ ước!" },
];

const ratingBreakdown = [
  { stars: 5, count: 70 },
  { stars: 4, count: 20 },
  { stars: 3, count: 7 },
  { stars: 2, count: 2 },
  { stars: 1, count: 1 },
];

/* ─── Sub-components ──────────────────────────────────────────────────────────── */
function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`h-3.5 w-3.5 ${s <= rating ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200"}`}
        />
      ))}
    </div>
  );
}

function SectionAccordion({
  section,
  open,
  onToggle,
  courseSlug,
  enrolled,
}: {
  section: typeof mockSections[0];
  open: boolean;
  onToggle: () => void;
  courseSlug: string;
  enrolled: boolean;
}) {
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3.5 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform flex-shrink-0 ${open ? "rotate-180" : ""}`} />
          <div>
            <p className="font-semibold text-sm text-gray-900">{section.title}</p>
            <p className="text-xs text-gray-500 mt-0.5">{section.lessons.length} bài · {section.totalDuration}</p>
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
                  <Link
                    href={`/learn/${courseSlug}/${lesson.slug}`}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-teal-50 transition-colors group"
                  >
                    <div className="flex-shrink-0 h-7 w-7 rounded-full bg-teal-50 group-hover:bg-teal-100 flex items-center justify-center transition-colors">
                      {lesson.type === "quiz" ? (
                        <FileText className="h-3.5 w-3.5 text-teal-600" />
                      ) : (
                        <PlayCircle className="h-3.5 w-3.5 text-teal-600" />
                      )}
                    </div>
                    <span className="text-sm text-gray-700 flex-1 group-hover:text-teal-700 transition-colors">{lesson.title}</span>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {lesson.isFree && (
                        <span className="text-xs bg-teal-100 text-teal-700 rounded px-1.5 py-0.5 font-medium">Miễn phí</span>
                      )}
                      <span className="text-xs text-gray-400">{lesson.duration}</span>
                    </div>
                  </Link>
                ) : (
                  <div className="flex items-center gap-3 px-4 py-3">
                    <div className="flex-shrink-0 h-7 w-7 rounded-full bg-gray-100 flex items-center justify-center">
                      <Lock className="h-3.5 w-3.5 text-gray-400" />
                    </div>
                    <span className="text-sm text-gray-400 flex-1">{lesson.title}</span>
                    <span className="text-xs text-gray-400 flex-shrink-0">{lesson.duration}</span>
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

/* ─── Price Card ──────────────────────────────────────────────────────────────── */
function PriceCard({
  course,
  enrolled,
  enrollLoading,
  inCart,
  courseSlug,
  onEnroll,
  onAddToCart,
}: {
  course: ReturnType<typeof mockCourses.find> & object;
  enrolled: boolean;
  enrollLoading: boolean;
  inCart: boolean;
  courseSlug: string;
  onEnroll: () => void;
  onAddToCart: () => void;
}) {
  const displayPrice = (course as any).salePrice !== undefined && (course as any).salePrice !== null
    ? (course as any).salePrice : (course as any).price;
  const originalPrice = (course as any).price;
  const discount = (course as any).salePrice !== undefined && (course as any).salePrice !== null && originalPrice > 0
    ? Math.round((1 - (course as any).salePrice / originalPrice) * 100) : 0;

  return (
    <div className="rounded-2xl border border-gray-200 shadow-xl shadow-gray-200/50 bg-white overflow-hidden">
      {/* Preview thumbnail */}
      <div className={`relative aspect-video bg-gradient-to-br ${(course as any).gradient} flex items-center justify-center cursor-pointer group`}>
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
        <div className="relative flex flex-col items-center gap-2">
          <div className="h-14 w-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/40 group-hover:scale-110 transition-transform">
            <PlayCircle className="h-7 w-7 text-white" />
          </div>
          <span className="text-white text-xs font-medium bg-black/30 rounded px-2 py-0.5">Xem trước khóa học</span>
        </div>
      </div>

      <div className="p-5">
        {/* Price */}
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-3xl font-bold text-gray-900">{formatPrice(displayPrice)}</span>
          {discount > 0 && (
            <span className="text-base text-gray-400 line-through">{formatPrice(originalPrice)}</span>
          )}
        </div>
        {discount > 0 && (
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm font-semibold text-orange-600 bg-orange-50 rounded px-2 py-0.5">-{discount}%</span>
            <span className="text-xs text-gray-500">Giảm giá có hạn!</span>
          </div>
        )}

        {/* CTA */}
        {enrolled ? (
          <Link
            href={`/learn/${courseSlug}/gioi-thieu-khoa-hoc`}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 py-3.5 text-sm font-bold text-white hover:bg-teal-700 transition-colors shadow-sm shadow-teal-200"
          >
            <PlayCircle className="h-4 w-4" /> Tiếp tục học
          </Link>
        ) : (
          <>
            <button
              onClick={onEnroll}
              disabled={enrollLoading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 py-3.5 text-sm font-bold text-white hover:bg-teal-700 active:scale-[0.99] transition-all shadow-sm shadow-teal-200 mb-3 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {enrollLoading ? (
                <><span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> Đang xử lý...</>
              ) : (
                <><Zap className="h-4 w-4" /> Đăng ký ngay</>
              )}
            </button>
            {inCart ? (
              <Link
                href="/cart"
                className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-teal-500 py-3.5 text-sm font-bold text-teal-600 hover:bg-teal-50 transition-colors mb-4"
              >
                <ShoppingCart className="h-4 w-4" /> Xem giỏ hàng →
              </Link>
            ) : (
              <button
                onClick={onAddToCart}
                className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-gray-200 py-3.5 text-sm font-bold text-gray-700 hover:border-teal-500 hover:text-teal-600 transition-colors mb-4"
              >
                <ShoppingCart className="h-4 w-4" /> Thêm vào giỏ hàng
              </button>
            )}
          </>
        )}

        <p className="text-center text-xs text-gray-400 mb-4">Đảm bảo hoàn tiền 30 ngày</p>

        {/* Includes */}
        <div className="space-y-2.5">
          <p className="text-sm font-semibold text-gray-900">Khóa học bao gồm:</p>
          {[
            { icon: Monitor, label: `${(course as any).totalDuration} video on-demand` },
            { icon: Smartphone, label: "Truy cập trên mobile & PC" },
            { icon: FileText, label: `${(course as any).totalLessons} bài học + bài tập` },
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

/* ─── Main Page ───────────────────────────────────────────────────────────────── */
export default function CourseDetailPage({ params: paramsPromise }: { params: Promise<{ slug: string }> }) {
  const params = use(paramsPromise);
  const course = mockCourses.find((c) => c.slug === params.slug);
  if (!course) notFound();

  const { data: session } = useSession();
  const { addItem, hasItem } = useCart();
  const [openSections, setOpenSections] = useState<string[]>(["s1"]);
  const [activeTab, setActiveTab] = useState<"overview" | "curriculum" | "reviews">("overview");
  const [enrolled, setEnrolled] = useState(false);
  const [enrollLoading, setEnrollLoading] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const [showAllSections, setShowAllSections] = useState(false);

  const displayPrice = course.salePrice !== undefined && course.salePrice !== null
    ? course.salePrice : course.price;
  const discount = course.salePrice !== undefined && course.salePrice !== null && course.price > 0
    ? Math.round((1 - course.salePrice / course.price) * 100) : 0;

  const totalLessons = mockSections.flatMap((s) => s.lessons).length;
  const sectionsToShow = showAllSections ? mockSections : mockSections.slice(0, 3);
  const totalRating = ratingBreakdown.reduce((a, b) => a + b.count, 0);

  const toggleSection = (id: string) =>
    setOpenSections((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );

  const handleEnroll = async () => {
    if (!session) {
      window.location.href = `/login?callbackUrl=/courses/${course.slug}`;
      return;
    }
    setEnrollLoading(true);
    try {
      const res = await fetch("/api/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId: course.id }),
      });
      if (res.ok) {
        setEnrolled(true);
      } else {
        const data = await res.json();
        alert(data.error ?? "Đăng ký thất bại. Vui lòng thử lại.");
      }
    } catch {
      alert("Đã xảy ra lỗi kết nối. Vui lòng thử lại.");
    } finally {
      setEnrollLoading(false);
    }
  };

  const handleAddToCart = () => {
    addItem({
      id: course.id,
      title: course.title,
      slug: course.slug,
      instructor: course.instructor,
      category: course.category,
      price: course.price,
      salePrice: course.salePrice,
      gradient: course.gradient,
      badge: course.badge,
      rating: course.rating,
      totalLessons: course.totalLessons,
      totalDuration: course.totalDuration,
    });
  };

  const tabs = [
    { id: "overview", label: "Tổng quan" },
    { id: "curriculum", label: "Nội dung" },
    { id: "reviews", label: `Đánh giá (${course.reviewCount.toLocaleString()})` },
  ] as const;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <main className="flex-1">
        {/* ── Hero ── */}
        <div className="bg-gray-950 text-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
              {/* Left */}
              <div className="lg:col-span-2">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-4 flex-wrap">
                  <Link href="/" className="hover:text-teal-400 transition-colors">Trang chủ</Link>
                  <ChevronRight className="h-3 w-3 flex-shrink-0" />
                  <Link href="/courses" className="hover:text-teal-400 transition-colors">Khóa học</Link>
                  <ChevronRight className="h-3 w-3 flex-shrink-0" />
                  <span className="text-gray-300">{course.category}</span>
                </nav>

                {/* Badge */}
                <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-500/20 text-teal-400 text-xs font-semibold px-3 py-1 mb-3 border border-teal-500/30">
                  {course.badge && <span className="h-1.5 w-1.5 rounded-full bg-teal-400 inline-block" />}
                  {course.category}
                </span>

                <h1 className="font-heading text-2xl md:text-3xl lg:text-4xl font-bold mb-3 leading-tight">
                  {course.title}
                </h1>
                <p className="text-gray-300 text-sm md:text-base leading-relaxed mb-5 max-w-2xl">
                  {course.description}
                </p>

                {/* Stats row */}
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
                  {course.badge && (
                    <span className="rounded-full bg-orange-500 text-white text-xs font-bold px-2.5 py-0.5">
                      {course.badge}
                    </span>
                  )}
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <strong className="text-yellow-400">{course.rating}</strong>
                    <span className="text-gray-400">({course.reviewCount.toLocaleString()} đánh giá)</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-400">
                    <Users className="h-4 w-4" />
                    <span>{(course.reviewCount * 3).toLocaleString()} học viên</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-400">
                    <Clock className="h-4 w-4" />
                    <span>{course.totalDuration}</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-400">
                    <BarChart2 className="h-4 w-4" />
                    <span>{levelLabel[course.level]}</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-400">
                    <Globe className="h-4 w-4" />
                    <span>Tiếng Việt</span>
                  </div>
                </div>

                {/* Instructor */}
                <div className="flex items-center gap-2 mt-4">
                  <div className="h-8 w-8 rounded-full bg-teal-600 flex items-center justify-center text-white text-xs font-bold">
                    {course.instructorAvatar}
                  </div>
                  <span className="text-sm text-gray-300">
                    Giảng viên: <span className="text-teal-400 font-semibold">{course.instructor}</span>
                  </span>
                </div>
              </div>

              {/* Right — price card on desktop */}
              <div className="hidden lg:block lg:col-span-1">
                <div className="sticky top-20">
                  <PriceCard course={course} enrolled={enrolled} enrollLoading={enrollLoading} inCart={hasItem(course.id)} courseSlug={course.slug} onEnroll={handleEnroll} onAddToCart={handleAddToCart} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:hidden border-b border-gray-200 bg-white px-4 py-4">
          <div className="flex items-baseline gap-3 mb-3">
            <span className="text-2xl font-bold text-gray-900">{formatPrice(displayPrice)}</span>
            {discount > 0 && (
              <>
                <span className="text-base text-gray-400 line-through">{formatPrice(course.price)}</span>
                <span className="text-sm font-bold text-orange-600 bg-orange-50 rounded px-2 py-0.5">-{discount}%</span>
              </>
            )}
          </div>
          <div className="flex gap-3">
            {enrolled ? (
              <Link
                href={`/learn/${course.slug}/gioi-thieu-khoa-hoc`}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-teal-600 py-3 text-sm font-bold text-white hover:bg-teal-700 transition-colors"
              >
                <PlayCircle className="h-4 w-4" /> Tiếp tục học
              </Link>
            ) : (
              <>
                <button
                  onClick={handleEnroll}
                  disabled={enrollLoading}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-teal-600 py-3 text-sm font-bold text-white hover:bg-teal-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {enrollLoading ? (
                    <><span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> Đang xử lý...</>
                  ) : (
                    <><Zap className="h-4 w-4" /> Đăng ký ngay</>
                  )}
                </button>
                {hasItem(course.id) ? (
                  <Link
                    href="/cart"
                    className="h-12 w-12 flex-shrink-0 rounded-xl border-2 border-teal-500 bg-teal-50 flex items-center justify-center text-teal-600 transition-colors"
                  >
                    <ShoppingCart className="h-5 w-5" />
                  </Link>
                ) : (
                  <button
                    onClick={handleAddToCart}
                    className="h-12 w-12 flex-shrink-0 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:border-teal-400 hover:text-teal-600 transition-colors"
                  >
                    <ShoppingCart className="h-5 w-5" />
                  </button>
                )}
                <button
                  onClick={() => setWishlisted(!wishlisted)}
                  className={`h-12 w-12 flex-shrink-0 rounded-xl border flex items-center justify-center transition-colors ${wishlisted ? "border-red-300 bg-red-50 text-red-500" : "border-gray-200 text-gray-500 hover:border-red-300 hover:text-red-500"}`}
                >
                  <Heart className={`h-5 w-5 ${wishlisted ? "fill-red-500" : ""}`} />
                </button>
              </>
            )}
          </div>
        </div>

        {/* ── Sticky Tab Bar ── */}
        <div className="sticky top-16 z-30 bg-white border-b border-gray-200 shadow-sm">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-3.5 text-sm font-semibold border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? "border-teal-600 text-teal-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Main Content ── */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Content col */}
            <div className="lg:col-span-2 space-y-8">

              {/* ── OVERVIEW ── */}
              {activeTab === "overview" && (
                <>
                  {/* What you'll learn */}
                  <section className="rounded-2xl border border-teal-200 bg-teal-50/50 p-6">
                    <h2 className="font-heading text-xl font-bold text-gray-900 mb-4">Bạn sẽ học được gì?</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {course.whatYouLearn.map((item) => (
                        <div key={item} className="flex items-start gap-2.5">
                          <div className="h-5 w-5 rounded-full bg-teal-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Check className="h-3 w-3 text-white" />
                          </div>
                          <span className="text-sm text-gray-700">{item}</span>
                        </div>
                      ))}
                      {/* Extra generic items */}
                      {["Kiến thức thực chiến áp dụng ngay", "Kỹ năng làm việc nhóm & teamwork", "Tư duy giải quyết vấn đề"].map((item) => (
                        <div key={item} className="flex items-start gap-2.5">
                          <div className="h-5 w-5 rounded-full bg-teal-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Check className="h-3 w-3 text-white" />
                          </div>
                          <span className="text-sm text-gray-700">{item}</span>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Requirements */}
                  <section>
                    <h2 className="font-heading text-xl font-bold text-gray-900 mb-3">Yêu cầu đầu vào</h2>
                    <ul className="space-y-2">
                      {course.requirements.map((r) => (
                        <li key={r} className="flex items-start gap-2.5 text-sm text-gray-600">
                          <div className="h-1.5 w-1.5 rounded-full bg-teal-500 mt-2 flex-shrink-0" />
                          {r}
                        </li>
                      ))}
                    </ul>
                  </section>

                  {/* Course description */}
                  <section>
                    <h2 className="font-heading text-xl font-bold text-gray-900 mb-3">Mô tả khóa học</h2>
                    <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed space-y-3">
                      <p>{course.description}</p>
                      <p>
                        Khóa học được thiết kế để bạn có thể học theo nhịp độ của mình, với các bài tập thực hành sau mỗi module để củng cố kiến thức. Bạn sẽ nhận được chứng chỉ hoàn thành được công nhận ngay sau khi kết thúc khóa học.
                      </p>
                      <p>
                        Với hơn <strong>{(course.reviewCount * 3).toLocaleString()} học viên</strong> đã đăng ký, đây là một trong những khóa học được đánh giá cao nhất trên NexLumina. Cộng đồng học viên tích cực và giảng viên sẵn sàng giải đáp mọi thắc mắc của bạn.
                      </p>
                    </div>
                  </section>

                  {/* Instructor bio */}
                  <section className="rounded-2xl border border-gray-200 bg-white p-6">
                    <h2 className="font-heading text-xl font-bold text-gray-900 mb-4">Giảng viên</h2>
                    <div className="flex items-start gap-4">
                      <div className="h-16 w-16 rounded-full bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                        {course.instructorAvatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-base">{course.instructor}</p>
                        <p className="text-sm text-teal-600 mb-2">Chuyên gia {course.category}</p>
                        <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-3">
                          <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" /> {course.rating} đánh giá</span>
                          <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {(course.reviewCount * 3).toLocaleString()} học viên</span>
                          <span className="flex items-center gap-1"><BookOpen className="h-3.5 w-3.5" /> 5 khóa học</span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Chuyên gia với nhiều năm kinh nghiệm thực chiến trong ngành. Đam mê chia sẻ kiến thức và giúp học viên đạt được mục tiêu nghề nghiệp của họ.
                        </p>
                      </div>
                    </div>
                  </section>
                </>
              )}

              {/* ── CURRICULUM ── */}
              {activeTab === "curriculum" && (
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="font-heading text-xl font-bold text-gray-900">Nội dung khóa học</h2>
                      <p className="text-sm text-gray-500 mt-0.5">{mockSections.length} chương · {totalLessons} bài học · {course.totalDuration}</p>
                    </div>
                    <button
                      onClick={() => setOpenSections(openSections.length > 0 ? [] : mockSections.map(s => s.id))}
                      className="text-sm text-teal-600 hover:underline"
                    >
                      {openSections.length > 0 ? "Thu gọn tất cả" : "Mở rộng tất cả"}
                    </button>
                  </div>

                  <div className="space-y-3">
                    {sectionsToShow.map((section) => (
                      <SectionAccordion
                        key={section.id}
                        section={section}
                        open={openSections.includes(section.id)}
                        onToggle={() => toggleSection(section.id)}
                        courseSlug={course.slug}
                        enrolled={enrolled}
                      />
                    ))}
                  </div>

                  {!showAllSections && mockSections.length > 3 && (
                    <button
                      onClick={() => setShowAllSections(true)}
                      className="mt-4 w-full rounded-xl border border-gray-200 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                    >
                      <ChevronDown className="h-4 w-4" />
                      Xem thêm {mockSections.length - 3} chương
                    </button>
                  )}

                  {!enrolled && (
                    <div className="mt-6 rounded-xl bg-amber-50 border border-amber-200 p-4 flex items-start gap-3">
                      <Lock className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-amber-800">Đăng ký để mở khóa toàn bộ nội dung</p>
                        <p className="text-xs text-amber-600 mt-0.5">Hiện tại bạn chỉ có thể xem các bài học miễn phí. Đăng ký ngay để truy cập không giới hạn.</p>
                      </div>
                    </div>
                  )}
                </section>
              )}

              {/* ── REVIEWS ── */}
              {activeTab === "reviews" && (
                <section>
                  <h2 className="font-heading text-xl font-bold text-gray-900 mb-6">Đánh giá học viên</h2>

                  {/* Summary */}
                  <div className="flex flex-col sm:flex-row items-center gap-6 rounded-2xl bg-white border border-gray-200 p-6 mb-6">
                    {/* Big number */}
                    <div className="text-center flex-shrink-0">
                      <div className="text-6xl font-bold text-teal-600">{course.rating}</div>
                      <StarRow rating={Math.round(course.rating)} />
                      <p className="text-xs text-gray-500 mt-1">Đánh giá khóa học</p>
                    </div>
                    {/* Breakdown */}
                    <div className="flex-1 w-full space-y-2">
                      {ratingBreakdown.map(({ stars, count }) => (
                        <div key={stars} className="flex items-center gap-2.5">
                          <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                            <div
                              className="h-2 rounded-full bg-teal-400 transition-all"
                              style={{ width: `${(count / totalRating) * 100}%` }}
                            />
                          </div>
                          <StarRow rating={stars} />
                          <span className="text-xs text-gray-500 w-6 text-right">{count}%</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Individual reviews */}
                  <div className="space-y-5">
                    {mockReviews.map((review) => (
                      <div key={review.id} className="flex gap-4 bg-white rounded-2xl border border-gray-100 p-5">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {review.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="font-semibold text-sm text-gray-900">{review.name}</span>
                            <StarRow rating={review.rating} />
                            <span className="text-xs text-gray-400">{review.date}</span>
                          </div>
                          <p className="text-sm text-gray-600 leading-relaxed">{review.comment}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* Sidebar — desktop price card */}
            <div className="hidden lg:block lg:col-span-1">
              <div className="sticky top-32">
                <PriceCard course={course} enrolled={enrolled} enrollLoading={enrollLoading} inCart={hasItem(course.id)} courseSlug={course.slug} onEnroll={handleEnroll} onAddToCart={handleAddToCart} />

                {/* Share / Wishlist */}
                <div className="flex gap-3 mt-3">
                  <button
                    onClick={() => setWishlisted(!wishlisted)}
                    className={`flex-1 flex items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-medium transition-colors ${
                      wishlisted ? "border-red-300 bg-red-50 text-red-500" : "border-gray-200 text-gray-600 hover:border-red-300 hover:text-red-500"
                    }`}
                  >
                    <Heart className={`h-4 w-4 ${wishlisted ? "fill-red-500" : ""}`} />
                    {wishlisted ? "Đã lưu" : "Yêu thích"}
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-600 hover:border-gray-300 transition-colors">
                    <Share2 className="h-4 w-4" /> Chia sẻ
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Related courses */}
          <div className="mt-12">
            <h2 className="font-heading text-xl font-bold text-gray-900 mb-6">Khóa học liên quan</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {mockCourses
                .filter((c) => c.slug !== course.slug && c.categorySlug === course.categorySlug)
                .slice(0, 4)
                .concat(mockCourses.filter((c) => c.slug !== course.slug).slice(0, 4))
                .slice(0, 4)
                .map((c) => (
                  <Link
                    key={c.id}
                    href={`/courses/${c.slug}`}
                    className="group rounded-2xl bg-white border border-gray-100 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all"
                  >
                    <div className={`h-28 bg-gradient-to-br ${c.gradient} flex items-center justify-center relative`}>
                      <PlayCircle className="h-10 w-10 text-white/60 group-hover:text-white/90 transition-colors" />
                      {c.badge && (
                        <span className="absolute top-2 left-2 rounded-full bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5">
                          {c.badge}
                        </span>
                      )}
                    </div>
                    <div className="p-3.5">
                      <p className="text-[11px] text-teal-600 font-semibold uppercase tracking-wide mb-1">{c.category}</p>
                      <p className="font-semibold text-xs text-gray-900 line-clamp-2 mb-2 group-hover:text-teal-700 transition-colors">{c.title}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span>{c.rating}</span>
                        </div>
                        <span className="text-xs font-bold text-gray-900">
                          {formatPrice(c.salePrice ?? c.price)}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
