"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { XCircle, ShoppingCart, Home } from "lucide-react";

function CancelInner() {
  const searchParams = useSearchParams();
  const orderCode = searchParams.get("orderCode");

  useEffect(() => {
    // Cập nhật trạng thái đơn CANCELLED nếu có orderCode
    if (orderCode) {
      fetch(`/api/payment/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderCode }),
      }).catch(() => {});
    }
  }, [orderCode]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-xl p-10 max-w-md w-full text-center">
        <XCircle className="h-16 w-16 text-red-400 mx-auto mb-5" />
        <h1 className="font-heading text-2xl font-bold text-gray-900 mb-2">Thanh toán bị hủy</h1>
        <p className="text-sm text-gray-500 mb-2">Đơn hàng của bạn chưa được xử lý.</p>
        <p className="text-sm text-gray-400 mb-8">Giỏ hàng vẫn được giữ nguyên — bạn có thể thử lại bất cứ lúc nào.</p>
        <div className="flex flex-col gap-3">
          <Link href="/checkout"
            className="rounded-xl bg-teal-600 px-6 py-3 text-sm font-semibold text-white hover:bg-teal-700 transition-colors flex items-center justify-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            Quay lại thanh toán
          </Link>
          <Link href="/courses"
            className="rounded-xl border border-gray-200 px-6 py-3 text-sm text-gray-600 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
            <Home className="h-4 w-4" />
            Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function PaymentCancelPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <CancelInner />
    </Suspense>
  );
}
