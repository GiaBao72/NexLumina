"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle, Search } from "lucide-react";

const FAQS = [
  {
    group: "Tài khoản & Đăng ký",
    items: [
      {
        q: "Làm thế nào để tạo tài khoản NexLumina?",
        a: "Bạn truy cập trang /register, điền email và mật khẩu là xong. Sau khi đăng ký thành công bạn sẽ được chuyển thẳng vào dashboard.",
      },
      {
        q: "Tôi quên mật khẩu, phải làm gì?",
        a: "Vào trang Đăng nhập → nhấn \"Quên mật khẩu\" → nhập email đã đăng ký. Hệ thống sẽ gửi link đặt lại mật khẩu trong vài phút.",
      },
      {
        q: "Một tài khoản có thể dùng trên nhiều thiết bị không?",
        a: "Có. Tài khoản NexLumina hoạt động trên mọi thiết bị có trình duyệt — máy tính, điện thoại, máy tính bảng. Tiến độ học được đồng bộ tự động.",
      },
    ],
  },
  {
    group: "Khóa học & Học tập",
    items: [
      {
        q: "Sau khi mua, tôi học được trong bao lâu?",
        a: "Quyền truy cập là vĩnh viễn. Bạn học theo tốc độ của mình, xem lại bất cứ lúc nào, kể cả khi khóa học được cập nhật thêm bài mới.",
      },
      {
        q: "Video có thể tải về xem offline không?",
        a: "Hiện tại video được stream qua Bunny CDN, chưa hỗ trợ tải về. Tính năng offline đang trong lộ trình phát triển.",
      },
      {
        q: "Làm thế nào để theo dõi tiến độ học?",
        a: "Vào Dashboard → bạn sẽ thấy tiến độ từng khóa học, streak học tập, và biểu đồ hoạt động theo tuần/tháng.",
      },
      {
        q: "Tôi có nhận được chứng chỉ sau khi hoàn thành không?",
        a: "Có. Sau khi hoàn thành 100% bài học và vượt qua bài kiểm tra cuối khóa, hệ thống tự động cấp chứng chỉ có thể tải về và chia sẻ lên LinkedIn.",
      },
    ],
  },
  {
    group: "Thanh toán & Đơn hàng",
    items: [
      {
        q: "NexLumina chấp nhận những phương thức thanh toán nào?",
        a: "Hiện tại hỗ trợ thanh toán qua thẻ tín dụng/ghi nợ (Visa, Mastercard), chuyển khoản ngân hàng nội địa và ví điện tử. Chúng tôi đang tích hợp thêm PayOS và Stripe.",
      },
      {
        q: "Đơn hàng của tôi ở đâu? Sao chưa thấy khóa học?",
        a: "Sau khi thanh toán thành công, khóa học sẽ xuất hiện ngay trong Dashboard của bạn. Nếu sau 15 phút vẫn chưa thấy, hãy liên hệ hỗ trợ qua trang Liên hệ.",
      },
      {
        q: "Có ưu đãi cho nhóm hoặc doanh nghiệp không?",
        a: "Có. Chúng tôi có gói Business cho từ 5 người trở lên, bao gồm tài khoản quản lý, báo cáo tiến độ nhóm và giá ưu đãi. Liên hệ hello@nexlumina.com để được tư vấn.",
      },
    ],
  },
  {
    group: "Hoàn tiền & Khiếu nại",
    items: [
      {
        q: "Chính sách hoàn tiền của NexLumina như thế nào?",
        a: "Bạn được hoàn tiền 100% trong vòng 7 ngày kể từ ngày mua, với điều kiện đã xem dưới 20% nội dung khóa học. Xem chi tiết tại trang Chính sách hoàn tiền.",
      },
      {
        q: "Làm thế nào để yêu cầu hoàn tiền?",
        a: "Gửi email đến support@nexlumina.com với tiêu đề \"Yêu cầu hoàn tiền — [tên khóa học]\" kèm mã đơn hàng. Chúng tôi xử lý trong 2–3 ngày làm việc.",
      },
    ],
  },
  {
    group: "Kỹ thuật",
    items: [
      {
        q: "Video bị lag hoặc không load, phải làm gì?",
        a: "Thử các bước sau: (1) Tải lại trang, (2) Kiểm tra kết nối internet, (3) Xóa cache trình duyệt, (4) Thử trình duyệt khác. Nếu vẫn lỗi, báo cáo tại trang Liên hệ kèm tên khóa học và tên bài học.",
      },
      {
        q: "NexLumina hỗ trợ trình duyệt nào?",
        a: "Chrome, Firefox, Safari, Edge phiên bản 2 năm gần nhất. Khuyến nghị dùng Chrome hoặc Edge để có trải nghiệm tốt nhất.",
      },
    ],
  },
];

