"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { BookOpen, BarChart2, Users, ShoppingCart, Settings, LogOut, Menu, Bell, Film, Tag, Upload, Home } from "lucide-react";

const navItems = [
  { href: "/admin", icon: BarChart2, label: "Dashboard" },
  { href: "/admin/courses", icon: BookOpen, label: "Khóa học" },
  { href: "/admin/lessons", icon: Film, label: "Bài học & Video" },
  { href: "/admin/bulk-upload", icon: Upload, label: "Bulk Upload" },
  { href: "/admin/categories", icon: Tag, label: "Danh mục" },
  { href: "/admin/users", icon: Users, label: "Người dùng" },
  { href: "/admin/orders", icon: ShoppingCart, label: "Đơn hàng" },
  { href: "/admin/settings", icon: Settings, label: "Cài đặt" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { data: session, status } = useSession();
  const user = session?.user;

  // Client-side guard: redirect nếu chưa đăng nhập hoặc không phải ADMIN
  useEffect(() => {
    if (status === "loading") return;
    if (!session) { router.replace("/login?callbackUrl=/admin"); return; }
    if ((session.user as any)?.role !== "ADMIN") { router.replace("/dashboard"); return; }
  }, [session, status, router]);

  // Hiện loading skeleton trong khi check session
  if (status === "loading" || !session || (session.user as any)?.role !== "ADMIN") {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-600 border-t-transparent" />
      </div>
    );
  }

  function getInitials(name?: string | null) {
    if (!name) return "AD";
    return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  }

  const Sidebar = () => (
    <div className="flex flex-col h-full bg-gray-950">
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-gray-800">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-600">
          <BookOpen className="h-4 w-4 text-white" />
        </div>
        <span className="font-bold text-white text-sm">
          Nex<span className="text-teal-400">Lumina</span>{" "}
          <span className="text-gray-500 font-normal">Admin</span>
        </span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} onClick={() => setOpen(false)}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                active ? "bg-teal-600 text-white" : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}>
              <item.icon className="h-4 w-4 flex-shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 pb-5 border-t border-gray-800 pt-4">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="h-8 w-8 rounded-full bg-teal-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
            {getInitials(user?.name)}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-white truncate">{user?.name ?? "Admin"}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email ?? ""}</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-red-400 transition-colors"
        >
          <LogOut className="h-4 w-4" />Đăng xuất
        </button>
        <Link
          href="/"
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition-colors mt-1"
        >
          <Home className="h-4 w-4" />Về trang chủ
        </Link>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-60 flex-shrink-0 flex-col"><Sidebar /></aside>

      {/* Mobile overlay */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <aside className="relative z-50 w-60 h-full"><Sidebar /></aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-14 bg-white border-b border-gray-200 flex items-center px-4 gap-3 flex-shrink-0">
          <button onClick={() => setOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600">
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex-1" />
          <button className="relative p-2 rounded-lg hover:bg-gray-100 text-gray-500">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500" />
          </button>
          <div className="h-8 w-8 rounded-full bg-teal-600 flex items-center justify-center text-xs font-bold text-white">
            {getInitials(user?.name)}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
