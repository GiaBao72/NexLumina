"use client";

import { useState } from "react";
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2 } from "lucide-react";

const SUBJECTS = [
  "Hỗ trợ kỹ thuật",
  "Câu hỏi về khóa học",
  "Yêu cầu hoàn tiền",
  "Hợp tác / Đối tác",
  "Báo cáo lỗi",
  "Khác",
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  function validate() {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Vui lòng nhập họ tên.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Email không hợp lệ.";
    if (!form.subject) e.subject = "Vui lòng chọn chủ đề.";
    if (form.message.trim().length < 20) e.message = "Nội dung phải ít nhất 20 ký tự.";
    return e;
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    setSubmitted(true);
  }

  return (
    <main className="min-h-screen bg-[#F0FDFA]">
      {/* Hero */}
      <section className="bg-gradient-to-br from-teal-700 via-teal-600 to-cyan-500 py-20 px-4">
        <div className="mx-auto max-w-3xl text-center text-white">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium mb-6">
            <Mail className="h-4 w-4" />
            Liên hệ
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">
            Chúng tôi luôn lắng nghe
          </h1>
          <p className="text-teal-100 text-lg">
            Có câu hỏi, góp ý hay muốn hợp tác? Gửi tin nhắn và chúng tôi sẽ phản hồi trong vòng 24 giờ làm việc.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* Info sidebar */}
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-gray-900">Thông tin liên hệ</h2>

            {[
              {
                icon: Mail,
                label: "Email hỗ trợ",
                value: "support@nexlumina.com",
                sub: "Phản hồi trong 24h làm việc",
              },
              {
                icon: Mail,
                label: "Email kinh doanh",
                value: "hello@nexlumina.com",
                sub: "Hợp tác & đối tác",
              },
              {
                icon: Phone,
                label: "Hotline",
                value: "1800 xxxx",
                sub: "Thứ 2–6, 8:00–17:30",
              },
              {
                icon: MapPin,
                label: "Địa chỉ",
                value: "Hà Nội, Việt Nam",
                sub: "Văn phòng chính",
              },
            ].map(({ icon: Icon, label, value, sub }) => (
              <div key={label} className="flex gap-4 rounded-2xl bg-white border border-gray-100 shadow-sm p-4">
                <div className="shrink-0 flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50">
                  <Icon className="h-5 w-5 text-teal-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium">{label}</p>
                  <p className="text-sm font-semibold text-gray-800">{value}</p>
                  <p className="text-xs text-gray-400">{sub}</p>
                </div>
              </div>
            ))}

            <div className="rounded-2xl bg-teal-50 border border-teal-100 p-5">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-teal-600" />
                <span className="text-sm font-semibold text-teal-700">Giờ làm việc</span>
              </div>
              <p className="text-sm text-teal-700">Thứ 2 – Thứ 6</p>
              <p className="text-sm font-bold text-teal-800">08:00 – 17:30 (GMT+7)</p>
              <p className="text-xs text-teal-500 mt-1">Thứ 7 & Chủ nhật: chỉ hỗ trợ qua email</p>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-8">
              {submitted ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-teal-50 mb-4">
                    <CheckCircle2 className="h-8 w-8 text-teal-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Gửi thành công!</h3>
                  <p className="text-gray-500 text-sm max-w-sm">
                    Chúng tôi đã nhận được tin nhắn của bạn và sẽ phản hồi sớm nhất có thể — thường trong vòng 24 giờ làm việc.
                  </p>
                  <button
                    onClick={() => { setSubmitted(false); setForm({ name: "", email: "", subject: "", message: "" }); }}
                    className="mt-6 text-sm text-teal-600 hover:underline"
                  >
                    Gửi tin nhắn khác
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate className="space-y-5">
                  <h2 className="text-lg font-bold text-gray-900 mb-6">Gửi tin nhắn</h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Họ và tên <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Nguyễn Văn A"
                        className={`w-full rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                          errors.name ? "border-red-400" : "border-gray-200"
                        }`}
                      />
                      {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="ban@email.com"
                        className={`w-full rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                          errors.email ? "border-red-400" : "border-gray-200"
                        }`}
                      />
                      {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                    </div>
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Chủ đề <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="subject"
                      value={form.subject}
                      onChange={handleChange}
                      className={`w-full rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white ${
                        errors.subject ? "border-red-400" : "border-gray-200"
                      }`}
                    >
                      <option value="">-- Chọn chủ đề --</option>
                      {SUBJECTS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    {errors.subject && <p className="mt-1 text-xs text-red-500">{errors.subject}</p>}
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Nội dung <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      rows={5}
                      placeholder="Mô tả chi tiết vấn đề hoặc câu hỏi của bạn..."
                      className={`w-full rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none ${
                        errors.message ? "border-red-400" : "border-gray-200"
                      }`}
                    />
                    <div className="flex justify-between mt-1">
                      {errors.message ? (
                        <p className="text-xs text-red-500">{errors.message}</p>
                      ) : <span />}
                      <span className="text-xs text-gray-400">{form.message.length} ký tự</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-teal-600 text-white font-semibold px-6 py-3 hover:bg-teal-700 transition-colors disabled:opacity-60"
                  >
                    {loading ? (
                      <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    {loading ? "Đang gửi..." : "Gửi tin nhắn"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
