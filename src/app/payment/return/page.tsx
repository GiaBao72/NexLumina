"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import Link from "next/link";

function ReturnInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { clearCart } = useCart();

  const orderCode = searchParams.get("orderCode");
  const statusParam = searchParams.get("status"); // PayOS có thể truyền status=PAID

  const [phase, setPhase] = useState<"polling" | "success" | "failed">("polling");
  const [message, setMessage] = useState("Đang xác nhận thanh toán...");

  useEffect(() => {
    if (!orderCode) {
      setPhase("failed");
      setMessage("Không tìm thấy mã đơn hàng.");
      return;
    }

    // Nếu PayOS trả về status=CANCELLED ngay
    if (statusParam === "CANCELLED" || statusParam === "cancel") {
      router.replace(`/payment/cancel?orderCode=${orderCode}`);
      return;
    }

    let attempts = 0;
    const MAX = 12; // 12 * 2.5s = 30s
    const INTERVAL = 2500;

    const poll = async () => {
      attempts++;
      try {
        const res = await fetch(`/api/payment/status/${orderCode}`);
        const data = await res.json();

        if (data.status === "PAID") {
          // Lấy pending order info từ sessionStorage
          let orderInfo: any = null;
          try {
            const raw = sessionStorage.getItem("nexlumina_pending_order");
            if (raw) { orderInfo = JSON.parse(raw); sessionStorage.removeItem("nexlumina_pending_order"); }
          } catch { }

          if (orderInfo) {
            sessionStorage.setItem("nexlumina_last_order", JSON.stringify({
              orderId: orderInfo.orderId,
              items: orderInfo.items,
              total: orderInfo.total,
              email: orderInfo.email,
            }));
          }

          clearCart();
          setPhase("success");
          setMessage("Thanh toán thành công!");
          setTimeout(() => router.push("/order-success"), 1200);
          return;
        }

        if (data.status === "CANCELLED") {
          router.replace(`/payment/cancel?orderCode=${orderCode}`);
          return;
        }

        if (attempts >= MAX) {
          // Hết thời gian poll — có thể webhook chưa tới, hướng dẫn user check dashboard
          setPhase("failed");
          setMessage("Xác nhận thanh toán mất nhiều thời gian hơn dự kiến. Vui lòng kiểm tra lịch sử đơn hàng.");
          return;
        }

        setTimeout(poll, INTERVAL);
      } catch {
        if (attempts >= MAX) {
          setPhase("failed");
          setMessage("Không thể kết nối server. Vui lòng kiểm tra lịch sử đơn hàng.");
          return;
        }
        setTimeout(poll, INTERVAL);
      }
    };

    // Nếu PayOS đã trả status=PAID trong URL thì poll ngay 1 lần
    setTimeout(poll, statusParam === "PAID" ? 500 : 1500);
  }, [orderCode, statusParam, router, clearCart]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-orange-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-xl p-10 max-w-md w-full text-center">
        {phase === "polling" && (
          <>
            <Loader2 className="h-14 w-14 text-teal-500 animate-spin mx-auto mb-5" />
            <h1 className="font-heading text-xl font-bold text-gray-900 mb-2">Đang xác nhận thanh toán</h1>
            <p className="text-sm text-gray-500">{message}</p>
            <p className="text-xs text-gray-400 mt-3">Vui lòng không tắt trang này.</p>
          </>
        )}
        {phase === "success" && (
          <>
            <CheckCircle className="h-14 w-14 text-teal-500 mx-auto mb-5" />
            <h1 className="font-heading text-xl font-bold text-gray-900 mb-2">Thanh toán thành công!</h1>
            <p className="text-sm text-gray-500">Đang chuyển hướng...</p>
          </>
        )}
        {phase === "failed" && (
          <>
            <XCircle className="h-14 w-14 text-orange-400 mx-auto mb-5" />
            <h1 className="font-heading text-xl font-bold text-gray-900 mb-2">Chưa xác nhận được</h1>
            <p className="text-sm text-gray-500 mb-6">{message}</p>
            <div className="flex flex-col gap-3">
              <Link href="/dashboard"
                className="rounded-xl bg-teal-600 px-6 py-3 text-sm font-semibold text-white hover:bg-teal-700 transition-colors">
                Xem lịch sử đơn hàng
              </Link>
              <Link href="/"
                className="rounded-xl border border-gray-200 px-6 py-3 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                Về trang chủ
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function PaymentReturnPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-teal-500 animate-spin" />
      </div>
    }>
      <ReturnInner />
    </Suspense>
  );
}
