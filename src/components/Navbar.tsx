"use client";

import Link from "next/link";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { Menu, X, BookOpen, ChevronDown, LogOut, User, LayoutDashboard, ShieldCheck } from "lucide-react";

const navLinks = [
  { label: "Khóa học", href: "/courses" },
  { label: "Lộ trình", href: "/roadmap" },
  { label: "Blog", href: "/blog" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { data: session, status } = useSession();
  const user = session?.user;
  const isAdmin = (user as any)?.role === "ADMIN";

  function getInitials(name?: string | null) {
    if (!name) return "?";
    return name
      .split(" ")
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-heading font-bold text-xl">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-600">
            <BookOpen className="h-4 w-4 text-white" />
          </div>
          <span className="text-gray-900">Nex<span className="text-teal-600">Lumina</span></span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:text-teal-600 hover:bg-teal-50 transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          {status === "loading" ? (
            <div className="h-8 w-24 rounded-lg bg-gray-100 animate-pulse" />
          ) : user ? (
            /* User dropdown */
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-gray-50 transition-colors"
              >
                <div className="h-8 w-8 rounded-full bg-teal-600 flex items-center justify-center text-white text-xs font-bold">
                  {getInitials(user.name)}
                </div>
                <span className="text-sm font-medium text-gray-700 max-w-[120px] truncate">
                  {user.name}
                </span>
                <ChevronDown className={`h-3.5 w-3.5 text-gray-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {dropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                  <div className="absolute right-0 mt-2 w-52 rounded-xl border border-gray-100 bg-white shadow-lg shadow-gray-200/50 z-20 py-1.5">
                    <div className="px-4 py-2.5 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                      <p className="text-xs text-gray-400 truncate">{user.email}</p>
                    </div>
                    <Link
                      href="/dashboard"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-700 transition-colors"
                    >
                      <LayoutDashboard className="h-4 w-4 text-gray-400" />
                      Dashboard
                    </Link>
                    <Link
                      href="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-700 transition-colors"
                    >
                      <User className="h-4 w-4 text-gray-400" />
                      Hồ sơ cá nhân
                    </Link>
                    {isAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-teal-700 hover:bg-teal-50 transition-colors"
                      >
                        <ShieldCheck className="h-4 w-4 text-teal-500" />
                        Quản trị
                      </Link>
                    )}
                    <div className="border-t border-gray-100 mt-1 pt-1">
                      <button
                        onClick={() => { setDropdownOpen(false); signOut({ callbackUrl: "/" }); }}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        Đăng xuất
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:text-teal-600 transition-colors"
              >
                Đăng nhập
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700 transition-colors shadow-sm"
              >
                Bắt đầu miễn phí
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden rounded-md p-2 text-gray-600 hover:bg-gray-100"
          onClick={() => setOpen(!open)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-1">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="block rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-teal-50 hover:text-teal-600"
              onClick={() => setOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          <div className="pt-3 flex flex-col gap-2">
            {user ? (
              <>
                <div className="flex items-center gap-3 px-3 py-2 rounded-md bg-gray-50">
                  <div className="h-8 w-8 rounded-full bg-teal-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {getInitials(user.name)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                    <p className="text-xs text-gray-400 truncate">{user.email}</p>
                  </div>
                </div>
                <Link href="/dashboard" onClick={() => setOpen(false)}
                  className="block rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-teal-50 hover:text-teal-600 border border-gray-200 text-center">
                  Dashboard
                </Link>
                {isAdmin && (
                  <Link href="/admin" onClick={() => setOpen(false)}
                    className="block rounded-md px-3 py-2 text-sm font-medium text-teal-700 hover:bg-teal-50 border border-teal-200 text-center">
                    Quản trị
                  </Link>
                )}
                <button
                  onClick={() => { setOpen(false); signOut({ callbackUrl: "/" }); }}
                  className="block rounded-md px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-50 border border-red-100 text-center w-full"
                >
                  Đăng xuất
                </button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setOpen(false)}
                  className="block rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 text-center border border-gray-200">
                  Đăng nhập
                </Link>
                <Link href="/register" onClick={() => setOpen(false)}
                  className="block rounded-lg bg-teal-600 px-3 py-2 text-sm font-semibold text-white text-center hover:bg-teal-700">
                  Bắt đầu miễn phí
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
