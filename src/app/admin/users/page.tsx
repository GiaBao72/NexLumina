"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Search, Eye, Ban, CheckCircle2, ChevronLeft, ChevronRight, X } from "lucide-react";

type User = {
  id: string; name: string | null; email: string;
  role: "STUDENT" | "INSTRUCTOR" | "ADMIN";
  banned: boolean; createdAt: string;
  _count: { enrollments: number };
};
type Meta = { total: number; page: number; totalPages: number };

function initials(n?: string | null) {
  if (!n) return "?";
  return n.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}
function fmtDate(d: string) { return new Date(d).toLocaleDateString("vi-VN"); }

const roleColors: Record<string, string> = {
  ADMIN: "bg-purple-100 text-purple-700",
  INSTRUCTOR: "bg-blue-100 text-blue-700",
  STUDENT: "bg-gray-100 text-gray-600",
};
const roleLabels: Record<string, string> = {
  ADMIN: "Quản trị", INSTRUCTOR: "Giảng viên", STUDENT: "Học viên",
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [meta, setMeta] = useState<Meta>({ total: 0, page: 1, totalPages: 1 });
  const [roleCounts, setRoleCounts] = useState({ STUDENT: 0, INSTRUCTOR: 0, ADMIN: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [page, setPage] = useState(1);
  const [viewUser, setViewUser] = useState<User | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const fetchUsers = useCallback(async (s: string, r: string, p: number) => {
    setLoading(true); setFetchError("");
    try {
      const params = new URLSearchParams({ page: String(p), limit: "10", search: s, role: r });
      const res = await fetch(`/api/admin/users?${params}`);
      if (!res.ok) throw new Error("Lỗi server");
      const data = await res.json();
      setUsers(data.users ?? []);
      setMeta({ total: data.total ?? 0, page: data.page ?? 1, totalPages: data.totalPages ?? 1 });
      setRoleCounts({ STUDENT: data.roleCounts?.STUDENT ?? 0, INSTRUCTOR: data.roleCounts?.INSTRUCTOR ?? 0, ADMIN: data.roleCounts?.ADMIN ?? 0 });
    } catch {
      setFetchError("Không thể tải danh sách người dùng. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchUsers(search, role, page), 300);
    return () => clearTimeout(debounceRef.current);
  }, [search, role, page, fetchUsers]);

  async function handleBanToggle(user: User) {
    setActionLoading(user.id);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: user.id, action: user.banned ? "unban" : "ban" }),
      });
      if (!res.ok) throw new Error();
      setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, banned: !u.banned } : u));
      if (viewUser?.id === user.id) setViewUser({ ...viewUser, banned: !viewUser.banned });
    } catch {
      alert("Không thể cập nhật trạng thái. Vui lòng thử lại.");
    } finally {
      setActionLoading(null);
    }
  }

  // Stats cards dùng roleCounts từ DB
  const stats = [
    { label: "Tổng người dùng", value: meta.total },
    { label: "Học viên", value: roleCounts.STUDENT },
    { label: "Giảng viên", value: roleCounts.INSTRUCTOR },
    { label: "Quản trị", value: roleCounts.ADMIN },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Người dùng</h1>
          <p className="text-sm text-gray-500 mt-0.5">{meta.total.toLocaleString()} tài khoản</p>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-4 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 px-4 py-3 text-center shadow-sm">
            <p className="text-xl font-bold text-gray-700">{s.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {fetchError && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">{fetchError}</div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Tìm theo tên hoặc email..."
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white" />
        </div>
        <select value={role} onChange={(e) => { setRole(e.target.value); setPage(1); }}
          className="sm:w-48 px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white">
          <option value="">Tất cả vai trò</option>
          <option value="STUDENT">Học viên</option>
          <option value="INSTRUCTOR">Giảng viên</option>
          <option value="ADMIN">Quản trị</option>
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
                <div className="h-6 w-20 bg-gray-100 rounded-full animate-pulse" />
              </div>
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="py-16 text-center text-sm text-gray-400">Không tìm thấy người dùng nào</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Người dùng</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Vai trò</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">Ngày tham gia</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Khóa học</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Trạng thái</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-teal-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                          {initials(u.name)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 truncate">{u.name ?? "—"}</p>
                          <p className="text-xs text-gray-400 truncate">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${roleColors[u.role]}`}>
                        {roleLabels[u.role]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{fmtDate(u.createdAt)}</td>
                    <td className="px-4 py-3 text-center text-gray-700 font-medium hidden md:table-cell">{u._count.enrollments}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${u.banned ? "bg-red-100 text-red-600" : "bg-green-100 text-green-700"}`}>
                        {u.banned ? "Bị khóa" : "Hoạt động"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <button onClick={() => setViewUser(u)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-teal-600 transition-colors" title="Xem chi tiết">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleBanToggle(u)} disabled={actionLoading === u.id}
                          className={`p-1.5 rounded-lg transition-colors ${u.banned ? "hover:bg-green-50 text-gray-400 hover:text-green-600" : "hover:bg-red-50 text-gray-400 hover:text-red-500"}`}
                          title={u.banned ? "Mở khóa" : "Khóa tài khoản"}>
                          {actionLoading === u.id
                            ? <div className="h-4 w-4 border-2 border-gray-300 border-t-teal-500 rounded-full animate-spin" />
                            : u.banned ? <CheckCircle2 className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                        </button>
                      </div>
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
            <p className="text-xs text-gray-400">Trang {meta.page}/{meta.totalPages} · {meta.total} người dùng</p>
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

      {/* View Modal */}
      {viewUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setViewUser(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 z-10">
            <button onClick={() => setViewUser(null)} className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-gray-100">
              <X className="h-4 w-4 text-gray-400" />
            </button>
            <div className="flex items-center gap-4 mb-6">
              <div className="h-14 w-14 rounded-full bg-teal-600 flex items-center justify-center text-xl font-bold text-white">
                {initials(viewUser.name)}
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">{viewUser.name ?? "Chưa có tên"}</h2>
                <p className="text-sm text-gray-400">{viewUser.email}</p>
              </div>
            </div>
            <div className="space-y-3">
              {[
                ["Vai trò", <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${roleColors[viewUser.role]}`}>{roleLabels[viewUser.role]}</span>],
                ["Trạng thái", <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${viewUser.banned ? "bg-red-100 text-red-600" : "bg-green-100 text-green-700"}`}>{viewUser.banned ? "Bị khóa" : "Hoạt động"}</span>],
                ["Ngày tham gia", fmtDate(viewUser.createdAt)],
                ["Khóa học đã mua", `${viewUser._count.enrollments} khóa`],
              ].map(([label, val]) => (
                <div key={String(label)} className="flex items-center justify-between py-2 border-b border-gray-50">
                  <span className="text-sm text-gray-500">{label as string}</span>
                  <span className="text-sm font-medium text-gray-900">{val as React.ReactNode}</span>
                </div>
              ))}
            </div>
            <div className="mt-5 flex gap-3">
              <button onClick={() => { handleBanToggle(viewUser); }}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors ${viewUser.banned ? "bg-green-600 hover:bg-green-700 text-white" : "bg-red-500 hover:bg-red-600 text-white"}`}>
                {viewUser.banned ? "Mở khóa tài khoản" : "Khóa tài khoản"}
              </button>
              <button onClick={() => setViewUser(null)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 hover:bg-gray-50 text-gray-700 transition-colors">
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
