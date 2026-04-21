"use client";
import { useState } from "react";
import { Search, Plus, ChevronLeft, ChevronRight, Ban, Eye } from "lucide-react";

type Role = "STUDENT"|"INSTRUCTOR"|"ADMIN";
const roleColors: Record<Role,string> = {
  STUDENT:"bg-blue-100 text-blue-700",
  INSTRUCTOR:"bg-purple-100 text-purple-700",
  ADMIN:"bg-orange-100 text-orange-700",
};
const roleLabel: Record<Role,string> = { STUDENT:"Học viên", INSTRUCTOR:"Giảng viên", ADMIN:"Admin" };

const mockUsers = [
  {id:"u1",name:"Nguyễn Văn Hùng",email:"hung.nv@example.com",role:"INSTRUCTOR" as Role,joined:"10/01/2025",courses:1,status:"Active",avatar:"NVH"},
  {id:"u2",name:"Trần Minh Khoa",email:"khoa.tm@example.com",role:"STUDENT" as Role,joined:"15/02/2025",courses:3,status:"Active",avatar:"TMK"},
  {id:"u3",name:"Nguyễn Thu Hà",email:"ha.nt@example.com",role:"STUDENT" as Role,joined:"20/02/2025",courses:2,status:"Active",avatar:"NTH"},
  {id:"u4",name:"Lê Văn Đức",email:"duc.lv@example.com",role:"STUDENT" as Role,joined:"05/03/2025",courses:4,status:"Active",avatar:"LVD"},
  {id:"u5",name:"Trần Thị Lan",email:"lan.tt@example.com",role:"INSTRUCTOR" as Role,joined:"12/01/2025",courses:1,status:"Active",avatar:"TTL"},
  {id:"u6",name:"Phạm Thị Hương",email:"huong.pt@example.com",role:"INSTRUCTOR" as Role,joined:"08/12/2024",courses:1,status:"Active",avatar:"PTH"},
  {id:"u7",name:"Hoàng Minh Tú",email:"tu.hm@example.com",role:"STUDENT" as Role,joined:"01/04/2025",courses:1,status:"Inactive",avatar:"HMT"},
  {id:"u8",name:"Đặng Thùy Linh",email:"linh.dt@example.com",role:"INSTRUCTOR" as Role,joined:"20/11/2024",courses:1,status:"Active",avatar:"DTL"},
  {id:"u9",name:"Sarah Nguyễn",email:"sarah@example.com",role:"INSTRUCTOR" as Role,joined:"15/10/2024",courses:1,status:"Active",avatar:"SN"},
  {id:"u10",name:"Admin System",email:"admin@nexlumina.com",role:"ADMIN" as Role,joined:"01/01/2025",courses:0,status:"Active",avatar:"AD"},
];

const avatarColors = ["from-teal-500 to-teal-700","from-blue-500 to-blue-700","from-purple-500 to-purple-700","from-orange-500 to-orange-700","from-pink-500 to-pink-700"];

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  const filtered = mockUsers.filter(u=>
    (!search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())) &&
    (!roleFilter || u.role===roleFilter)
  );

  const miniStats = [
    {label:"Tổng users",value:mockUsers.length},
    {label:"Học viên",value:mockUsers.filter(u=>u.role==="STUDENT").length},
    {label:"Giảng viên",value:mockUsers.filter(u=>u.role==="INSTRUCTOR").length},
    {label:"Admin",value:mockUsers.filter(u=>u.role==="ADMIN").length},
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-gray-900">Quản lý người dùng</h1>
          <p className="text-sm text-gray-500 mt-0.5">{mockUsers.length} người dùng</p>
        </div>
        <button className="flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-500 transition-colors">
          <Plus className="h-4 w-4"/>Thêm người dùng
        </button>
      </div>

      {/* Mini stats */}
      <div className="grid grid-cols-4 gap-3">
        {miniStats.map(s=>(
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 px-4 py-3 shadow-sm text-center">
            <div className="font-heading text-xl font-bold text-gray-900">{s.value}</div>
            <div className="text-xs text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Tìm tên, email..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"/>
        </div>
        <select value={roleFilter} onChange={e=>setRoleFilter(e.target.value)}
          className="rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white text-gray-700">
          <option value="">Tất cả vai trò</option>
          <option value="STUDENT">Học viên</option>
          <option value="INSTRUCTOR">Giảng viên</option>
          <option value="ADMIN">Admin</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>{["Người dùng","Email","Vai trò","Ngày tham gia","KH đã mua","Trạng thái","Thao tác"].map(h=>(
                <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((u,i)=>(
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className={`h-9 w-9 rounded-full bg-gradient-to-br ${avatarColors[i%5]} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                        {u.avatar}
                      </div>
                      <span className="font-medium text-gray-900 whitespace-nowrap">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-gray-500 text-xs">{u.email}</td>
                  <td className="px-5 py-3.5">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${roleColors[u.role]}`}>{roleLabel[u.role]}</span>
                  </td>
                  <td className="px-5 py-3.5 text-gray-500 text-xs whitespace-nowrap">{u.joined}</td>
                  <td className="px-5 py-3.5 text-center text-gray-700">{u.courses}</td>
                  <td className="px-5 py-3.5">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${u.status==="Active"?"bg-green-100 text-green-700":"bg-gray-100 text-gray-500"}`}>{u.status==="Active"?"Hoạt động":"Không hoạt động"}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1">
                      <button className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors" title="Xem"><Eye className="h-3.5 w-3.5"/></button>
                      <button className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors" title="Khóa"><Ban className="h-3.5 w-3.5"/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <span>Hiển thị 1–{filtered.length} trong {mockUsers.length} người dùng</span>
          <div className="flex items-center gap-1">
            <button className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40" disabled><ChevronLeft className="h-4 w-4"/></button>
            <span className="px-2 py-1 rounded-lg bg-teal-600 text-white text-xs font-medium">1</span>
            <button className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40" disabled><ChevronRight className="h-4 w-4"/></button>
          </div>
        </div>
      </div>
    </div>
  );
}