export default function HelpPage() {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});
  const [search, setSearch] = useState("");

  function toggle(key: string) {
    setOpenItems((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  const filtered = FAQS.map((group) => ({
    ...group,
    items: group.items.filter(
      (item) =>
        search === "" ||
        item.q.toLowerCase().includes(search.toLowerCase()) ||
        item.a.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter((g) => g.items.length > 0);

  return (
    <main className="min-h-screen bg-[#F0FDFA]">
      {/* Hero */}
      <section className="bg-gradient-to-br from-teal-700 via-teal-600 to-cyan-500 py-20 px-4">
        <div className="mx-auto max-w-3xl text-center text-white">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium mb-6">
            <HelpCircle className="h-4 w-4" />
            Trung tâm trợ giúp
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">
            Chúng tôi có thể giúp gì cho bạn?
          </h1>
          <p className="text-teal-100 text-lg mb-8">
            Tìm câu trả lời nhanh cho các câu hỏi thường gặp về NexLumina.
          </p>
          {/* Search */}
          <div className="relative max-w-lg mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm câu hỏi..."
              className="w-full rounded-xl bg-white pl-12 pr-4 py-3 text-gray-800 text-sm shadow-md focus:outline-none focus:ring-2 focus:ring-teal-400"
            />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 sm:px-6 py-16">
        {filtered.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <HelpCircle className="h-12 w-12 mx-auto mb-4 opacity-40" />
            <p className="text-lg font-medium">Không tìm thấy câu hỏi phù hợp.</p>
            <p className="text-sm mt-1">Thử từ khóa khác hoặc liên hệ chúng tôi trực tiếp.</p>
          </div>
        )}

        {filtered.map((group) => (
          <div key={group.group} className="mb-10">
            <h2 className="text-base font-bold text-teal-700 uppercase tracking-wider mb-4">
              {group.group}
            </h2>
            <div className="space-y-3">
              {group.items.map((item, i) => {
                const key = `${group.group}-${i}`;
                const isOpen = !!openItems[key];
                return (
                  <div
                    key={key}
                    className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden"
                  >
                    <button
                      onClick={() => toggle(key)}
                      className="w-full flex items-center justify-between px-6 py-4 text-left"
                    >
                      <span className="font-semibold text-gray-800 text-sm pr-4">{item.q}</span>
                      <ChevronDown
                        className={`shrink-0 h-5 w-5 text-teal-500 transition-transform ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-6 pb-5 text-sm text-gray-600 leading-relaxed border-t border-gray-50 pt-3">
                        {item.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Still need help */}
        <div className="mt-8 rounded-2xl bg-teal-700 text-white p-8 text-center">
          <h3 className="text-xl font-bold mb-2">Vẫn chưa tìm được câu trả lời?</h3>
          <p className="text-teal-100 text-sm mb-5">
            Đội ngũ hỗ trợ của chúng tôi phản hồi trong vòng 24 giờ làm việc.
          </p>
          <a
            href="/contact"
            className="inline-block rounded-xl bg-white text-teal-700 font-semibold px-6 py-2.5 text-sm hover:bg-teal-50 transition-colors"
          >
            Liên hệ hỗ trợ →
          </a>
        </div>
      </section>
    </main>
  );
}
