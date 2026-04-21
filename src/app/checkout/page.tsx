"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { formatPrice } from "@/lib/mock-data";
import { useCart } from "@/context/CartContext";
import { ShieldCheck, CreditCard, Building2, Smartphone, Lock, ShoppingCart } from "lucide-react";

type PayMethod = "card" | "bank" | "ewallet";

const DISCOUNT_CODE = "NEXLUMINA20";
const DISCOUNT_RATE = 0.2;

// ── Inner component uses useSearchParams — must be inside Suspense ─────────────
function CheckoutInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const appliedDiscount = searchParams.get("discount") === DISCOUNT_CODE ? DISCOUNT_CODE : "";

  const { items, subtotal, clearCart } = useCart();
  const discountAmount = appliedDiscount ? Math.round(subtotal * DISCOUNT_RATE) : 0;
  const total = subtotal - discountAmount;

  const [method, setMethod] = useState<PayMethod>("card");
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "" });

  // Populate form from session once available
  useEffect(() => {
    const user = session?.user;
    if (user) {
      setForm((f) => ({
        ...f,
        name: f.name || user.name || "",
        email: f.email || user.email || "",
      }));
    }
  }, [session]);

  const handleOrder = async () => {
    if (!agreed || items.length === 0) return;
    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            id: i.id,
            price: i.salePrice !== undefined && i.salePrice !== null ? i.salePrice : i.price,
          })),
          total,
          paymentMethod: method,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Lỗi không xác định" }));
        alert(err.error ?? "Đặt hàng thất bại. Vui lòng thử lại.");
        setLoading(false);
        return;
      }

      const data = await res.json();
      sessionStorage.setItem(
        "nexlumina_last_order",
        JSON.stringify({ orderId: data.orderId, items, total, email: form.email }),
      );
      clearCart();
      router.push("/order-success");
    } catch {
      alert("Không thể kết nối server. Vui lòng thử lại.");
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🛒</div>
          <h2 className="font-heading text-2xl font-bold text-gray-900 mb-2">Giỏ hàng trống</h2>
          <p className="text-gray-500 mb-6">Bạn chưa có khóa học nào trong giỏ hàng.</p>
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-6 py-3 text-sm font-semibold text-white hover:bg-teal-700 transition-colors"
          >
            <ShoppingCart className="h-4 w-4" />
            Khám phá khóa học
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="flex-1 py-10">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <h1 className="font-heading text-2xl font-bold text-gray-900 mb-8">Thanh toán</h1>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* ── Left ── */}
          <div className="lg:col-span-3 space-y-6">
            {/* Billing info */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h2 className="font-heading font-semibold text-gray-900 mb-4">Thông tin thanh toán</h2>
              <div className="space-y-4">
                {[
                  ["name", "Họ tên", "text", false],
                  ["email", "Email", "email", true],
                  ["phone", "Số điện thoại", "tel", false],
                ].map(([k, label, type, ro]) => (
                  <div key={k as string}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{label as string}</label>
                    <input
                      type={type as string}
                      readOnly={!!ro}
                      value={form[k as keyof typeof form]}
                      onChange={(e) => setForm((f) => ({ ...f, [k as string]: e.target.value }))}
                      className={`w-full rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 ${ro ? "bg-gray-50 text-gray-500" : "border-gray-200"}`}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Payment method */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h2 className="font-heading font-semibold text-gray-900 mb-4">Phương thức thanh toán</h2>
              <div className="space-y-3">
                {([
                  ["card", CreditCard, "Thẻ tín dụng / Ghi nợ"],
                  ["bank", Building2, "Chuyển khoản ngân hàng"],
                  ["ewallet", Smartphone, "Ví điện tử (MoMo / ZaloPay)"],
                ] as const).map(([val, Icon, label]) => (
                  <label
                    key={val}
                    className={`flex items-center gap-3 rounded-xl border-2 p-4 cursor-pointer transition-colors ${method === val ? "border-teal-500 bg-teal-50" : "border-gray-200 hover:border-gray-300"}`}
                  >
                    <input type="radio" name="pay" value={val} checked={method === val} onChange={() => setMethod(val)} className="accent-teal-600" />
                    <Icon className={`h-5 w-5 ${method === val ? "text-teal-600" : "text-gray-400"}`} />
                    <span className={`text-sm font-medium ${method === val ? "text-teal-700" : "text-gray-700"}`}>{label}</span>
                  </label>
                ))}
              </div>

              {method === "card" && (
                <div className="mt-4 space-y-3 p-4 bg-gray-50 rounded-xl">
                  <input placeholder="Số thẻ" className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                  <input placeholder="Tên chủ thẻ" className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                  <div className="grid grid-cols-2 gap-3">
                    <input placeholder="MM/YY" className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                    <input placeholder="CVV" className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                  </div>
                </div>
              )}
              {method === "bank" && (
                <div className="mt-4 p-4 bg-teal-50 rounded-xl text-sm space-y-1 text-gray-700">
                  <p><strong>Ngân hàng:</strong> Vietcombank</p>
                  <p><strong>Số TK:</strong> 1234567890</p>
                  <p><strong>Chủ TK:</strong> CÔNG TY NEXLUMINA</p>
                  <p><strong>Nội dung:</strong> NEXLUMINA + email của bạn</p>
                </div>
              )}
              {method === "ewallet" && (
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {["💜 MoMo", "🔵 ZaloPay"].map((w) => (
                    <button key={w} className="rounded-xl border-2 border-gray-200 p-4 text-sm font-medium text-gray-700 hover:border-teal-400 hover:bg-teal-50 transition-colors">{w}</button>
                  ))}
                </div>
              )}
            </div>

            {/* Terms */}
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5 h-4 w-4 rounded accent-teal-600" />
              <span className="text-sm text-gray-600">
                Tôi đồng ý với{" "}
                <Link href="/terms" className="text-teal-600 underline hover:text-teal-700">điều khoản dịch vụ</Link>{" "}
                và{" "}
                <Link href="/privacy" className="text-teal-600 underline hover:text-teal-700">chính sách bảo mật</Link>{" "}
                của NexLumina.
              </span>
            </label>

            {/* Submit */}
            <button
              onClick={handleOrder}
              disabled={!agreed || loading}
              className="w-full rounded-xl bg-teal-600 py-4 text-sm font-bold text-white hover:bg-teal-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <><div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />Đang xử lý...</>
              ) : (
                <><Lock className="h-4 w-4" />Đặt hàng an toàn — {formatPrice(total)}</>
              )}
            </button>
          </div>

          {/* ── Right — summary ── */}
          <div className="lg:col-span-2">
            <div className="sticky top-24 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h2 className="font-heading font-semibold text-gray-900 mb-4">Đơn hàng của bạn</h2>
              <div className="space-y-3 mb-4">
                {items.map((c) => {
                  const price = c.salePrice !== undefined && c.salePrice !== null ? c.salePrice : c.price;
                  return (
                    <div key={c.id} className="flex gap-3">
                      <div className={`h-12 w-12 rounded-lg bg-gradient-to-br ${c.gradient} flex-shrink-0`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-900 line-clamp-2 leading-snug">{c.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{c.instructor}</p>
                      </div>
                      <span className="text-sm font-semibold text-gray-900 flex-shrink-0">{formatPrice(price)}</span>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Tạm tính</span><span>{formatPrice(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-teal-600">Giảm giá ({DISCOUNT_CODE})</span>
                    <span className="font-semibold text-teal-600">− {formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-gray-900 text-base pt-2 border-t border-gray-100">
                  <span>Tổng cộng</span>
                  <span className="text-teal-600">{formatPrice(total)}</span>
                </div>
                <p className="text-xs text-gray-400">Đã bao gồm VAT theo quy định</p>
              </div>

              <div className="mt-4 flex items-center gap-2 rounded-xl bg-green-50 p-3">
                <ShieldCheck className="h-5 w-5 text-green-600 flex-shrink-0" />
                <p className="text-xs text-green-700">Thanh toán bảo mật SSL 256-bit. Hoàn tiền trong 30 ngày.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

// ── Page wrapper — Suspense required for useSearchParams ──────────────────────
export default function CheckoutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <Suspense fallback={<div className="flex-1 flex items-center justify-center text-gray-400 text-sm">Đang tải...</div>}>
        <CheckoutInner />
      </Suspense>
      <Footer />
    </div>
  );
}
