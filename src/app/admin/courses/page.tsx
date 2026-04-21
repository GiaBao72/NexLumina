"use client";
import { useState } from "react";
import { mockCourses, categories, formatPrice, levelLabel } from "@/lib/mock-data";
import Link from "next/link";
import { Plus, Search, Pencil, Archive, CheckSquare, Square, ChevronLeft, ChevronRight } from "lucide-react";

const statusColors: Record<string,string> = {
  PUBLISHED: "bg-green-100 text-green-700",
  DRAFT: "bg-gray-100 text-gray-600",
  ARCHIVED: "bg-red-100 text-red-500",
};
const statusLabel: Record<string,string> = {
  PUBLISHED: "Đang bán", DRAFT: "Nháp", ARCHIVED: "Lưu trữ",
};
const mockStatuses = ["PUBLISHED","PUBLISHED","PUBLISHED","DRAFT","PUBLISHED","PUBLISHED","DRAFT","PUBLISHED","ARCHIVED","PUBLISHED","DRAFT","PUBLISHED"];

export default function AdminCoursesPage() {
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selected, setSelected] = useState<string[]>([]);

  const filtered = mockCourses.filter(c =>
    (!search || c.title.toLowerCase().includes(search.toLowerCase()) || c.instructor.toLowerCase().includes(search.toLowerCase())) &&
    (!catFilter || c.categorySlug === catFilter) &&
    (!statusFilter || mockStatuses[parseInt(c.id)-1] === statusFilter)
  );

  const toggleAll = () => setSelected(selected.length===filtered.length?[]:filtered.map(c=>c.id));
  const toggleOne = (id:string) => setSelected(s=>s.includes(id)?s.filter(x=>x!==id):[...s,id]);

  const miniStats = [
    {label:"Tổng",value:mockCourses.length,color:"text-gray-900"},
    {label:"Đang bán",value:mockStatuses.filter(s=>s==="PUBLISHED").length,color:"text-green-600"},
    {label:"Nháp",value:mockStatuses.filter(s=>s==="DRAFT").length,color:"text-gray-500"},
    {label:"Lưu trữ",value:mockStatuses.filter(s=>s==="ARCHIVED").length,color:"text-red-500"},
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-gray-900">Quản lý khóa học</h1>
          <p className="text-sm text-gray-500 mt-0.5">{mockCourses.length} khóa học</p>
        </div>
        <button className="flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-500 transition-colors">
          <Plus className="h-4 w-4"/>Thêm khóa học
        </button>
      </div>

      {/* Mini stats */}
      <div className="grid grid-cols-4 gap-3">
        {miniStats.map(s=>(
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 px-4 py-3 shadow-sm text-center">
            <div className={`font-heading text-xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Tìm khóa học..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"/>
        </div>
        <select value={catFilter} onChange={e=>setCatFilter(e.target.value)}
          className="rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-700 bg-white">
          <option value="">Tất cả danh mục</option>
          {categories.map(c=><option key={c.slug} value={c.slug}>{c.name}</option>)}
        </select>
        <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}
          className="rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-700 bg-white">
          <option value="">Tất cả trạng thái</option>
          <option value="PUBLISHED">Đang bán</option>
          <option value="DRAFT">Nháp</option>
          <option value="ARCHIVED">Lưu trữ</option>
        </select>
      </div>

      {/* Bulk actions */}
      {selected.length>0 && (
        <div className="bg-teal-50 border border-teal-200 rounded-xl px-4 py-2.5 flex items-center gap-3 text-sm">
          <span className="font-medium text-teal-700">Đã chọn {selected.length} khóa học</span>
          <button className="text-teal-600 hover:underline">Xuất bản</button>
          <button className="text-gray-500 hover:underline">Lưu trữ</button>
          <button className="text-red-500 hover:underline">Xóa</button>
          <button onClick={()=>setSelected([])} className="ml-auto text-gray-400 hover:text-gray-600 text-xs">Bỏ chọn</button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 w-10">
                  <button onClick={toggleAll}>
                    {selected.length===filtered.length&&filtered.length>0
                      ?<CheckSquare className="h-4 w-4 text-teal-600"/>
                      :<Square className="h-4 w-4 text-gray-400"/>}
                  </button>
                </th>
                {["Khóa học","Danh mục","Giảng viên","Học viên","Doanh thu","Trạng thái","Thao tác"].map(h=>(
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((c,i)=>{
                const status = mockStatuses[parseInt(c.id)-1]??"PUBLISHED";
                return (
                  <tr key={c.id} className={`hover:bg-gray-50 transition-colors ${selected.includes(c.id)?"bg-teal-50/30":""}`}>
                    <td className="px-4 py-3">
                      <button onClick={()=>toggleOne(c.id)}>
                        {selected.includes(c.id)
                          ?<CheckSquare className="h-4 w-4 text-teal-600"/>
                          :<Square className="h-4 w-4 text-gray-300"/>}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`h-9 w-9 rounded-lg bg-gradient-to-br ${c.gradient} flex-shrink-0`}/>
                        <Link href={`/courses/${c.slug}`} target="_blank"
                          className="text-sm font-medium text-gray-900 hover:text-teal-600 max-w-[160px] truncate block transition-colors">{c.title}</Link>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{c.category}</td>
                    <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{c.instructor}</td>
                    <td className="px-4 py-3 text-gray-700">{(c.reviewCount*3).toLocaleString()}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900 whitespace-nowrap">{formatPrice((c.salePrice??c.price)*(50+i*20))}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusColors[status]}`}>{statusLabel[status]}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button className="p-1.5 rounded-lg hover:bg-teal-50 text-gray-400 hover:text-teal-600 transition-colors"><Pencil className="h-3.5 w-3.5"/></button>
                        <button className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"><Archive className="h-3.5 w-3.5"/></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <span>Hiển thị 1–{filtered.length} trong {mockCourses.length} khóa học</span>
          <div className="flex items-center gap-1">
            <button className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40" disabled><ChevronLeft className="h-4 w-4"/></button>
            <span className="px-2 py-1 rounded-lg bg-teal-600 text-white text-xs font-medium">1</span>
            <span className="px-2 py-1 rounded-lg hover:bg-gray-100 cursor-pointer">2</span>
            <button className="p-1.5 rounded-lg hover:bg-gray-100"><ChevronRight className="h-4 w-4"/></button>
          </div>
        </div>
      </div>
    </div>
  );
}
