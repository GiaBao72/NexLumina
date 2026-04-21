"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Search, ChevronLeft, ChevronRight, ShoppingBag, Eye, X } from "lucide-react";

type OrderItem = { course: { title: string }; price: number };
type Order = {
  id: string; total: number; status: string; createdAt: string;
  user: { name: string | null; email: string };
  items: OrderItem[];
};
type Meta = { total: number; page: number; totalPages: number };

const statusColors: Record<string, string> = {
  PAID: "bg-green-100 text-green-700", PENDING: "bg-yellow-100 text-yellow-700",
  FAILED: "bg-red-100 text-red-600", REFUNDED: "bg-gray-100 text-gray-500",
};
const statusLabels: Record<string, string> = {
  PAID: "Đã thanh toán", PENDING: "Chờ xử lý", FAILED: "Thất bại", REFUNDED: "Hoàn tiền",
};
function fmtVND(n: number) { return n.toLocaleString("vi-VN") + "₫"; }
function fmtDate(d: string) { return new Date(d).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }); }
function initials(n?: string | null) { if (!n) return "?"; return n.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase(); }

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [meta, setMeta] = useState<Meta>({ total: 0, page: 1, totalPages: 1 });
  const [statusCounts, setStatusCounts] = useState({ PAID: 0, PENDING: 0, FAILED: 0, REFUNDED: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [viewOrder, setViewOrder] = useState<Order | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const fetchOrders = useCallback(async (s: string, st: string, p: number) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(p), limit: "10", search: s, status: st });
      const res = await fetch(`/api/admin/orders?${params}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setOrders(data.orders ?? []);
      setMeta({ total: data.total ?? 0, page: data.page ?? 1, totalPages: data.totalPages ?? 1 });
      setStatusCounts({ PAID: data.statusCounts?.PAID ?? 0, PENDING: data.statusCounts?.PENDING ?? 0, FAILED: data.statusCounts?.FAILED ?? 0, REFUNDED: data.statusCounts?.REFUNDED ?? 0 });
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchOrders(search, statusFilter, page), 300);
    return () => clearTimeout(debounceRef.current);
  }, [search, statusFilter, page, fetchOrders]);

  async function handleStatusChange(id: string, status: string) {
    setUpdatingId(id);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) throw new Error();
      fetchOrders(search, statusFilter, page);
      if (viewOrder?.id === id) setViewOrder((o) => o ? { ...o, status } : null);
    } catch {
      alert("Không thể cập nhật trạng thái. Vui lòng thử lại.");
    } finally {
      setUpdatingId(null);
    }
  }

  const totalRevenue = statusCounts.PAID;  // dùng count thật, revenue tính ở dashboard

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Đơn hàng</h1>
        <p className="text-sm text-gray-500 mt-0.5">{meta.total.toLocaleString()} đơn hàng</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {(["PAID","PENDING","FAILED","REFUNDED"] as const).map((s) => {
          const count = statusCounts[s];
          return (
            <button key={s} onClick={() => { setStatusFilter(statusFilter === s ? "" : s); setPage(1); }}
              className={`bg-white rounded-xl border px-4 py-3 text-left shadow-sm transition-colors ${statusFilter === s ? "border-teal-400 ring-1 ring-teal-400" : "border-gray-100 hover:border-gray-200"}`}>
              <p className={`text-lg font-bold ${statusColors[s].split(" ")[1]}`}>{count}</p>
              <p className="text-xs text-gray-400 mt-0.5">{statusLabels[s]}</p>
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Tìm theo tên hoặc email..."
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white" />
        </div>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="sm:w-48 px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white">
          <option value="">Tất cả trạng thái</option>
          <option value="PAID">Đã thanh toán</option>
          <option value="PENDING">Chờ xử lý</option>
          <option value="FAILED">Thất bại</option>
          <option value="REFUNDED">Hoàn tiền</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="divide-y divide-gray-50">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-4">
                <div className="h-9 w-9 rounded-full bg-gray-100 animate-pulse flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-40 bg-gray-100 rounded animate-pulse" />
                  <div className="h-3 w-56 bg-gray-100 rounded animate-pulse" />
                </div>
                <div className="h-6 w-24 bg-gray-100 rounded-full animate-pulse" />
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="py-16 text-center">
            <ShoppingBag className="h-10 w-10 text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-400">Chưa có đơn hàng nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Khách hàng</th>
                  <th className="text-left px-3 py-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Khóa học</th>
                  <th className="text-right px-3 py-3 text-xs font-semibold text-gray-500 uppercase">Tổng tiền</th>
                  <th className="text-left px-3 py-3 text-xs font-semibold text-gray-500 uppercase">Trạng thái</th>
                  <th className="text-left px-3 py-3 text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">Ngày đặt</th>
                  <th className="px-3 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-teal-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                          {initials(o.user.name)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 truncate">{o.user.name ?? "—"}</p>
                          <p className="text-xs text-gray-400 truncate">{o.user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-gray-500 hidden md:table-cell max-w-[180px]">
                      <p className="truncate">{o.items[0]?.course.title ?? "—"}</p>
                      {o.items.length > 1 && <p className="text-xs text-gray-400">+{o.items.length - 1} khóa khác</p>}
                    </td>
                    <td className="px-3 py-3 text-right font-semibold text-gray-900">{fmtVND(o.total)}</td>
                    <td className="px-3 py-3">
                      <select value={o.status} disabled={updatingId === o.id}
                        onChange={(e) => handleStatusChange(o.id, e.target.value)}
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-500 ${statusColors[o.status]}`}>
                        <option value="PENDING">Chờ xử lý</option>
                        <option value="PAID">Đã thanh toán</option>
                        <option value="FAILED">Thất bại</option>
                        <option value="REFUNDED">Hoàn tiền</option>
                      </select>
                    </td>
                    <td className="px-3 py-3 text-gray-400 text-xs hidden lg:table-cell whitespace-nowrap">{fmtDate(o.createdAt)}</td>
                    <td className="px-3 py-3">
                      <button onClick={() => setViewOrder(o)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-teal-600 transition-colors" title="Xem chi tiết">
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {meta.totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
            <p className="text-xs text-gray-400">Trang {meta.page}/{meta.totalPages} · {meta.total} đơn hàng</p>
            <div className="flex gap-1">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}
                className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">
                <ChevronLeft className="h-4 w-4 text-gray-500" />
              </button>
              {Array.from({ length: Math.min(5, meta.totalPages) }, (_, i) => {
                const p = Math.max(1, Math.min(meta.totalPages - 4, page - 2)) + i;
                return (
                  <button key={p} onClick={() => setPage(p)}
                    className={`w-8 h-8 text-xs rounded-lg border transition-colors ${p === page ? "bg-teal-600 border-teal-600 text-white" : "border-gray-200 hover:bg-gray-50 text-gray-600"}`}>
                    {p}
                  </button>
                );
              })}
              <button onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))} disabled={page >= meta.totalPages}
                className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">
                <ChevronRight className="h-4 w-4 text-gray-500" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* View Order Modal */}
      {viewOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setViewOrder(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md z-10">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h2 className="text-base font-bold text-gray-900">Chi tiết đơn hàng</h2>
                <p className="text-xs text-gray-400 mt-0.5 font-mono">{viewOrder.id}</p>
              </div>
              <button onClick={() => setViewOrder(null)} className="p-1.5 rounded-lg hover:bg-gray-100"><X className="h-4 w-4 text-gray-400" /></button>
            </div>
            <div className="px-6 py-4 space-y-4">
              {/* Customer */}
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-teal-600 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                  {initials(viewOrder.user.name)}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{viewOrder.user.name ?? "—"}</p>
                  <p className="text-xs text-gray-400">{viewOrder.user.email}</p>
                </div>
              </div>
              {/* Items */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                {viewOrder.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-gray-700 truncate flex-1 mr-3">{item.course.title}</span>
                    <span className="font-semibold text-gray-900 flex-shrink-0">{fmtVND(item.price)}</span>
                  </div>
                ))}
                <div className="border-t border-gray-200 pt-2 flex justify-between text-sm font-bold">
                  <span>Tổng cộng</span>
                  <span className="text-teal-600">{fmtVND(viewOrder.total)}</span>
                </div>
              </div>
              {/* Status + date */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Trạng thái</p>
                  <select value={viewOrder.status} onChange={(e) => handleStatusChange(viewOrder.id, e.target.value)}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-full border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-500 ${statusColors[viewOrder.status]}`}>
                    <option value="PENDING">Chờ xử lý</option>
                    <option value="PAID">Đã thanh toán</option>
                    <option value="FAILED">Thất bại</option>
                    <option value="REFUNDED">Hoàn tiền</option>
                  </select>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400 mb-1">Ngày đặt</p>
                  <p className="text-sm text-gray-700">{fmtDate(viewOrder.createdAt)}</p>
                </div>
              </div>
            </div>
            <div className="px-6 pb-5">
              <button onClick={() => setViewOrder(null)} className="w-full py-2.5 border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors">
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
