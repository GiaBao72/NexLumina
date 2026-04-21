"use client";
import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { mockCourses, formatPrice } from "@/lib/mock-data";
import { User, BookOpen, Award, ShoppingBag, Lock, LogOut, Camera, Check, Eye, EyeOff } from "lucide-react";

type Tab = "info"|"courses"|"certs"|"orders"|"password";

const enrolledCourses = mockCourses.slice(0,4);
const progressMap: Record<string,number> = {"1":65,"2":30,"3":8,"4":45};
const mockOrders = [
  {id:"NL-2025-10023",course:"React & Next.js từ 0 đến Pro",date:"15/04/2025",price:1299000,status:"Hoàn thành"},
  {id:"NL-2025-09871",course:"UI/UX Design Masterclass",date:"01/03/2025",price:799000,status:"Hoàn thành"},
  {id:"NL-2025-08456",course:"Python & Data Science",date:"10/01/2025",price:1399000,status:"Hoàn tiền"},
];

const navItems: {tab:Tab;icon:React.ElementType;label:string}[] = [
  {tab:"info",icon:User,label:"Thông tin cá nhân"},
  {tab:"courses",icon:BookOpen,label:"Khóa học của tôi"},
  {tab:"certs",icon:Award,label:"Chứng chỉ"},
  {tab:"orders",icon:ShoppingBag,label:"Lịch sử mua hàng"},
  {tab:"password",icon:Lock,label:"Đổi mật khẩu"},
];

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const user = session?.user;

  const [tab, setTab] = useState<Tab>("info");
  const [showPw, setShowPw] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", bio: "Đam mê học lập trình và thiết kế web." });
  const [pwForm, setPwForm] = useState({ current: "", newPw: "", confirm: "" });
  const [pwError, setPwError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
    if (user) {
      setForm((f) => ({ ...f, name: user.name ?? "", email: user.email ?? "" }));
    }
  }, [status, user, router]);

  const handleSave = ()=>{ setSaved(true); setTimeout(()=>setSaved(false),2000); };
  const handlePw = ()=>{
    if(pwForm.newPw.length<8){setPwError("Mật khẩu tối thiểu 8 ký tự");return;}
    if(pwForm.newPw!==pwForm.confirm){setPwError("Mật khẩu không khớp");return;}
    setPwError(""); setSaved(true); setTimeout(()=>setSaved(false),2000);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar/>
      <main className="flex-1 py-8">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          {/* Mobile tabs */}
          <div className="lg:hidden flex gap-1 overflow-x-auto pb-3 mb-6 scrollbar-hide">
            {navItems.map(n=>(
              <button key={n.tab} onClick={()=>setTab(n.tab)}
                className={`flex items-center gap-1.5 flex-shrink-0 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${tab===n.tab?"bg-teal-600 text-white":"bg-white text-gray-600 border border-gray-200"}`}>
                <n.icon className="h-3.5 w-3.5"/>{n.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <aside className="hidden lg:block">
              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm sticky top-24">
                <div className="relative w-fit mx-auto mb-4 group">
                  <div className="h-20 w-20 rounded-full bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center text-white text-2xl font-bold">HV</div>
                  <button className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="h-5 w-5 text-white"/>
                  </button>
                </div>
                <p className="text-center font-semibold text-gray-900 text-sm">{form.name}</p>
                <p className="text-center text-xs text-gray-400 mb-5">{form.email}</p>
                <nav className="space-y-1">
                  {navItems.map(n=>(
                    <button key={n.tab} onClick={()=>setTab(n.tab)}
                      className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${tab===n.tab?"bg-teal-50 text-teal-700":"text-gray-600 hover:bg-gray-50"}`}>
                      <n.icon className={`h-4 w-4 ${tab===n.tab?"text-teal-600":"text-gray-400"}`}/>{n.label}
                    </button>
                  ))}
                  <button onClick={() => signOut({ callbackUrl: "/" })}
                    className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors mt-2">
                    <LogOut className="h-4 w-4"/>Đăng xuất
                  </button>
                </nav>
              </div>
            </aside>

            {/* Content */}
            <div className="lg:col-span-3">
              {tab==="info" && (
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                  <h2 className="font-heading font-bold text-gray-900 text-lg mb-5">Thông tin cá nhân</h2>
                  <div className="space-y-4">
                    {[["name","Họ tên"],["email","Email"],["bio","Bio"]].map(([k,label])=>(
                      <div key={k}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                        {k==="bio"
                          ? <textarea value={form[k as keyof typeof form]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))} rows={3}
                              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"/>
                          : <input type="text" readOnly={k==="email"} value={form[k as keyof typeof form]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))}
                              className={`w-full rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 ${k==="email"?"bg-gray-50 text-gray-500 border-gray-200":"border-gray-200"}`}/>
                        }
                      </div>
                    ))}
                    <button onClick={handleSave}
                      className="flex items-center gap-2 rounded-xl bg-teal-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-teal-500 transition-colors">
                      {saved?<><Check className="h-4 w-4"/>Đã lưu!</>:"Lưu thay đổi"}
                    </button>
                  </div>
                </div>
              )}

              {tab==="courses" && (
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                  <h2 className="font-heading font-bold text-gray-900 text-lg mb-5">Khóa học của tôi</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {enrolledCourses.map(c=>{
                      const pct=progressMap[c.id]??0;
                      return (
                        <div key={c.id} className="rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                          <div className={`h-24 bg-gradient-to-br ${c.gradient} flex items-center justify-center`}>
                            <span className="text-white/30 text-5xl font-bold">{c.title[0]}</span>
                          </div>
                          <div className="p-3">
                            <p className="text-sm font-semibold text-gray-900 line-clamp-2 mb-2">{c.title}</p>
                            <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
                              <span>{pct}% hoàn thành</span><span>{c.totalLessons} bài</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-1.5 mb-3">
                              <div className="bg-teal-500 h-1.5 rounded-full" style={{width:`${pct}%`}}/>
                            </div>
                            <Link href={`/learn/${c.slug}/gioi-thieu-khoa-hoc`}
                              className="block text-center rounded-lg bg-teal-600 py-1.5 text-xs font-semibold text-white hover:bg-teal-700 transition-colors">
                              Tiếp tục học
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {tab==="certs" && (
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                  <h2 className="font-heading font-bold text-gray-900 text-lg mb-5">Chứng chỉ của tôi</h2>
                  <div className="relative rounded-2xl overflow-hidden border-2 border-teal-200 p-8 text-center bg-gradient-to-br from-teal-50 to-white">
                    <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-teal-500 to-teal-300"/>
                    <Award className="mx-auto h-12 w-12 text-teal-500 mb-3"/>
                    <p className="text-xs text-teal-600 font-semibold uppercase tracking-wider mb-1">Chứng nhận hoàn thành</p>
                    <h3 className="font-heading text-xl font-bold text-gray-900 mb-1">React & Next.js từ 0 đến Pro</h3>
                    <p className="text-sm text-gray-500 mb-1">Cấp bởi <strong className="text-teal-600">NexLumina</strong></p>
                    <p className="text-xs text-gray-400 mb-6">Ngày hoàn thành: 15/04/2025 · Mã chứng chỉ: NL-CERT-2025-00123</p>
                    <button className="rounded-xl bg-teal-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-teal-500 transition-colors">
                      Tải xuống PDF
                    </button>
                  </div>
                </div>
              )}

              {tab==="orders" && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-gray-100">
                    <h2 className="font-heading font-bold text-gray-900 text-lg">Lịch sử mua hàng</h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>{["Mã đơn","Khóa học","Ngày mua","Giá","Trạng thái"].map(h=>(
                          <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                        ))}</tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {mockOrders.map(o=>(
                          <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-5 py-3.5 font-mono text-xs text-teal-600">{o.id}</td>
                            <td className="px-5 py-3.5 text-gray-900 max-w-[160px] truncate">{o.course}</td>
                            <td className="px-5 py-3.5 text-gray-500 text-xs">{o.date}</td>
                            <td className="px-5 py-3.5 font-semibold text-gray-900">{formatPrice(o.price)}</td>
                            <td className="px-5 py-3.5">
                              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${o.status==="Hoàn thành"?"bg-green-100 text-green-700":"bg-red-100 text-red-600"}`}>{o.status}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {tab==="password" && (
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                  <h2 className="font-heading font-bold text-gray-900 text-lg mb-5">Đổi mật khẩu</h2>
                  {pwError && <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">{pwError}</div>}
                  {saved && <div className="mb-4 rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700 flex items-center gap-2"><Check className="h-4 w-4"/>Đổi mật khẩu thành công!</div>}
                  <div className="space-y-4 max-w-sm">
                    {[["current","Mật khẩu hiện tại"],["newPw","Mật khẩu mới"],["confirm","Xác nhận mật khẩu mới"]].map(([k,label])=>(
                      <div key={k}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                        <div className="relative">
                          <input type={showPw?"text":"password"} value={pwForm[k as keyof typeof pwForm]}
                            onChange={e=>setPwForm(f=>({...f,[k]:e.target.value}))}
                            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"/>
                          <button type="button" onClick={()=>setShowPw(s=>!s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                            {showPw?<EyeOff className="h-4 w-4"/>:<Eye className="h-4 w-4"/>}
                          </button>
                        </div>
                      </div>
                    ))}
                    <button onClick={handlePw}
                      className="rounded-xl bg-teal-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-teal-500 transition-colors">
                      Cập nhật mật khẩu
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer/>
    </div>
  );
}
