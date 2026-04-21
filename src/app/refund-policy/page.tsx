import type { Metadata } from "next";
import Link from "next/link";
import { RefreshCw, CheckCircle2, XCircle, Clock, AlertTriangle } from "lucide-react";

export const metadata: Metadata = {
  title: "Chính sách hoàn tiền | NexLumina",
  description: "Chính sách hoàn tiền rõ ràng, minh bạch của NexLumina. Hoàn tiền 100% trong 7 ngày.",
};

export default function RefundPolicyPage() {
  return (
    <main className="min-h-screen bg-[#F0FDFA]">
      {/* Hero */}
      <section className="bg-gradient-to-br from-teal-700 via-teal-600 to-cyan-500 py-20 px-4">
        <div className="mx-auto max-w-3xl text-center text-white">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium mb-6">
            <RefreshCw className="h-4 w-4" />
            Chính sách hoàn tiền
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">
            Hoàn tiền 100% trong 7 ngày
          </h1>
          <p className="text-teal-100 text-lg">
            Chúng tôi muốn bạn học với sự tự tin. Nếu không hài lòng, chúng tôi cam kết hoàn tiền nhanh chóng, không hỏi nhiều.
          </p>
        </div>
      </section>

      {/* Highlight cards */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 -mt-8 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: Clock, color: "text-teal-600", bg: "bg-teal-50", title: "7 ngày", sub: "Thời gian yêu cầu hoàn tiền" },
            { icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50", title: "100%", sub: "Hoàn lại toàn bộ số tiền" },
            { icon: RefreshCw, color: "text-blue-600", bg: "bg-blue-50", title: "2–3 ngày", sub: "Thời gian xử lý hoàn tiền" },
          ].map(({ icon: Icon, color, bg, title, sub }) => (
            <div key={title} className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6 text-center">
              <div className={`inline-flex h-12 w-12 items-center justify-center rounded-full ${bg} mb-3`}>
                <Icon className={`h-6 w-6 ${color}`} />
              </div>
              <p className={`text-2xl font-extrabold ${color}`}>{title}</p>
              <p className="text-sm text-gray-500 mt-1">{sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Content */}
      <section className="mx-auto max-w-3xl px-4 sm:px-6 py-16 space-y-10">

        {/* Điều kiện hoàn tiền */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-teal-600" />
            Điều kiện được hoàn tiền
          </h2>
          <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6 space-y-3">
            {[
              "Yêu cầu trong vòng 7 ngày kể từ ngày mua.",
              "Đã xem dưới 20% tổng số bài học trong khóa học.",
              "Chưa nhận chứng chỉ hoàn thành khóa học.",
              "Không vi phạm điều khoản sử dụng dịch vụ.",
            ].map((item) => (
              <div key={item} className="flex items-start gap-3 text-sm text-gray-700">
                <CheckCircle2 className="h-4 w-4 text-teal-500 mt-0.5 shrink-0" />
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* Không được hoàn tiền */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <XCircle className="h-5 w-5 text-red-500" />
            Trường hợp không được hoàn tiền
          </h2>
          <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6 space-y-3">
            {[
              "Đã quá 7 ngày kể từ ngày mua.",
              "Đã xem từ 20% nội dung trở lên.",
              "Đã nhận và tải chứng chỉ hoàn thành.",
              "Khóa học được mua trong chương trình khuyến mãi đặc biệt có ghi rõ \"không hoàn tiền\".",
              "Tài khoản bị phát hiện chia sẻ trái phép hoặc vi phạm điều khoản.",
            ].map((item) => (
              <div key={item} className="flex items-start gap-3 text-sm text-gray-700">
                <XCircle className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* Quy trình */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-teal-600" />
            Quy trình yêu cầu hoàn tiền
          </h2>
          <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6 space-y-5">
            {[
              { step: "01", title: "Gửi yêu cầu", desc: "Email đến support@nexlumina.com với tiêu đề \"Yêu cầu hoàn tiền — [tên khóa học]\"." },
              { step: "02", title: "Cung cấp thông tin", desc: "Đính kèm mã đơn hàng, email đăng ký và lý do hoàn tiền (không bắt buộc)." },
              { step: "03", title: "Xác nhận", desc: "Chúng tôi xác nhận yêu cầu qua email trong vòng 1 ngày làm việc." },
              { step: "04", title: "Hoàn tiền", desc: "Tiền được hoàn về phương thức thanh toán gốc trong 2–3 ngày làm việc." },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex gap-4">
                <div className="shrink-0 flex h-9 w-9 items-center justify-center rounded-full bg-teal-600 text-white text-sm font-bold">
                  {step}
                </div>
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{title}</p>
                  <p className="text-gray-500 text-sm mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Lưu ý */}
        <div className="rounded-2xl bg-amber-50 border border-amber-200 p-6 flex gap-4">
          <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800 space-y-1">
            <p className="font-semibold">Lưu ý về phí xử lý ngân hàng</p>
            <p>
              NexLumina hoàn 100% giá trị đơn hàng. Tuy nhiên, một số ngân hàng hoặc ví điện tử có thể giữ lại phí giao dịch từ 1–2%. Phần phí này nằm ngoài phạm vi kiểm soát của chúng tôi.
            </p>
          </div>
        </div>

        {/* Cập nhật */}
        <p className="text-xs text-gray-400 text-center">
          Chính sách cập nhật lần cuối: 01/04/2026. Mọi thay đổi sẽ được thông báo qua email ít nhất 7 ngày trước khi có hiệu lực.
        </p>

        {/* CTA */}
        <div className="text-center">
          <p className="text-gray-500 text-sm mb-4">Cần hỗ trợ thêm?</p>
          <Link
            href="/contact"
            className="inline-block rounded-xl bg-teal-600 text-white font-semibold px-8 py-3 hover:bg-teal-700 transition-colors"
          >
            Liên hệ chúng tôi →
          </Link>
        </div>
      </section>
    </main>
  );
}
