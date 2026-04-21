"use client";
import { useEffect, useState } from "react";
import { TrendingUp, Users, BookOpen, ShoppingBag, DollarSign } from "lucide-react";

type Stats = {
  totalRevenue: number; revenueGrowth: number | null;
  totalUsers: number; newUsersThisMonth: number;
  totalCourses: number; publishedCourses: number;
  totalOrders: number; ordersThisMonth: number;
};
type ChartPoint = { label: string; value: number };
type Order = { id: string; userName: string | null; userEmail: string; courseTitle: string; total: number; status: string; createdAt: string };
type Course = { id: string; title: string; instructor: string | null; enrollments: number; status: string };

function formatVND(n: number) { return n.toLocaleString("vi-VN") + "₫"; }
function fmt(d: string) { return new Date(d).toLocaleDateString("vi-VN"); }
function initials(name?: string | null) {
  if (!name) return "?";
  return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

const statusColor: Record<string, string> = {
  PAID: "bg-green-100 text-green-700", PENDING: "bg-yellow-100 text-yellow-700",
  FAILED: "bg-red-100 text-red-700", REFUNDED: "bg-gray-100 text-gray-600",
  PUBLISHED: "bg-teal-100 text-teal-700", DRAFT: "bg-yellow-100 text-yellow-700",
  ARCHIVED: "bg-gray-100 text-gray-600",
};
const statusLabel: Record<string, string> = {
  PAID: "Đã thanh toán", PENDING: "Chờ xử lý", FAILED: "Thất bại", REFUNDED: "Hoàn tiền",
  PUBLISHED: "Đang bán", DRAFT: "Nháp", ARCHIVED: "Lưu trữ",
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((d) => {
        setStats(d.stats); setChartData(d.chartData);
        setOrders(d.latestOrders); setCourses(d.topCourses);
      })
      .finally(() => setLoading(false));
  }, []);

  const maxChart = Math.max(...chartData.map((c) => c.value), 1);
  const allZero = chartData.every((c) => c.value === 0);

  const statCards = stats ? [
    { label: "Tổng doanh thu", value: formatVND(stats.totalRevenue), icon: DollarSign, color: "bg-teal-50 text-teal-600", trend: stats.revenueGrowth },
    { label: "Học viên mới tháng này", value: stats.newUsersThisMonth.toLocaleString(), sub: `/${stats.totalUsers.toLocaleString()} tổng`, icon: Users, color: "bg-blue-50 text-blue-600", trend: null },
    { label: "Khóa học đang bán", value: stats.publishedCourses.toLocaleString(), sub: `/${stats.totalCourses.toLocaleString()} tổng`, icon: BookOpen, color: "bg-purple-50 text-purple-600", trend: null },
    { label: "Đơn hàng tháng này", value: stats.ordersThisMonth.toLocaleString(), sub: `/${stats.totalOrders.toLocaleString()} tổng`, icon: ShoppingBag, color: "bg-orange-50 text-orange-600", trend: null },
  ] : [];

  if (loading) return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-28 rounded-2xl bg-gray-100 animate-pulse" />)}
      </div>
      <div className="h-64 rounded-2xl bg-gray-100 animate-pulse" />
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="h-80 rounded-2xl bg-gray-100 animate-pulse" />
        <div className="h-80 rounded-2xl bg-gray-100 animate-pulse" />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Tổng quan hoạt động hệ thống</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((c) => (
          <div key={c.label} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${c.color} mb-3`}>
              <c.icon className="h-5 w-5" />
            </div>
            <p className="text-xs text-gray-500 mb-1">{c.label}</p>
            <p className="text-xl font-bold text-gray-900">{c.value}</p>
            {c.sub && <p className="text-xs text-gray-400 mt-0.5">{c.sub}</p>}
            {c.trend != null && (
              <span className={`inline-flex items-center gap-1 text-xs mt-1 font-medium ${c.trend >= 0 ? "text-green-600" : "text-red-500"}`}>
                <TrendingUp className="h-3 w-3" />{c.trend >= 0 ? "+" : ""}{c.trend}% so tháng trước
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Doanh thu 7 ngày qua</h2>
        {allZero ? (
          <div className="h-40 flex items-center justify-center text-sm text-gray-400">Chưa có dữ liệu đơn hàng</div>
        ) : (
          <div className="flex items-end gap-2 h-40">
            {chartData.map((d) => (
              <div key={d.label} className="flex-1 flex flex-col items-center gap-1 group">
                <div className="relative w-full">
                  <div
                    className="w-full rounded-t-lg bg-teal-500 group-hover:bg-teal-600 transition-colors cursor-default"
                    style={{ height: `${Math.max((d.value / maxChart) * 120, 4)}px` }}
                    title={formatVND(d.value)}
                  />
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] rounded px-1.5 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    {formatVND(d.value)}
                  </div>
                </div>
                <span className="text-[11px] text-gray-400">{d.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent orders */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-700">Đơn hàng gần đây</h2>
          </div>
          {orders.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-gray-400">Chưa có đơn hàng nào</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {orders.map((o) => (
                <div key={o.id} className="flex items-center gap-3 px-5 py-3">
                  <div className="h-8 w-8 rounded-full bg-teal-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                    {initials(o.userName)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{o.userName ?? o.userEmail}</p>
                    <p className="text-xs text-gray-400 truncate">{o.courseTitle}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-semibold text-gray-900">{formatVND(o.total)}</p>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusColor[o.status] ?? "bg-gray-100 text-gray-600"}`}>
                      {statusLabel[o.status] ?? o.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top courses */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-700">Khóa học nổi bật</h2>
          </div>
          {courses.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-gray-400">Chưa có khóa học nào</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {courses.map((c, i) => (
                <div key={c.id} className="flex items-center gap-3 px-5 py-3">
                  <span className="text-sm font-bold text-gray-300 w-5 text-center">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{c.title}</p>
                    <p className="text-xs text-gray-400">{c.instructor}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-semibold text-gray-700">{c.enrollments.toLocaleString()} HV</p>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusColor[c.status] ?? "bg-gray-100 text-gray-600"}`}>
                      {statusLabel[c.status] ?? c.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
