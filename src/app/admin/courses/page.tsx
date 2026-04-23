"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus, Pencil, Archive, ChevronLeft, ChevronRight, X, Trash2, BookOpen, Eye } from "lucide-react";

type Course = {
  id: string; title: string; slug: string; price: number; salePrice: number | null;
  status: "PUBLISHED" | "DRAFT" | "ARCHIVED"; level: string; featured: boolean;
  category: { id: string; name: string; slug: string };
  _count: { enrollments: number };
};
type Meta = { total: number; page: number; totalPages: number };
type Category = { id: string; name: string; slug: string };
type CourseStats = { total: number; published: number; draft: number; archived: number };

const statusColors: Record<string, string> = {
  PUBLISHED: "bg-teal-100 text-teal-700",
  DRAFT: "bg-yellow-100 text-yellow-700",
  ARCHIVED: "bg-gray-100 text-gray-500",
};
const statusLabels: Record<string, string> = { PUBLISHED: "Đang bán", DRAFT: "Nháp", ARCHIVED: "Lưu trữ" };
const levelLabels: Record<string, string> = { BEGINNER: "Cơ bản", INTERMEDIATE: "Trung cấp", ADVANCED: "Nâng cao" };
function fmtVND(n: number) { return n.toLocaleString("vi-VN") + "₫"; }

const emptyForm = {
  title: "", description: "", price: "", salePrice: "",
  level: "BEGINNER", status: "DRAFT",
  categoryId: "",
  featured: false, thumbnail: "",
};

