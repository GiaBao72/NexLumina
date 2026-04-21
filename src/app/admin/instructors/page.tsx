"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Search, Plus, Ban, CheckCircle2, Users, X } from "lucide-react";

type Instructor = {
  id: string; name: string | null; email: string;
  image: string | null; banned: boolean; createdAt: string;
  _count: { courses: number };
};

const emptyForm = { name: "", email: "", password: "" };

function getInitials(name?: string | null, email?: string) {
  if (name) return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  return (email ?? "GV").slice(0, 2).toUpperCase();
}

export default function AdminInstructorsPage() {
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const fetchInstructors = useCallback(async (s: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ search: s });
      const res = await fetch(`/api/admin/instructors?${params}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setInstructors(data.instructors ?? []);
      setTotal(data.total ?? 0);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchInstructors(search), 300);
    return () => clearTimeout(debounceRef.current);
  }, [search, fetchInstructors]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.password) {
      setFormError("Vui lòng điền đầy đủ tên, email và mật khẩu"); return;
    }
    if (form.password.length < 6) { setFormError("Mật khẩu tối thiểu 6 ký tự"); return; }
    setFormLoading(true); setFormError("");
    try {
      const res = await fetch("/api/admin/instructors", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setFormError(data.error ?? "Có lỗi xảy ra"); return; }
      setModal(false); setForm({ ...emptyForm });
      fetchInstructors(search);
    } catch {
      setFormError("Lỗi kết nối. Vui lòng thử lại.");
    } finally {
      setFormLoading(false);
    }
  }

  async function handleBanToggle(inst: Instructor) {
    try {
      const res = await fetch("/api/admin/instructors", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: inst.id, banned: !inst.banned }),
      });
      if (!res.ok) throw new Error();
      fetchInstructors(search);
    } catch {
      alert("Không thể cập nhật. Vui lòng thử lại.");
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Giảng viên</h1>
          <p className="text-sm text-gray-500 mt-0.5">{total} giảng viên</p>
        </div>
        <button onClick={() => { setForm({ ...emptyForm }); setFormError(""); setModal(true); }}
          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-sm">
          <Plus className="h-4 w-4" />Thêm giảng viên
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm giảng viên..."
          className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white" />
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="divide-y divide-gray-50">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-4">
                <div className="h-10 w-10 rounded-full bg-gray-100 animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-32 bg-gray-100 rounded animate-pulse" />
                  <div className="h-3 w-48 bg-gray-100 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : instructors.length === 0 ? (
          <div className="py-16 text-center">
            <Users className="h-10 w-10 text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-400">Chưa có giảng viên nào</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {instructors.map((inst) => (
              <div key={inst.id} className={`flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors ${inst.banned ? "opacity-60" : ""}`}>
                {inst.image ? (
                  <img src={inst.image} alt={inst.name ?? ""} className="h-10 w-10 rounded-full object-cover flex-shrink-0" />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center text-sm font-bold text-teal-700 flex-shrink-0">
                    {getInitials(inst.name, inst.email)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900">{inst.name ?? "—"}</p>
                    {inst.banned && <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-medium">Bị khóa</span>}
                  </div>
                  <p className="text-xs text-gray-400">{inst.email}</p>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0">
                  <span className="text-sm text-gray-500">{inst._count.courses} khóa học</span>
                  <button onClick={() => handleBanToggle(inst)}
                    className={`p-1.5 rounded-lg transition-colors ${inst.banned ? "hover:bg-green-50 text-green-500 hover:text-green-600" : "hover:bg-red-50 text-gray-400 hover:text-red-500"}`}
                    title={inst.banned ? "Bỏ khóa" : "Khóa tài khoản"}>
                    {inst.banned ? <CheckCircle2 className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md z-10">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Thêm giảng viên</h2>
              <button onClick={() => setModal(false)} className="p-1.5 rounded-lg hover:bg-gray-100"><X className="h-4 w-4 text-gray-400" /></button>
            </div>
            <form onSubmit={handleCreate} className="px-6 py-4 space-y-4">
              {formError && <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-2.5 text-sm text-red-600">{formError}</div>}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Họ tên *</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required autoFocus
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Email *</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Mật khẩu *</label>
                <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6}
                  placeholder="Tối thiểu 6 ký tự"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={formLoading}
                  className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                  {formLoading ? <><div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Đang tạo...</> : "Tạo giảng viên"}
                </button>
                <button type="button" onClick={() => setModal(false)}
                  className="flex-1 py-2.5 border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors">Hủy</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
