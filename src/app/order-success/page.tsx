"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle, BookOpen, ArrowRight, Home, LayoutDashboard, Mail } from "lucide-react";
import { formatPrice } from "@/lib/mock-data";
import type { CartItem } from "@/context/CartContext";

interface OrderData {
  orderId: string;
  items: CartItem[];
  total: number;
  email: string;
}

export default function OrderSuccessPage() {
  const [show, setShow] = useState(false);
  const [order, setOrder] = useState<OrderData | null>(null);

  useEffect(() => {
    // Load order from sessionStorage
    try {
      const raw = sessionStorage.getItem("nexlumina_last_order");
      if (raw) {
        setOrder(JSON.parse(raw));
        // Clear so refreshing doesn't show stale data
        sessionStorage.removeItem("nexlumina_last_order");
      }
    } catch {
      // ignore
    }
    setTimeout(() => setShow(true), 100);
  }, []);

  const firstCourseSlug = order?.items?.[0]?.slug ?? "react-nextjs-tu-0-den-pro";

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-orange-50 flex flex-col items-center justify-center px-4 py-16">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 font-bold text-xl mb-12">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-600">
          <BookOpen className="h-5 w-5 text-white" />
        </div>
        <span className="text-gray-900">
          Nex<span className="text-teal-600">Lumina</span>
        </span>
      </Link>

      <div
        className={`bg-white rounded-3xl shadow-xl border border-gray-100 p-8 max-w-md w-full text-center transition-all duration-500 ${
          show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
      >
        {/* Success icon */}
        <div
          className={`mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-teal-100 transition-all duration-500 ${
            show ? "scale-100" : "scale-50"
          }`}
        >
          <CheckCircle className="h-10 w-10 text-teal-600" />
        </div>

        <h1 className="font-heading text-2xl font-bold text-gray-900 mb-1">
          Đặt hàng thành công! 🎉
        </h1>
        <p className="text-gray-500 text-sm mb-5">
          Cảm ơn bạn đã tin tưởng NexLumina. Chúc bạn học vui!
        </p>

        {/* Order ID */}
        <div className="rounded-xl bg-gray-50 px-4 py-3 mb-6 text-sm">
          <span className="text-gray-500">Mã đơn hàng: </span>
          <span className="font-mono font-semibold text-teal-600">
            {order?.orderId ?? "NL-2025-DEMO"}
          </span>
        </div>

        {/* Items */}
        {order && order.items.length > 0 && (
          <div className="space-y-3 mb-6 text-left">
            {order.items.map((c) => {
              const price =
                c.salePrice !== undefined && c.salePrice !== null ? c.salePrice : c.price;
              return (
                <div key={c.id} className="flex items-center gap-3">
                  <div
                    className={`h-10 w-10 rounded-lg bg-gradient-to-br ${c.gradient} flex-shrink-0`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-900 line-clamp-1">{c.title}</p>
                  </div>
                  <span className="text-sm font-semibold text-gray-700 flex-shrink-0">
                    {formatPrice(price)}
                  </span>
                </div>
              );
            })}
            {/* Total */}
            <div className="flex justify-between pt-2 border-t border-gray-100 text-sm font-bold text-gray-900">
              <span>Tổng cộng</span>
              <span className="text-teal-600">{formatPrice(order.total)}</span>
            </div>
          </div>
        )}

        {/* Email notice */}
        <div className="rounded-xl bg-teal-50 p-3 mb-6 flex items-start gap-2 text-left">
          <Mail className="h-4 w-4 text-teal-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-teal-700">
            Thông tin khóa học đã được gửi tới{" "}
            <strong>{order?.email ?? "email của bạn"}</strong>. Kiểm tra hộp thư để xem chi
            tiết.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-3">
          <Link
            href={`/learn/${firstCourseSlug}/gioi-thieu-khoa-hoc`}
            className="flex items-center justify-center gap-2 rounded-xl bg-teal-600 py-3.5 text-sm font-bold text-white hover:bg-teal-500 transition-colors"
          >
            Vào học ngay <ArrowRight className="h-4 w-4" />
          </Link>
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/"
              className="flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-colors"
            >
              <Home className="h-4 w-4" />
              Trang chủ
            </Link>
            <Link
              href="/dashboard"
              className="flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-colors"
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
          </div>
        </div>
      </div>

      <p className="mt-6 text-xs text-gray-400">
        Cần hỗ trợ? Liên hệ{" "}
        <a href="mailto:support@nexlumina.com" className="text-teal-600 underline">
          support@nexlumina.com
        </a>
      </p>
    </div>
  );
}