export default function AdminCoursesPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [meta, setMeta] = useState<Meta>({ total: 0, page: 1, totalPages: 1 });
  const [stats, setStats] = useState<CourseStats>({ total: 0, published: 0, draft: 0, archived: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<string[]>([]);
  const [modal, setModal] = useState<"add" | "edit" | null>(null);
  const [editTarget, setEditTarget] = useState<Course | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  // Dropdowns
  const [categories, setCategories] = useState<Category[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Fetch categories khi mount
  useEffect(() => {
    Promise.all([
      fetch("/api/admin/categories").then(r => r.json()).catch(() => ({ categories: [] })),
    ]).then(([catData]) => {
      setCategories(catData.categories ?? []);
    });
  }, []);

  const fetchCourses = useCallback(async (s: string, st: string, p: number) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(p), limit: "10", search: s, status: st });
      const res = await fetch(`/api/admin/courses?${params}`);
      if (!res.ok) throw new Error("Lỗi server");
      const data = await res.json();
      setCourses(data.courses ?? []);
      setMeta({ total: data.total ?? 0, page: data.page ?? 1, totalPages: data.totalPages ?? 1 });
      setStats({
        total: data.total ?? 0,
        published: data.statusCounts?.PUBLISHED ?? 0,
        draft: data.statusCounts?.DRAFT ?? 0,
        archived: data.statusCounts?.ARCHIVED ?? 0,
      });
    } catch {
      // Không crash UI
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchCourses(search, statusFilter, page), 300);
    return () => clearTimeout(debounceRef.current);
  }, [search, statusFilter, page, fetchCourses]);

  function openAdd() {
    setForm({ ...emptyForm });
    setEditTarget(null); setFormError(""); setModal("add");
  }
  function openEdit(c: Course) {
    setForm({
      title: c.title,
      description: "",      // description không được include trong list — placeholder
      price: String(c.price),
      salePrice: c.salePrice ? String(c.salePrice) : "",
      level: c.level,
      status: c.status,
      categoryId: c.category.id,   // dùng ID, không phải slug
      featured: c.featured,
      thumbnail: "",
    });
    setEditTarget(c); setFormError(""); setModal("edit");
  }

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) { setFormError("Tên khóa học không được để trống"); return; }
    if (!form.categoryId) { setFormError("Vui lòng chọn danh mục"); return; }
    setFormLoading(true); setFormError("");
    try {
      const body = {
        ...form,
        title: form.title.trim(),
        price: Number(form.price) || 0,
        salePrice: form.salePrice ? Number(form.salePrice) : null,
      };
      const res = modal === "add"
        ? await fetch("/api/admin/courses", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
        : await fetch("/api/admin/courses", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: editTarget!.id, ...body }) });
      const data = await res.json();
      if (!res.ok) { setFormError(data.error ?? "Có lỗi xảy ra"); return; }
      setModal(null);
      fetchCourses(search, statusFilter, page);
    } catch {
      setFormError("Lỗi kết nối. Vui lòng thử lại.");
    } finally {
      setFormLoading(false);
    }
  }

  async function handleStatusToggle(c: Course) {
    const action = c.status === "PUBLISHED" ? "archive" : "publish";
    try {
      const res = await fetch("/api/admin/courses", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: c.id, action }),
      });
      if (!res.ok) throw new Error();
      fetchCourses(search, statusFilter, page);
    } catch {
      alert("Không thể cập nhật trạng thái. Vui lòng thử lại.");
    }
  }

  async function handleBulkAction(action: "publish" | "archive") {
    try {
      const res = await fetch("/api/admin/courses", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selected, action }),
      });
      if (!res.ok) throw new Error();
      setSelected([]);
      fetchCourses(search, statusFilter, page);
    } catch {
      alert("Không thể thực hiện hành động hàng loạt. Vui lòng thử lại.");
    }
  }

  async function handleBulkDelete() {
    setDeleteLoading(true);
    try {
      const res = await fetch("/api/admin/courses", {
        method: "DELETE", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selected }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error ?? "Không thể xóa. Có thể một số khóa học đang có học viên.");
        return;
      }
      setSelected([]); setDeleteConfirm(false);
      fetchCourses(search, statusFilter, page);
    } catch {
      alert("Lỗi kết nối. Vui lòng thử lại.");
    } finally {
      setDeleteLoading(false);
    }
  }

  const allSelected = courses.length > 0 && selected.length === courses.length;

  // Stats cards dùng data tổng từ API (qua statusCounts), fallback về đếm page
  const statsCards = [
    { label: "Tổng", value: stats.total || meta.total, color: "text-gray-700" },
    { label: "Đang bán", value: stats.published, color: "text-teal-600" },
    { label: "Nháp", value: stats.draft, color: "text-yellow-600" },
    { label: "Lưu trữ", value: stats.archived, color: "text-gray-400" },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Khóa học</h1>
          <p className="text-sm text-gray-500 mt-0.5">{meta.total.toLocaleString()} khóa học</p>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-sm">
          <Plus className="h-4 w-4" />Thêm khóa học
        </button>
      </div>

      {/* Mini stats */}
      <div className="grid grid-cols-4 gap-3">
        {statsCards.map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 px-4 py-3 text-center shadow-sm">
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Tìm khóa học..." className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white" />
        </div>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="sm:w-44 px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white">
          <option value="">Tất cả trạng thái</option>
          <option value="PUBLISHED">Đang bán</option>
          <option value="DRAFT">Nháp</option>
          <option value="ARCHIVED">Lưu trữ</option>
        </select>
      </div>

      {/* Bulk action bar */}
      {selected.length > 0 && (
        <div className="flex items-center gap-3 bg-teal-50 border border-teal-200 rounded-xl px-4 py-2.5">
          <span className="text-sm font-medium text-teal-700">Đã chọn {selected.length} khóa học</span>
          <div className="flex gap-2 ml-auto">
            <button onClick={() => handleBulkAction("publish")} className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-teal-600 text-white hover:bg-teal-700 transition-colors">Xuất bản</button>
            <button onClick={() => handleBulkAction("archive")} className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors">Lưu trữ</button>
            <button onClick={() => setDeleteConfirm(true)} className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors flex items-center gap-1"><Trash2 className="h-3 w-3" />Xóa</button>
            <button onClick={() => setSelected([])} className="text-xs text-gray-400 hover:text-gray-600 px-2">Bỏ chọn</button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="divide-y divide-gray-50">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-4">
                <div className="h-10 w-16 rounded-lg bg-gray-100 animate-pulse" />
                <div className="flex-1 space-y-2"><div className="h-3 w-48 bg-gray-100 rounded animate-pulse" /><div className="h-3 w-32 bg-gray-100 rounded animate-pulse" /></div>
              </div>
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="py-16 text-center">
            <BookOpen className="h-10 w-10 text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-400">Không tìm thấy khóa học nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-4 py-3">
                    <input type="checkbox" checked={allSelected} onChange={() => setSelected(allSelected ? [] : courses.map((c) => c.id))}
                      className="rounded border-gray-300 text-teal-600 focus:ring-teal-500" />
                  </th>
                  <th className="text-left px-2 py-3 text-xs font-semibold text-gray-500 uppercase">Khóa học</th>
                  <th className="text-left px-3 py-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Danh mục</th>
                  <th className="text-center px-3 py-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Học viên</th>
                  <th className="text-right px-3 py-3 text-xs font-semibold text-gray-500 uppercase">Giá</th>
                  <th className="text-left px-3 py-3 text-xs font-semibold text-gray-500 uppercase">Trạng thái</th>
                  <th className="px-3 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {courses.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <input type="checkbox" checked={selected.includes(c.id)} onChange={() => setSelected((prev) => prev.includes(c.id) ? prev.filter((x) => x !== c.id) : [...prev, c.id])}
                        className="rounded border-gray-300 text-teal-600 focus:ring-teal-500" />
                    </td>
                    <td className="px-2 py-3 max-w-[200px]">
                      <p className="font-medium text-gray-900 truncate">{c.title}</p>
                      <p className="text-xs text-gray-400">{levelLabels[c.level] ?? c.level}</p>
                    </td>
                    <td className="px-3 py-3 text-gray-500 hidden md:table-cell">{c.category.name}</td>
                    <td className="px-3 py-3 text-center text-gray-700 font-medium hidden md:table-cell">{c._count.enrollments}</td>
                    <td className="px-3 py-3 text-right">
                      <p className="font-semibold text-gray-900">{c.salePrice ? fmtVND(c.salePrice) : fmtVND(c.price)}</p>
                      {c.salePrice && <p className="text-xs text-gray-400 line-through">{fmtVND(c.price)}</p>}
                    </td>
                    <td className="px-3 py-3">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColors[c.status]}`}>
                        {statusLabels[c.status]}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <button onClick={() => router.push(`/admin/courses/${c.id}`)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-blue-600 transition-colors" title="Chi tiết">
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-teal-600 transition-colors" title="Sửa">
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => handleStatusToggle(c)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-orange-500 transition-colors" title={c.status === "PUBLISHED" ? "Lưu trữ" : "Xuất bản"}>
                          <Archive className="h-3.5 w-3.5" />
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
            <p className="text-xs text-gray-400">Trang {meta.page}/{meta.totalPages} · {meta.total} khóa học</p>
            <div className="flex gap-1">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40"><ChevronLeft className="h-4 w-4 text-gray-500" /></button>
              {Array.from({ length: Math.min(5, meta.totalPages) }, (_, i) => {
                const p = Math.max(1, Math.min(meta.totalPages - 4, page - 2)) + i;
                return <button key={p} onClick={() => setPage(p)} className={`w-8 h-8 text-xs rounded-lg border transition-colors ${p === page ? "bg-teal-600 border-teal-600 text-white" : "border-gray-200 hover:bg-gray-50 text-gray-600"}`}>{p}</button>;
              })}
              <button onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))} disabled={page >= meta.totalPages} className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40"><ChevronRight className="h-4 w-4 text-gray-500" /></button>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="absolute inset-0 bg-black/50" onClick={() => setModal(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg my-4 z-10">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">{modal === "add" ? "Thêm khóa học" : "Sửa khóa học"}</h2>
              <button onClick={() => setModal(null)} className="p-1.5 rounded-lg hover:bg-gray-100"><X className="h-4 w-4 text-gray-400" /></button>
            </div>
            <form onSubmit={handleFormSubmit} className="px-6 py-4 space-y-4">
              {formError && <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-2.5 text-sm text-red-600">{formError}</div>}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Tên khóa học *</label>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Mô tả</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none" />
              </div>
              {/* Category dropdown */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Danh mục *</label>
                <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} required
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white">
                  <option value="">-- Chọn danh mục --</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                {categories.length === 0 && (
                  <p className="text-xs text-amber-500 mt-1">Chưa có danh mục. <a href="/admin/categories" className="underline">Tạo ngay</a></p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Giá gốc (₫)</label>
                  <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} min="0"
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Giá khuyến mãi (₫)</label>
                  <input type="number" value={form.salePrice} onChange={(e) => setForm({ ...form, salePrice: e.target.value })} min="0"
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Cấp độ</label>
                  <select value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white">
                    <option value="BEGINNER">Cơ bản</option>
                    <option value="INTERMEDIATE">Trung cấp</option>
                    <option value="ADVANCED">Nâng cao</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Trạng thái</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white">
                    <option value="DRAFT">Nháp</option>
                    <option value="PUBLISHED">Xuất bản</option>
                    <option value="ARCHIVED">Lưu trữ</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="featured" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                  className="rounded border-gray-300 text-teal-600 focus:ring-teal-500" />
                <label htmlFor="featured" className="text-sm text-gray-700">Đánh dấu nổi bật</label>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={formLoading}
                  className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                  {formLoading ? <><div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Đang lưu...</> : (modal === "add" ? "Tạo khóa học" : "Lưu thay đổi")}
                </button>
                <button type="button" onClick={() => setModal(null)}
                  className="flex-1 py-2.5 border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors">Hủy</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDeleteConfirm(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 z-10 text-center">
            <div className="h-14 w-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="h-6 w-6 text-red-500" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Xác nhận xóa</h2>
            <p className="text-sm text-gray-500 mb-5">
              Xóa {selected.length} khóa học đã chọn?<br />
              <span className="text-red-500 font-medium">Không thể xóa nếu còn học viên đã đăng ký.</span>
            </p>
            <div className="flex gap-3">
              <button onClick={handleBulkDelete} disabled={deleteLoading}
                className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                {deleteLoading ? <><div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Đang xóa...</> : "Xóa"}
              </button>
              <button onClick={() => setDeleteConfirm(false)} className="flex-1 py-2.5 border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors">Hủy</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
