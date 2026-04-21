"use client";
import { mockCourses, formatPrice } from "@/lib/mock-data";
import { TrendingUp, TrendingDown, DollarSign, Users, BookOpen, ShoppingCart } from "lucide-react";

const stats = [
  { label: "Tổng doanh thu", value: "₫284.500.000", trend: "+12.5%", up: true, icon: DollarSign, color: "bg-teal-50 text-teal-600" },
  { label: "Học viên mới", value: "1.248", trend: "+8.2%", up: true, icon: Users, color: "bg-blue-50 text-blue-600" },
  { label: "Khóa học active", value: "12", trend: "+2", up: true, icon: BookOpen, color: "bg-purple-50 text-purple-600" },
  { label: "Đơn hàng tháng này", value: "386", trend: "-3.1%", up: false, icon: ShoppingCart, color: "bg-orange-50 text-orange-600" },
];

const chartData = [65, 40, 80, 55, 90, 70, 95];
const chartDays = ["T2","T3","T4","T5","T6","T7","CN"];
const maxBar = Math.max(...chartData);

const mockOrders = [
  { id: "NL-10023", user: "Trần Minh Khoa", course: "React & Next.js", price: 1299000, status: "Hoàn thành" },
  { id: "NL-10022", user: "Nguyễn Thu Hà", course: "UI/UX Design", price: 799000, status: "Hoàn thành" },
  { id: "NL-10021", user: "Lê Văn Đức", course: "Python & Data", price: 1399000, status: "Đang xử lý" },
  { id: "NL-10020", user: "Phạm Thùy Dung", course: "Digital Marketing", price: 499000, status: "Hoàn thành" },
  { id: "NL-10019", user: "Vũ Minh Tuấn", course: "Flutter & Dart", price: 1099000, status: "Hoàn tiền" },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">Tổng quan hoạt động hôm nay</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className={`h-10 w-10 rounded-xl ${s.color} flex items-center justify-center`}>
                <s.icon className="h-5 w-5" />
              </div>
              <span className={`flex items-center gap-0.5 text-xs font-semibold ${s.up ? "text-green-600" : "text-red-500"}`}>
                {s.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {s.trend}
              </span>
            </div>
            <div className="font-heading text-xl font-bold text-gray-900">{s.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Chart + recent orders */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Bar chart */}
        <div className="xl:col-span-3 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-heading font-semibold text-gray-900">Doanh thu 7 ngày qua</h2>
              <p className="text-xs text-gray-400 mt-0.5">triệu đồng</p>
            </div>
            <span className="text-xs text-green-600 font-semibold bg-green-50 px-2.5 py-1 rounded-full">+18% tuần này</span>
          </div>
          <div className="flex items-end gap-3 h-40">
            {chartData.map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                <span className="text-xs text-gray-400">{Math.round(v*4)}tr</span>
                <div className="w-full rounded-t-lg bg-teal-500 transition-all hover:bg-teal-400" style={{ height: `${(v / maxBar) * 120}px` }} />
                <span className="text-xs text-gray-500">{chartDays[i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent orders */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-heading font-semibold text-gray-900">Đơn hàng gần đây</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {mockOrders.map(o => (
              <div key={o.id} className="px-5 py-3 flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {o.user.split(" ").pop()![0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-900 truncate">{o.user}</p>
                  <p className="text-xs text-gray-400 truncate">{o.course}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs font-semibold text-gray-900">{formatPrice(o.price)}</p>
                  <span className={`text-xs rounded-full px-1.5 py-0.5 font-medium ${
                    o.status==="Hoàn thành"?"text-green-600 bg-green-50":
                    o.status==="Đang xử lý"?"text-blue-600 bg-blue-50":"text-red-500 bg-red-50"
                  }`}>{o.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top courses */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-heading font-semibold text-gray-900">Khóa học nổi bật</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>{["Khóa học","Giảng viên","Học viên","Doanh thu","Trạng thái"].map(h=>(
                <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {mockCourses.slice(0,5).map((c,i)=>(
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className={`h-8 w-8 rounded-lg bg-gradient-to-br ${c.gradient} flex-shrink-0`}/>
                      <span className="text-sm font-medium text-gray-900 max-w-[180px] truncate">{c.title}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-gray-500 text-xs whitespace-nowrap">{c.instructor}</td>
                  <td className="px-5 py-3.5 text-gray-700">{(c.reviewCount*3).toLocaleString()}</td>
                  <td className="px-5 py-3.5 font-semibold text-gray-900">{formatPrice((c.salePrice??c.price)*(100+i*30))}</td>
                  <td className="px-5 py-3.5">
                    <span className="rounded-full bg-green-100 text-green-700 px-2.5 py-0.5 text-xs font-semibold">Đang bán</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
