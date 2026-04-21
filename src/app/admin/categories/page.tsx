"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Search, Plus, Pencil, Trash2, Tag, X } from "lucide-react";

type Category = {
  id: string; name: string; slug: string;
  icon: string | null; description: string | null;
  _count: { courses: number };
};

const emptyForm = { name: "", description: "", icon: "" };

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<"add" | "edit" | null>(null);
  const [editTarget, setEditTarget] = useState<Category | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const fetchCategories = useCallback(async (s: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ search: s });
      const res = await fetch(`/api/admin/categories?${params}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setCategories(data.categories ?? []);
      setTotal(data.total ?? 0);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchCategories(search), 300);
    return () => clearTimeout(debounceRef.current);
  }, [search, fetchCategories]);

  function openAdd() { setForm({ ...emptyForm }); setEditTarget(null); setFormError(""); setModal("add"); }
  function openEdit(c: Category) {
    setForm({ name: c.name, description: c.description ?? "", icon: c.icon ?? "" });
    setEditTarget(c); setFormError(""); setModal("edit");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { setFormError("Tên danh mục không được để trống"); return; }
    setFormLoading(true); setFormError("");
    try {
      const body = { name: form.name.trim(), description: form.description, icon: form.icon };
      const res = modal === "add"
        ? await fetch("/api/admin/categories", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
        : await fetch("/api/admin/categories", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: editTarget!.id, ...body }) });
      const data = await res.json();
      if (!res.ok) { setFormError(data.error ?? "Có lỗi xảy ra"); return; }
      setModal(null);
      fetchCategories(search);
    } catch {
      setFormError("Lỗi kết nối. Vui lòng thử lại.");
    } finally {
      setFormLoading(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const res = await fetch("/api/admin/categories", {
        method: "DELETE", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: deleteTarget.id }),
      });
      const data = await res.json();
      if (!res.ok) { alert(data.error ?? "Không thể xóa"); return; }
      setDeleteTarget(null);
      fetchCategories(search);
    } catch {
      alert("Lỗi kết nối.");
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Danh mục</h1>
          <p className="text-sm text-gray-500 mt-0.5">{total} danh mục</p>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-sm">
          <Plus className="h-4 w-4" />Thêm danh mục
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm danh mục..."
          className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white" />
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="divide-y divide-gray-50">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-4">
                <div className="h-9 w-9 rounded-xl bg-gray-100 animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-32 bg-gray-100 rounded animate-pulse" />
                  <div className="h-3 w-48 bg-gray-100 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="py-16 text-center">
            <Tag className="h-10 w-10 text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-400">Chưa có danh mục nào</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {categories.map((cat) => (
              <div key={cat.id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors">
                <div className="h-9 w-9 rounded-xl bg-teal-100 flex items-center justify-center text-lg flex-shrink-0">
                  {cat.icon || <Tag className="h-4 w-4 text-teal-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900">{cat.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{cat.description || <span className="italic">Chưa có mô tả</span>}</p>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0">
                  <span className="text-sm text-gray-500">{cat._count.courses} khóa học</span>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(cat)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-teal-600 transition-colors" title="Sửa">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => setDeleteTarget(cat)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-red-500 transition-colors" title="Xóa">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setModal(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md z-10">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">{modal === "add" ? "Thêm danh mục" : "Sửa danh mục"}</h2>
              <button onClick={() => setModal(null)} className="p-1.5 rounded-lg hover:bg-gray-100"><X className="h-4 w-4 text-gray-400" /></button>
            </div>
            <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
              {formError && <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-2.5 text-sm text-red-600">{formError}</div>}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Tên danh mục *</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required autoFocus
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Mô tả</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Icon (emoji)</label>
                <input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} placeholder="📚"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={formLoading}
                  className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                  {formLoading ? <><div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Đang lưu...</> : (modal === "add" ? "Tạo danh mục" : "Lưu thay đổi")}
                </button>
                <button type="button" onClick={() => setModal(null)}
                  className="flex-1 py-2.5 border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors">Hủy</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDeleteTarget(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 z-10 text-center">
            <div className="h-14 w-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="h-6 w-6 text-red-500" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Xóa danh mục</h2>
            <p className="text-sm text-gray-500 mb-5">
              Xóa <strong>{deleteTarget.name}</strong>?<br />
              {deleteTarget._count.courses > 0 && (
                <span className="text-red-500">Không thể xóa vì có {deleteTarget._count.courses} khóa học.</span>
              )}
            </p>
            <div className="flex gap-3">
              <button onClick={handleDelete} disabled={deleteLoading || deleteTarget._count.courses > 0}
                className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-40">
                {deleteLoading ? "Đang xóa..." : "Xóa"}
              </button>
              <button onClick={() => setDeleteTarget(null)} className="flex-1 py-2.5 border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors">Hủy</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
