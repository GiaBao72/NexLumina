"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { formatPrice } from "@/lib/mock-data";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  BookOpen, Clock, Award, TrendingUp,
  PlayCircle, ChevronRight, Star,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────
interface EnrolledCourse {
  enrollmentId: string;
  courseId: string;
  title: string;
  slug: string;
  thumbnail: string | null;
  totalLessons: number;
  totalDuration: number;
  level: string;
  progressPct: number;
  enrolledAt: string;
  status: string;
  completedAt: string | null;
}

interface DashboardStats {
  totalCourses: number;
  completedCourses: number;
  totalHours: number;
  avgRating: number | null;
}

// ─── Skeleton card ────────────────────────────────────────────────────────────
function CourseSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm animate-pulse">
      <div className="h-32 bg-gray-200" />
      <div className="p-4 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
        <div className="h-2 bg-gray-200 rounded-full w-full mt-3" />
        <div className="h-8 bg-gray-200 rounded-lg mt-4" />
      </div>
    </div>
  );
}

function StatSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 animate-pulse">
      <div className="h-10 w-10 rounded-xl bg-gray-200 mb-3" />
      <div className="h-7 bg-gray-200 rounded w-1/2 mb-1" />
      <div className="h-3 bg-gray-200 rounded w-2/3" />
    </div>
  );
}

