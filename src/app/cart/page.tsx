"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { formatPrice } from "@/lib/mock-data";
import { useCart } from "@/context/CartContext";
import { ShoppingCart, Trash2, Tag, ArrowRight, BookOpen, Star, Clock } from "lucide-react";
import { useState } from "react";

const DISCOUNT_CODE = "NEXLUMINA20";
const DISCOUNT_RATE = 0.2;

export default function CartPage() {
  const { items, removeItem, subtotal } = useCart();
  const [coupon, setCoupon] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");

  const discountAmount = appliedCoupon === DISCOUNT_CODE ? Math.round(subtotal * DISCOUNT_RATE) : 0;
  const total = subtotal - discountAmount;

  const handleApplyCoupon = () => {
    setCouponError("");
    setCouponSuccess("");
    if (coupon.trim().toUpperCase() === DISCOUNT_CODE) {
      setAppliedCoupon(DISCOUNT_CODE);
      setCouponSuccess("Mã giảm giá đã được áp dụng! Giảm 20%");
    } else {
      setAppliedCoupon("");
      setCouponError("Mã giảm giá không hợp lệ hoặc đã hết hạn.");
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon("");
    setCoupon("");
    setCouponError("");
    setCouponSuccess("");
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />

      <main className="flex-1">
        {/* Header */}
        <div className="bg-white border-b border-gray-100">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50">
                <ShoppingCart className="h-5 w-5 text-teal-600" />
              </div>
              <div>
                <h1 className="font-heading text-2xl font-bold text-gray-900">Giỏ hàng</h1>
                <p className="text-sm text-gray-500 mt-0.5">
                  {items.length} khóa học trong giỏ
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          {items.length === 0 ? (
            /* ── Empty state ── */
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-teal-50 mb-6">
                <ShoppingCart className="h-12 w-12 text-teal-300" />
              </div>
              <h2 className="font-heading text-2xl font-bold text-gray-900 mb-2">
                Giỏ hàng đang trống
              </h2>
              <p className="text-gray-500 mb-8 max-w-sm">
                Bạn chưa thêm khóa học nào vào giỏ hàng. Khám phá hàng trăm khóa học chất lượng cao ngay!
              </p>
              <Link
                href="/courses"
                className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-6 py-3 text-sm font-semibold text-white hover:bg-teal-700 transition-colors shadow-sm"
              >
                <BookOpen className="h-4 w-4" />
                Khám phá khóa học
              </Link>
            </div>
          ) : (
            /* ── Main content ── */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left — Cart items */}
              <div className="lg:col-span-2 space-y-4">
                {items.map((item) => {
                  const effectivePrice =
                    item.salePrice !== undefined && item.salePrice !== null && item.salePrice >= 0 && item.price > 0
                      ? item.salePrice
                      : item.price;
                  return (
                    <div
                      key={item.id}
                      className="flex gap-4 bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow"
                    >
                      {/* Thumbnail */}
                      <div
                        className={`relative flex-shrink-0 h-20 w-28 sm:h-24 sm:w-36 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center overflow-hidden`}
                      >
                        <span className="text-white/25 text-5xl font-black select-none">
                          {item.title.charAt(0)}
                        </span>
                        {item.badge && (
                          <span
                            className={`absolute top-2 left-2 rounded-full px-2 py-0.5 text-xs font-bold text-white ${
                              item.badge === "Miễn phí"
                                ? "bg-green-500"
                                : item.badge === "Mới"
                                ? "bg-blue-500"
                                : item.badge === "Nổi bật"
                                ? "bg-yellow-500"
                                : "bg-orange-500"
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <span className="text-xs text-teal-600 font-semibold uppercase tracking-wide">
                          {item.category}
                        </span>
                        <h3 className="font-heading font-semibold text-gray-900 text-sm sm:text-base mt-0.5 line-clamp-2 leading-snug">
                          {item.title}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">{item.instructor}</p>
                        <div className="flex items-center gap-3 text-xs text-gray-400 mt-1.5">
                          <span className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <strong className="text-gray-700">{item.rating}</strong>
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {item.totalDuration}
                          </span>
                          <span>{item.totalLessons} bài học</span>
                        </div>
                      </div>

                      {/* Price + remove */}
                      <div className="flex flex-col items-end justify-between flex-shrink-0">
                        <button
                          onClick={() => removeItem(item.id)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                          title="Xóa khỏi giỏ"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <div className="text-right">
                          <p className="font-bold text-gray-900 text-base">
                            {formatPrice(effectivePrice)}
                          </p>
                          {item.salePrice !== undefined &&
                            item.salePrice !== null &&
                            item.price > 0 &&
                            item.salePrice < item.price && (
                              <p className="text-xs text-gray-400 line-through">
                                {formatPrice(item.price)}
                              </p>
                            )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                <Link
                  href="/courses"
                  className="inline-flex items-center gap-2 text-sm text-teal-600 hover:text-teal-700 font-medium mt-2 hover:underline"
                >
                  <ArrowRight className="h-4 w-4 rotate-180" />
                  Tiếp tục mua khóa học
                </Link>
              </div>

              {/* Right — Order summary */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-24">
                  <h2 className="font-heading font-bold text-gray-900 text-lg mb-5">
                    Tóm tắt đơn hàng
                  </h2>

                  {/* Coupon input */}
                  <div className="mb-5">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Tag className="inline h-3.5 w-3.5 mr-1 text-teal-600" />
                      Mã giảm giá
                    </label>
                    {appliedCoupon ? (
                      <div className="flex items-center justify-between bg-teal-50 border border-teal-200 rounded-xl px-3 py-2">
                        <span className="text-sm font-semibold text-teal-700">
                          🎉 {appliedCoupon}
                        </span>
                        <button
                          onClick={handleRemoveCoupon}
                          className="text-xs text-red-500 hover:underline ml-2"
                        >
                          Xóa
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Nhập mã giảm giá"
                          value={coupon}
                          onChange={(e) => setCoupon(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                          className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition-colors"
                        />
                        <button
                          onClick={handleApplyCoupon}
                          className="rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700 transition-colors"
                        >
                          Áp dụng
                        </button>
                      </div>
                    )}
                    {couponError && (
                      <p className="text-xs text-red-500 mt-1.5">{couponError}</p>
                    )}
                    {couponSuccess && (
                      <p className="text-xs text-teal-600 mt-1.5">{couponSuccess}</p>
                    )}
                    {!appliedCoupon && !couponError && (
                      <p className="text-xs text-gray-400 mt-1.5">Thử mã: NEXLUMINA20</p>
                    )}
                  </div>

                  {/* Price breakdown */}
                  <div className="space-y-3 border-t border-gray-100 pt-4">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Tạm tính ({items.length} khóa học)</span>
                      <span className="font-medium text-gray-900">{formatPrice(subtotal)}</span>
                    </div>
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-teal-600">Giảm giá ({DISCOUNT_CODE})</span>
                        <span className="font-semibold text-teal-600">
                          − {formatPrice(discountAmount)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                      <span className="font-heading font-bold text-gray-900">Tổng cộng</span>
                      <span className="font-heading font-bold text-xl text-teal-600">
                        {formatPrice(total)}
                      </span>
                    </div>
                  </div>

                  {/* CTA */}
                  <Link
                    href={`/checkout?discount=${appliedCoupon}`}
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 px-6 py-3.5 text-sm font-semibold text-white hover:bg-teal-700 transition-colors shadow-sm"
                  >
                    Tiến hành thanh toán
                    <ArrowRight className="h-4 w-4" />
                  </Link>

                  <Link
                    href="/courses"
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Tiếp tục mua
                  </Link>

                  {/* Security note */}
                  <p className="mt-4 text-center text-xs text-gray-400">
                    🔒 Thanh toán bảo mật SSL 256-bit
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
