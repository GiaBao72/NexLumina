"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { mockCourses, formatPrice } from "@/lib/mock-data";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  BookOpen, Clock, Award, TrendingUp,
  PlayCircle, ChevronRight, Star,
} from "lucide-react";

const enrolledCourses = mockCourses.slice(0, 3);

const stats = [
  { icon: BookOpen, label: "Khóa đang học", value: "3", color: "text-teal-600 bg-teal-50" },
  { icon: Clock, label: "Giờ học tuần này", value: "4.5h", color: "text-blue-600 bg-blue-50" },
  { icon: Award, label: "Chứng chỉ đã nhận", value: "1", color: "text-orange-600 bg-orange-50" },
  { icon: TrendingUp, label: "Hoàn thành TB", value: "38%", color: "text-purple-600 bg-purple-50" },
];

const progressMap: Record<string, number> = { "1": 65, "2": 30, "3": 8 };

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const user = session?.user;

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
  }, [status, router]);

  function getInitials(name?: string | null) {
    if (!name) return "HV";
    return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  }

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

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <main className="flex-1">
        <div className="bg-gradient-to-br from-teal-700 to-teal-900 text-white py-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-xl">
                {getInitials(user?.name)}
              </div>
              <div>
                <h1 className="font-heading text-2xl font-bold">Chào mừng trở lại, {user?.name?.split(" ").pop() ?? "bạn"}! 👋</h1>
                <p className="text-teal-200 text-sm mt-0.5">Tiếp tục học tập để đạt mục tiêu của bạn</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((s, i) => (
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {enrolledCourses.map((course) => {
                const progress = progressMap[course.id] || 0;
                return (
                  <div key={course.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    <div className={`h-32 bg-gradient-to-br ${course.gradient} flex items-center justify-center relative`}>
                      <PlayCircle className="h-12 w-12 text-white/80" />
                      <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/20">
                        <div className="h-1.5 bg-teal-400 transition-all" style={{ width: `${progress}%` }} />
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2">{course.title}</h3>
                      <p className="text-xs text-gray-500 mb-3">{course.instructor}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                        <span>{progress}% hoàn thành</span>
                        <span>{course.totalLessons} bài</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5 mb-4">
                        <div className="bg-teal-500 h-1.5 rounded-full" style={{ width: `${progress}%` }} />
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
          </div>

          {/* Recommended */}
          <div>
            <h2 className="font-heading font-bold text-gray-900 text-xl mb-4">Có thể bạn sẽ thích</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {mockCourses.slice(3, 7).map((course) => (
                <Link
                  key={course.id}
                  href={`/courses/${course.slug}`}
                  className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all group"
                >
                  <div className={`h-24 bg-gradient-to-br ${course.gradient} flex items-center justify-center`}>
                    <PlayCircle className="h-8 w-8 text-white/70 group-hover:text-white transition-colors" />
                  </div>
                  <div className="p-3">
                    <h3 className="font-semibold text-gray-900 text-xs mb-1 line-clamp-2">{course.title}</h3>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span>{course.rating}</span>
                      <span className="ml-auto font-semibold text-gray-900">
                        {formatPrice(course.salePrice ?? course.price)}
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