// ─── Gradient palette (cycle by index) ────────────────────────────────────────
const gradients = [
  "from-teal-500 to-teal-700",
  "from-blue-500 to-blue-700",
  "from-purple-500 to-purple-700",
  "from-orange-500 to-orange-700",
  "from-rose-500 to-rose-700",
  "from-indigo-500 to-indigo-700",
];

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const user = session?.user;

  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [recommended, setRecommended] = useState<{ id: string; slug: string; title: string; thumbnail: string | null; rating?: number; price: number; salePrice?: number | null }[]>([]);

  // Redirect if unauthenticated
  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
  }, [status, router]);

  // Fetch dashboard data once authenticated
  useEffect(() => {
    if (status !== "authenticated") return;
    setLoading(true);
    fetch("/api/users/dashboard")
      .then(async (res) => {
        if (!res.ok) {
          const json = await res.json().catch(() => ({}));
          throw new Error(json.error ?? "Lỗi khi tải dữ liệu");
        }
        return res.json();
      })
      .then((data) => {
        setEnrolledCourses(data.enrolledCourses ?? []);
        setStats(data.stats ?? null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
    // Fetch recommended courses
    fetch("/api/courses?sort=popular&limit=4")
      .then((res) => res.ok ? res.json() : { courses: [] })
      .then((data) => setRecommended((data.courses ?? data).slice(0, 4)))
      .catch(() => {});
  }, [status]);

  function getInitials(name?: string | null) {
    if (!name) return "HV";
    return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  }

  // Auth loading
  if (status === "loading") {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-gray-400 text-sm">Đang tải...</div>
        </main>
      </div>
    );
  }

  // Build stat cards from real data
  const statCards = [
    {
      icon: BookOpen,
      label: "Khóa đang học",
      value: loading ? "—" : String(stats?.totalCourses ?? 0),
      color: "text-teal-600 bg-teal-50",
    },
    {
      icon: Clock,
      label: "Tổng giờ học",
      value: loading ? "—" : `${stats?.totalHours ?? 0}h`,
      color: "text-blue-600 bg-blue-50",
    },
    {
      icon: Award,
      label: "Đã hoàn thành",
      value: loading ? "—" : String(stats?.completedCourses ?? 0),
      color: "text-orange-600 bg-orange-50",
    },
    {
      icon: TrendingUp,
      label: "Đánh giá TB",
      value: loading ? "—" : stats?.avgRating != null ? `${stats.avgRating}★` : "—",
      color: "text-purple-600 bg-purple-50",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <main className="flex-1">
        {/* Hero banner */}
        <div className="bg-gradient-to-br from-teal-700 to-teal-900 text-white py-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-xl">
                {getInitials(user?.name)}
              </div>
              <div>
                <h1 className="font-heading text-2xl font-bold">
                  Chào mừng trở lại, {user?.name?.split(" ").pop() ?? "bạn"}! 👋
                </h1>
                <p className="text-teal-200 text-sm mt-0.5">
                  Tiếp tục học tập để đạt mục tiêu của bạn
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">

          {/* Error banner */}
          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />)
              : statCards.map((s, i) => (
                  <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                    <div className={`h-10 w-10 rounded-xl ${s.color} flex items-center justify-center mb-3`}>
                      <s.icon className="h-5 w-5" />
                    </div>
                    <div className="font-heading text-2xl font-bold text-gray-900">{s.value}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
                  </div>
                ))}
          </div>

          {/* Continue learning */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading font-bold text-gray-900 text-xl">Tiếp tục học</h2>
              <Link href="/courses" className="text-sm text-teal-600 hover:underline flex items-center gap-1">
                Khám phá thêm <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {Array.from({ length: 3 }).map((_, i) => <CourseSkeleton key={i} />)}
              </div>
            ) : enrolledCourses.length === 0 ? (
              /* Empty state */
              <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-10 text-center">
                <BookOpen className="mx-auto h-10 w-10 text-gray-300 mb-3" />
                <p className="text-gray-500 font-medium mb-1">Bạn chưa đăng ký khóa học nào</p>
                <p className="text-xs text-gray-400 mb-5">
                  Khám phá hàng trăm khóa học chất lượng cao từ các giảng viên hàng đầu.
                </p>
                <Link
                  href="/courses"
                  className="inline-block rounded-xl bg-teal-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 transition-colors"
                >
                  Khám phá khóa học
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {enrolledCourses.map((course, idx) => {
                  const gradient = gradients[idx % gradients.length];
                  return (
                    <div
                      key={course.enrollmentId}
                      className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className={`h-32 bg-gradient-to-br ${gradient} flex items-center justify-center relative`}>
                        {course.thumbnail ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={course.thumbnail}
                            alt={course.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <PlayCircle className="h-12 w-12 text-white/80" />
                        )}
                        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/20">
                          <div
                            className="h-1.5 bg-teal-400 transition-all"
                            style={{ width: `${course.progressPct}%` }}
                          />
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2">
                          {course.title}
                        </h3>
                        <p className="text-xs text-gray-500 mb-3">
                        </p>
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                          <span>{course.progressPct}% hoàn thành</span>
                          <span>{course.totalLessons} bài</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5 mb-4">
                          <div
                            className="bg-teal-500 h-1.5 rounded-full"
                            style={{ width: `${course.progressPct}%` }}
                          />
                        </div>
                        <Link
                          href={`/courses/${course.slug}`}
                          className="block text-center rounded-lg bg-teal-600 py-2 text-xs font-semibold text-white hover:bg-teal-700 transition-colors"
                        >
                          Tiếp tục học
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recommended (from DB) */}
          <div>
            <h2 className="font-heading font-bold text-gray-900 text-xl mb-4">Có thể bạn sẽ thích</h2>
            {recommended.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {recommended.map((course) => (
                  <Link
                    key={course.id}
                    href={`/courses/${course.slug}`}
                    className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all group"
                  >
                    <div className="h-24 bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center">
                      {course.thumbnail ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={course.thumbnail} alt={course.title} className="h-full w-full object-cover" />
                      ) : (
                        <PlayCircle className="h-8 w-8 text-white/70 group-hover:text-white transition-colors" />
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="font-semibold text-gray-900 text-xs mb-1 line-clamp-2">{course.title}</h3>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        {course.rating != null && (
                          <>
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span>{course.rating}</span>
                          </>
                        )}
                        <span className="ml-auto font-semibold text-gray-900">
                          {formatPrice(course.salePrice ?? course.price)}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : null}
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}
