'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

// ── Section definitions ───────────────────────────────────────────────────────
const sections = [
  { id: 'dieu-khoan-chung',    label: '1. Điều khoản chung' },
  { id: 'dieu-kien-su-dung',   label: '2. Điều kiện sử dụng' },
  { id: 'tai-khoan',           label: '3. Tài khoản người dùng' },
  { id: 'khoa-hoc-thanh-toan', label: '4. Khóa học & Thanh toán' },
  { id: 'quyen-so-huu',        label: '5. Quyền sở hữu trí tuệ' },
  { id: 'hanh-vi-cam',         label: '6. Hành vi bị cấm' },
  { id: 'chinh-sach-hoan-tien',label: '7. Chính sách hoàn tiền' },
  { id: 'trach-nhiem',         label: '8. Giới hạn trách nhiệm' },
  { id: 'dinh-chi',            label: '9. Đình chỉ & Chấm dứt' },
  { id: 'lien-he',             label: '10. Liên hệ & Tranh chấp' },
] as const;

// ── Sub-components ────────────────────────────────────────────────────────────
function SectionHeading({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2
      id={id}
      className="text-2xl font-bold text-slate-800 mb-4 scroll-mt-24 border-b border-slate-200 pb-2"
    >
      {children}
    </h2>
  );
}

function Para({ children }: { children: React.ReactNode }) {
  return <p className="text-slate-600 leading-relaxed mb-4 text-[15px]">{children}</p>;
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="list-none space-y-2 mb-4">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2.5 text-slate-600 text-sm leading-relaxed">
          <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-teal-500 flex-shrink-0" />
          {item}
        </li>
      ))}
    </ul>
  );
}

function AlertBox({
  type,
  title,
  children,
}: {
  type: 'info' | 'warning' | 'danger' | 'success';
  title: string;
  children: React.ReactNode;
}) {
  const styles = {
    info:    { wrap: 'bg-blue-50 border-blue-200',   title: 'text-blue-900',  body: 'text-blue-700',  icon: 'ℹ️' },
    warning: { wrap: 'bg-yellow-50 border-yellow-200', title: 'text-yellow-900', body: 'text-yellow-700', icon: '⚠️' },
    danger:  { wrap: 'bg-red-50 border-red-200',     title: 'text-red-900',   body: 'text-red-700',   icon: '🚫' },
    success: { wrap: 'bg-emerald-50 border-emerald-200', title: 'text-emerald-900', body: 'text-emerald-700', icon: '✅' },
  }[type];

  return (
    <div className={`border rounded-2xl p-5 mb-5 ${styles.wrap}`}>
      <div className="flex items-center gap-2 mb-2">
        <span>{styles.icon}</span>
        <p className={`font-semibold text-sm ${styles.title}`}>{title}</p>
      </div>
      <div className={`text-sm leading-relaxed ${styles.body}`}>{children}</div>
    </div>
  );
}

function TermCard({
  icon,
  title,
  children,
}: {
  icon: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-4 p-5 bg-slate-50 rounded-xl border border-slate-200 mb-4">
      <span className="text-2xl flex-shrink-0 mt-0.5">{icon}</span>
      <div>
        <p className="font-semibold text-slate-800 mb-1.5 text-sm">{title}</p>
        <div className="text-slate-600 text-sm leading-relaxed">{children}</div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function TermsPage() {
  const [activeSection, setActiveSection] = useState<string>(sections[0].id);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const targets = sections
      .map((s) => document.getElementById(s.id))
      .filter(Boolean) as HTMLElement[];

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: '-20% 0px -70% 0px' },
    );

    targets.forEach((el) => observerRef.current?.observe(el));
    return () => observerRef.current?.disconnect();
  }, []);

  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-teal-700 via-teal-600 to-emerald-700 text-white py-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <span className="inline-flex items-center gap-2 bg-white/20 backdrop-blur border border-white/30 text-white text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
            <span className="h-2 w-2 rounded-full bg-orange-400 animate-pulse" />
            Điều Khoản Dịch Vụ · Cập nhật 21/04/2025
          </span>

          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">
            Điều Khoản Dịch Vụ
          </h1>
          <p className="text-teal-100 text-lg md:text-xl max-w-2xl mx-auto mb-8 leading-relaxed">
            Bằng cách sử dụng NexLumina, bạn đồng ý với các điều khoản và điều kiện được nêu trong
            tài liệu này. Vui lòng đọc kỹ trước khi đăng ký.
          </p>

          {/* Meta strip */}
          <div className="flex flex-wrap justify-center gap-6 text-sm text-teal-200">
            <span className="flex items-center gap-1.5">
              <span>📅</span>
              <span>Hiệu lực: <strong className="text-white">21 tháng 4, 2025</strong></span>
            </span>
            <span className="flex items-center gap-1.5">
              <span>🌍</span>
              <span>Phiên bản: <strong className="text-white">v1.0 · Tiếng Việt</strong></span>
            </span>
            <span className="flex items-center gap-1.5">
              <span>⚖️</span>
              <span>Pháp lý: <strong className="text-white">Luật VN · Udemy-compliant</strong></span>
            </span>
          </div>
        </div>
      </section>

      {/* ── Body: sidebar + content ──────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 flex flex-col lg:flex-row gap-10">

        {/* ── Sidebar ──────────────────────────────────────────────────────── */}
        <aside className="lg:w-64 flex-shrink-0">
          <div className="sticky top-6 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-200 px-5 py-3">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Mục lục</p>
            </div>
            <nav className="py-2">
              {sections.map((s) => (
                <button
                  key={s.id}
                  onClick={() => scrollTo(s.id)}
                  className={[
                    'w-full text-left px-5 py-2.5 text-sm transition-colors duration-150',
                    activeSection === s.id
                      ? 'bg-teal-50 text-teal-700 font-semibold border-r-2 border-teal-600'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                  ].join(' ')}
                >
                  {s.label}
                </button>
              ))}
            </nav>
            {/* Quick contact */}
            <div className="mx-4 mb-4 mt-2 bg-teal-600 text-white rounded-xl p-4 text-center">
              <p className="text-xs font-semibold mb-1">Cần giải đáp?</p>
              <p className="text-xs text-teal-200 mb-2">Liên hệ bộ phận pháp lý</p>
              <a
                href="mailto:legal@nexlumina.com"
                className="inline-block bg-white text-teal-700 text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-teal-50 transition-colors"
              >
                legal@nexlumina.com
              </a>
            </div>
          </div>
        </aside>

        {/* ── Main content ─────────────────────────────────────────────────── */}
        <main className="flex-1 min-w-0 space-y-12">

          {/* ─ 1. Điều khoản chung ─────────────────────────────────────────── */}
          <section>
            <SectionHeading id="dieu-khoan-chung">1. Điều Khoản Chung</SectionHeading>
            <Para>
              Chào mừng bạn đến với <strong>NexLumina</strong> — nền tảng học trực tuyến chất lượng cao
              thuộc sở hữu và vận hành bởi <strong>Công ty TNHH NexLumina</strong> (Mã số doanh nghiệp:
              0123456789, trụ sở: 123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh, Việt Nam).
            </Para>
            <AlertBox type="info" title="Lưu ý quan trọng">
              Bằng cách truy cập hoặc sử dụng NexLumina — kể cả duyệt web, đăng ký tài khoản, mua khóa học hoặc tham gia cộng đồng học viên — bạn xác nhận đã đọc, hiểu và đồng ý bị ràng buộc bởi các Điều Khoản Dịch Vụ này cùng <Link href="/privacy" className="underline font-medium">Chính sách Bảo mật</Link> của chúng tôi.
            </AlertBox>
            <Para>
              Nếu bạn không đồng ý với bất kỳ điều khoản nào, vui lòng ngừng sử dụng dịch vụ ngay lập tức.
              NexLumina có quyền cập nhật các điều khoản này bất kỳ lúc nào và sẽ thông báo khi có thay
              đổi quan trọng.
            </Para>
            <div className="grid sm:grid-cols-3 gap-4 mt-6">
              {[
                { icon: '📚', title: 'Học tập', desc: 'Truy cập hàng trăm khóa học từ chuyên gia hàng đầu' },
                { icon: '🎓', title: 'Chứng chỉ', desc: 'Nhận chứng chỉ hoàn thành được công nhận quốc tế' },
                { icon: '🤝', title: 'Cộng đồng', desc: 'Kết nối với hàng nghìn học viên và giảng viên' },
              ].map((item) => (
                <div key={item.title} className="p-4 border border-slate-200 rounded-xl text-center">
                  <span className="text-3xl block mb-2">{item.icon}</span>
                  <p className="font-semibold text-slate-800 text-sm mb-1">{item.title}</p>
                  <p className="text-slate-500 text-xs leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ─ 2. Điều kiện sử dụng ────────────────────────────────────────── */}
          <section>
            <SectionHeading id="dieu-kien-su-dung">2. Điều Kiện Sử Dụng</SectionHeading>
            <Para>
              Để sử dụng NexLumina, bạn phải đáp ứng đầy đủ các điều kiện sau:
            </Para>
            <div className="grid md:grid-cols-2 gap-4 mb-5">
              {[
                { icon: '🎂', title: 'Độ tuổi tối thiểu', desc: 'Từ đủ 16 tuổi trở lên. Người dưới 16 tuổi phải có sự đồng ý bằng văn bản từ cha/mẹ hoặc người giám hộ hợp pháp.' },
                { icon: '📍', title: 'Vùng địa lý', desc: 'Dịch vụ khả dụng tại Việt Nam và quốc tế. Một số tính năng thanh toán có thể bị giới hạn theo quốc gia.' },
                { icon: '⚖️', title: 'Năng lực pháp lý', desc: 'Bạn có đủ năng lực pháp lý để ký kết hợp đồng và sử dụng dịch vụ theo pháp luật hiện hành.' },
                { icon: '🔒', title: 'Không vi phạm', desc: 'Tài khoản của bạn chưa bị đình chỉ hoặc cấm sử dụng vĩnh viễn bởi NexLumina vì lý do vi phạm trước đó.' },
              ].map((item) => (
                <TermCard key={item.title} icon={item.icon} title={item.title}>
                  {item.desc}
                </TermCard>
              ))}
            </div>
            <AlertBox type="warning" title="Sử dụng cho mục đích thương mại">
              Việc sử dụng NexLumina cho mục đích thương mại — bao gồm đào tạo doanh nghiệp, bán lại tài
              khoản hoặc tích hợp API — yêu cầu giấy phép Enterprise riêng. Liên hệ{' '}
              <a href="mailto:enterprise@nexlumina.com" className="underline font-medium">enterprise@nexlumina.com</a>{' '}
              để biết thêm chi tiết.
            </AlertBox>
          </section>

          {/* ─ 3. Tài khoản ─────────────────────────────────────────────────── */}
          <section>
            <SectionHeading id="tai-khoan">3. Tài Khoản Người Dùng</SectionHeading>
            <Para>
              Mỗi người dùng chỉ được phép sở hữu một (1) tài khoản NexLumina. Bạn chịu hoàn toàn trách
              nhiệm về mọi hoạt động diễn ra dưới tài khoản của mình.
            </Para>

            <div className="mb-5">
              <p className="text-sm font-semibold text-slate-700 mb-3">Trách nhiệm bảo mật tài khoản:</p>
              <BulletList items={[
                'Sử dụng mật khẩu mạnh, ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt.',
                'Không chia sẻ thông tin đăng nhập với bất kỳ ai, kể cả thành viên gia đình.',
                'Đăng xuất khỏi thiết bị công cộng sau mỗi phiên sử dụng.',
                'Thông báo ngay cho chúng tôi nếu phát hiện truy cập trái phép tại security@nexlumina.com.',
                'Kích hoạt xác thực hai yếu tố (2FA) để tăng cường bảo mật tài khoản.',
              ]} />
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200 mb-5">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Hành động</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Cho phép</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Ghi chú</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[
                    ['Cập nhật hồ sơ cá nhân', '✅', 'Tên hiển thị, ảnh đại diện, bio'],
                    ['Đổi email đăng nhập', '✅', 'Yêu cầu xác minh email mới'],
                    ['Chia sẻ tài khoản', '🚫', 'Vi phạm điều khoản, bị khóa vĩnh viễn'],
                    ['Mua/tặng khóa học', '✅', 'Chỉ tặng cho 1 người/khóa/lần'],
                    ['Xóa tài khoản', '✅', 'Yêu cầu xác nhận, dữ liệu xóa sau 30 ngày'],
                    ['Đăng nhập đồng thời nhiều thiết bị', '✅', 'Tối đa 3 thiết bị cùng lúc'],
                  ].map(([action, allow, note], i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-slate-800 font-medium">{action}</td>
                      <td className="px-4 py-3">{allow}</td>
                      <td className="px-4 py-3 text-slate-500">{note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* ─ 4. Khóa học & Thanh toán ────────────────────────────────────── */}
          <section>
            <SectionHeading id="khoa-hoc-thanh-toan">4. Khóa Học & Thanh Toán</SectionHeading>
            <Para>
              NexLumina cung cấp các khóa học theo mô hình mua một lần (Lifetime Access) hoặc đăng ký
              gói Premium hàng tháng/năm. Tất cả giá đã bao gồm VAT theo quy định pháp luật Việt Nam.
            </Para>

            <div className="grid md:grid-cols-3 gap-4 mb-6">
              {[
                {
                  icon: '🎯',
                  title: 'Mua lẻ (One-time)',
                  color: 'border-teal-200 bg-teal-50',
                  titleColor: 'text-teal-900',
                  items: ['Truy cập vĩnh viễn khóa học đã mua', 'Bao gồm tất cả cập nhật trong tương lai', 'Chứng chỉ hoàn thành', 'Không gia hạn tự động'],
                },
                {
                  icon: '⭐',
                  title: 'Premium (Subscription)',
                  color: 'border-orange-200 bg-orange-50',
                  titleColor: 'text-orange-900',
                  items: ['Truy cập toàn bộ kho khóa học', 'Ưu tiên hỗ trợ từ giảng viên', 'Tải nội dung học offline', 'Tự động gia hạn hàng tháng/năm'],
                },
                {
                  icon: '🏢',
                  title: 'Enterprise',
                  color: 'border-slate-200 bg-slate-50',
                  titleColor: 'text-slate-900',
                  items: ['Nhiều tài khoản theo nhóm', 'Báo cáo tiến độ đội nhóm', 'Hóa đơn VAT doanh nghiệp', 'SLA và hỗ trợ ưu tiên 24/7'],
                },
              ].map((plan) => (
                <div key={plan.title} className={`border rounded-2xl p-5 ${plan.color}`}>
                  <div className="text-2xl mb-2">{plan.icon}</div>
                  <p className={`font-bold text-sm mb-3 ${plan.titleColor}`}>{plan.title}</p>
                  <ul className="space-y-1.5">
                    {plan.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                        <span className="text-teal-600 mt-0.5 flex-shrink-0">✓</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <Para>
              NexLumina chấp nhận các phương thức thanh toán: <strong>Thẻ tín dụng/ghi nợ quốc tế</strong>{' '}
              (Visa, Mastercard), <strong>Ví điện tử</strong> (MoMo, ZaloPay, VNPay),{' '}
              <strong>Chuyển khoản ngân hàng</strong> và <strong>PayOS</strong>.
              Tất cả giao dịch được mã hóa TLS 1.3 và xử lý qua cổng thanh toán đạt chuẩn PCI DSS Level 1.
            </Para>

            <AlertBox type="info" title="Giá và khuyến mãi">
              NexLumina có thể thay đổi giá bất kỳ lúc nào. Giá tại thời điểm thanh toán là giá cuối
              cùng. Mã giảm giá chỉ áp dụng cho đơn hàng mới, không áp dụng hồi tố cho đơn hàng đã
              thanh toán và không có giá trị quy đổi thành tiền mặt.
            </AlertBox>
          </section>

          {/* ─ 5. Quyền sở hữu trí tuệ ─────────────────────────────────────── */}
          <section>
            <SectionHeading id="quyen-so-huu">5. Quyền Sở Hữu Trí Tuệ</SectionHeading>
            <Para>
              Toàn bộ nội dung trên NexLumina — bao gồm nhưng không giới hạn ở: video bài giảng, tài
              liệu học tập, hình ảnh, mã nguồn ví dụ, bài kiểm tra và thiết kế giao diện — được bảo hộ
              theo Luật Sở hữu Trí tuệ Việt Nam (sửa đổi 2022) và các công ước quốc tế liên quan.
            </Para>

            <div className="grid md:grid-cols-2 gap-4 mb-5">
              <div className="border border-green-200 bg-green-50 rounded-2xl p-5">
                <p className="font-bold text-green-900 mb-3 flex items-center gap-2">
                  <span>✅</span> Bạn được phép
                </p>
                <BulletList items={[
                  'Xem nội dung khóa học bạn đã mua để học tập cá nhân',
                  'Tải xuống tài liệu PDF đi kèm khóa học (nếu có)',
                  'Chia sẻ đường dẫn giới thiệu khóa học (không phải nội dung)',
                  'Sử dụng code ví dụ trong bài giảng cho dự án cá nhân và thương mại',
                  'Chụp màn hình ghi chú học tập cho nhu cầu cá nhân',
                ]} />
              </div>
              <div className="border border-red-200 bg-red-50 rounded-2xl p-5">
                <p className="font-bold text-red-900 mb-3 flex items-center gap-2">
                  <span>🚫</span> Bạn không được phép
                </p>
                <BulletList items={[
                  'Tải, sao chép hoặc phân phối lại video bài giảng dưới bất kỳ hình thức nào',
                  'Bán hoặc cấp phép nội dung khóa học cho bên thứ ba',
                  'Sử dụng nội dung để tạo sản phẩm cạnh tranh',
                  'Đặt lại nhãn hiệu (rebrand) và phân phối tài liệu của NexLumina',
                  'Gỡ bỏ thông báo bản quyền hoặc watermark khỏi tài liệu',
                ]} />
              </div>
            </div>

            <Para>
              Vi phạm quyền sở hữu trí tuệ sẽ dẫn đến đình chỉ tài khoản ngay lập tức và có thể bị
              truy cứu trách nhiệm pháp lý theo quy định của pháp luật.
            </Para>
          </section>

          {/* ─ 6. Hành vi bị cấm ────────────────────────────────────────────── */}
          <section>
            <SectionHeading id="hanh-vi-cam">6. Hành Vi Bị Cấm</SectionHeading>
            <Para>
              Khi sử dụng NexLumina, bạn tuyệt đối không được thực hiện các hành vi sau:
            </Para>
            <div className="space-y-3 mb-5">
              {[
                {
                  category: '🔐 Bảo mật hệ thống',
                  items: ['Tấn công, khai thác hoặc kiểm tra lỗ hổng bảo mật mà không được phép', 'Cài đặt malware, virus hoặc mã độc hại', 'Cố tình làm quá tải máy chủ (DDoS)'],
                },
                {
                  category: '📛 Nội dung vi phạm',
                  items: ['Đăng nội dung phân biệt chủng tộc, kỳ thị giới tính, hay thù địch', 'Spam trong khu vực bình luận hoặc diễn đàn', 'Giả mạo giảng viên, nhân viên NexLumina hoặc người dùng khác'],
                },
                {
                  category: '💳 Gian lận tài chính',
                  items: ['Sử dụng thông tin thanh toán gian lận hoặc thẻ tín dụng bị đánh cắp', 'Lợi dụng chính sách hoàn tiền (chargeback fraud)', 'Mua khóa học chỉ để tải nội dung rồi hoàn tiền'],
                },
              ].map((group) => (
                <div key={group.category} className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="bg-slate-50 border-b border-slate-200 px-5 py-3">
                    <p className="font-semibold text-slate-700 text-sm">{group.category}</p>
                  </div>
                  <div className="px-5 py-4">
                    <BulletList items={group.items} />
                  </div>
                </div>
              ))}
            </div>
            <AlertBox type="danger" title="Hệ quả vi phạm">
              Vi phạm bất kỳ điều nào trên đây có thể dẫn đến: cảnh cáo, đình chỉ tài khoản tạm thời,
              khóa tài khoản vĩnh viễn, hoặc truy cứu trách nhiệm pháp lý dân sự và hình sự theo quy
              định pháp luật Việt Nam.
            </AlertBox>
          </section>

          {/* ─ 7. Chính sách hoàn tiền ─────────────────────────────────────── */}
          <section>
            <SectionHeading id="chinh-sach-hoan-tien">7. Chính Sách Hoàn Tiền</SectionHeading>
            <Para>
              NexLumina áp dụng chính sách hoàn tiền minh bạch, lấy sự hài lòng của học viên làm
              trung tâm. Chúng tôi cam kết xử lý yêu cầu hoàn tiền trong vòng <strong>5–7 ngày làm việc</strong>.
            </Para>

            <div className="space-y-4 mb-5">
              {[
                {
                  title: 'Khóa học đơn lẻ (One-time purchase)',
                  icon: '🎯',
                  color: 'border-teal-200',
                  conditions: [
                    'Hoàn tiền 100% trong vòng 30 ngày kể từ ngày mua nếu bạn chưa xem quá 30% nội dung khóa học.',
                    'Hoàn tiền 50% nếu đã xem 30–60% nội dung trong vòng 30 ngày.',
                    'Không hoàn tiền nếu đã xem trên 60% nội dung hoặc đã nhận chứng chỉ.',
                    'Không hoàn tiền cho khóa học có giá dưới 50.000 VNĐ (khóa học miễn phí/discount sâu).',
                  ],
                },
                {
                  title: 'Gói Premium (Subscription)',
                  icon: '⭐',
                  color: 'border-orange-200',
                  conditions: [
                    'Hoàn tiền 100% trong 7 ngày đầu nếu bạn chưa sử dụng bất kỳ tính năng Premium nào.',
                    'Không hoàn tiền cho tháng hiện tại nếu đã sử dụng dịch vụ.',
                    'Hủy đăng ký bất kỳ lúc nào — gói vẫn hoạt động đến hết chu kỳ thanh toán hiện tại.',
                    'Không hoàn tiền cho gói năm nếu đã hết thời hạn 30 ngày dùng thử.',
                  ],
                },
              ].map((policy) => (
                <div key={policy.title} className={`border rounded-2xl overflow-hidden ${policy.color}`}>
                  <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 flex items-center gap-2">
                    <span>{policy.icon}</span>
                    <p className="font-semibold text-slate-700 text-sm">{policy.title}</p>
                  </div>
                  <div className="px-5 py-4">
                    <BulletList items={policy.conditions} />
                  </div>
                </div>
              ))}
            </div>

            <Para>
              Để yêu cầu hoàn tiền, truy cập <strong>Tài khoản → Lịch sử đơn hàng → Yêu cầu hoàn tiền</strong>,
              hoặc gửi email đến <a href="mailto:support@nexlumina.com" className="text-teal-600 hover:underline font-medium">support@nexlumina.com</a>{' '}
              với tiêu đề <em>"Yêu cầu hoàn tiền — [Tên khóa học] — [Mã đơn hàng]"</em>.
            </Para>
          </section>

          {/* ─ 8. Giới hạn trách nhiệm ─────────────────────────────────────── */}
          <section>
            <SectionHeading id="trach-nhiem">8. Giới Hạn Trách Nhiệm</SectionHeading>
            <Para>
              NexLumina cung cấp dịch vụ <strong>"nguyên trạng" (as-is)</strong> và <strong>"như có sẵn" (as-available)</strong>.
              Chúng tôi nỗ lực duy trì uptime 99.5% nhưng không đảm bảo dịch vụ sẽ không bị gián đoạn
              hoặc hoàn toàn không có lỗi.
            </Para>

            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 mb-5">
              <p className="font-bold text-yellow-900 mb-3">⚖️ Giới hạn trách nhiệm pháp lý</p>
              <p className="text-yellow-800 text-sm leading-relaxed mb-3">
                Trong phạm vi tối đa được pháp luật cho phép, NexLumina không chịu trách nhiệm về:
              </p>
              <BulletList items={[
                'Thiệt hại gián tiếp, ngẫu nhiên, hậu quả hoặc trừng phạt phát sinh từ việc sử dụng dịch vụ',
                'Mất dữ liệu, lợi nhuận, cơ hội kinh doanh do sự cố kỹ thuật nằm ngoài tầm kiểm soát',
                'Nội dung do giảng viên hoặc người dùng đăng tải (chúng tôi chỉ là nền tảng trung gian)',
                'Hậu quả từ việc áp dụng kiến thức học được mà không có sự kiểm chứng chuyên môn',
                'Gián đoạn dịch vụ do bất khả kháng: thiên tai, tấn công mạng quy mô lớn, sự cố nhà cung cấp hạ tầng',
              ]} />
              <p className="text-yellow-800 text-sm">
                Tổng trách nhiệm của NexLumina không vượt quá số tiền bạn đã thanh toán trong 12 tháng
                gần nhất trước khi xảy ra tranh chấp.
              </p>
            </div>
          </section>

          {/* ─ 9. Đình chỉ & Chấm dứt ──────────────────────────────────────── */}
          <section>
            <SectionHeading id="dinh-chi">9. Đình Chỉ & Chấm Dứt</SectionHeading>
            <Para>
              NexLumina có quyền đình chỉ hoặc chấm dứt tài khoản của bạn trong các trường hợp sau:
            </Para>

            <div className="space-y-3 mb-5">
              {[
                { level: 'Cảnh cáo', color: 'bg-yellow-50 border-yellow-200 text-yellow-800', reason: 'Vi phạm nhẹ lần đầu (spam, ngôn ngữ không phù hợp)' },
                { level: 'Đình chỉ tạm thời (7–30 ngày)', color: 'bg-orange-50 border-orange-200 text-orange-800', reason: 'Vi phạm lặp lại hoặc mức độ trung bình (gian lận nhỏ, quấy rối)' },
                { level: 'Đình chỉ vĩnh viễn', color: 'bg-red-50 border-red-200 text-red-800', reason: 'Vi phạm nghiêm trọng (chia sẻ bất hợp pháp, gian lận tài chính, tấn công hệ thống)' },
              ].map((item) => (
                <div key={item.level} className={`border rounded-xl p-4 ${item.color}`}>
                  <p className="font-semibold text-sm mb-1">{item.level}</p>
                  <p className="text-sm opacity-90">{item.reason}</p>
                </div>
              ))}
            </div>

            <Para>
              Khi tài khoản bị đình chỉ vĩnh viễn do vi phạm, bạn <strong>không được hoàn tiền</strong>{' '}
              cho các khóa học đã mua. Nếu bạn cho rằng quyết định đình chỉ là không chính xác, hãy gửi
              khiếu nại đến <a href="mailto:appeal@nexlumina.com" className="text-teal-600 hover:underline font-medium">appeal@nexlumina.com</a>{' '}
              trong vòng 30 ngày kể từ ngày nhận thông báo.
            </Para>

            <Para>
              Bạn có thể tự chấm dứt tài khoản bất kỳ lúc nào tại <strong>Cài đặt → Tài khoản → Xóa tài khoản</strong>.
              Dữ liệu cá nhân sẽ được xóa theo đúng quy định trong <Link href="/privacy" className="text-teal-600 hover:underline">Chính sách Bảo mật</Link>.
            </Para>
          </section>

          {/* ─ 10. Liên hệ & Tranh chấp ─────────────────────────────────────── */}
          <section>
            <SectionHeading id="lien-he">10. Liên Hệ & Giải Quyết Tranh Chấp</SectionHeading>
            <Para>
              NexLumina cam kết giải quyết mọi tranh chấp một cách công bằng, nhanh chóng và đề cao
              lợi ích của người học. Quy trình giải quyết tranh chấp gồm 3 bước:
            </Para>

            <div className="flex flex-col md:flex-row gap-4 mb-6">
              {[
                { step: '01', title: 'Hỗ trợ trực tiếp', desc: 'Liên hệ đội hỗ trợ qua chat hoặc email. Thời gian phản hồi: 24–48 giờ làm việc.', color: 'bg-teal-600' },
                { step: '02', title: 'Xem xét nội bộ', desc: 'Nếu chưa thỏa đáng, yêu cầu được chuyển lên ban pháp lý để xem xét trong 7 ngày.', color: 'bg-blue-600' },
                { step: '03', title: 'Trọng tài / Tòa án', desc: 'Tranh chấp không giải quyết được sẽ do Tòa án nhân dân TP. HCM phán quyết theo luật Việt Nam.', color: 'bg-slate-700' },
              ].map((step) => (
                <div key={step.step} className="flex-1 border border-slate-200 rounded-2xl p-5 text-center">
                  <span className={`inline-flex items-center justify-center w-10 h-10 rounded-full text-white font-bold text-lg ${step.color} mb-3`}>
                    {step.step}
                  </span>
                  <p className="font-bold text-slate-800 text-sm mb-2">{step.title}</p>
                  <p className="text-slate-500 text-xs leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="border border-slate-200 rounded-2xl p-6">
                <p className="font-bold text-slate-800 mb-4">📬 Liên hệ theo bộ phận</p>
                <div className="space-y-3 text-sm">
                  {[
                    { dept: 'Hỗ trợ học viên', email: 'support@nexlumina.com' },
                    { dept: 'Pháp lý & Điều khoản', email: 'legal@nexlumina.com' },
                    { dept: 'Đối tác & Enterprise', email: 'enterprise@nexlumina.com' },
                    { dept: 'Khiếu nại & Kháng cáo', email: 'appeal@nexlumina.com' },
                  ].map((item) => (
                    <div key={item.dept} className="flex items-center justify-between">
                      <span className="text-slate-600">{item.dept}</span>
                      <a href={`mailto:${item.email}`} className="text-teal-600 hover:underline font-medium text-xs">
                        {item.email}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
              <div className="border border-slate-200 rounded-2xl p-6">
                <p className="font-bold text-slate-800 mb-4">🏢 Địa chỉ pháp lý</p>
                <div className="space-y-2 text-sm text-slate-600">
                  <p><strong>Công ty TNHH NexLumina</strong></p>
                  <p>123 Nguyễn Huệ, Phường Bến Nghé</p>
                  <p>Quận 1, TP. Hồ Chí Minh, Việt Nam</p>
                  <p>Mã số DN: 0123456789</p>
                  <p>Điện thoại: <a href="tel:+842838219900" className="text-teal-600 hover:underline">+84 28 3821 9900</a></p>
                  <p className="text-slate-400 text-xs mt-2">T2–T6 · 09:00–17:00 ICT</p>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-2xl p-8 text-center">
              <p className="text-2xl font-bold mb-2">Còn thắc mắc về điều khoản?</p>
              <p className="text-teal-100 mb-6 max-w-lg mx-auto text-sm">
                Đội ngũ pháp lý của NexLumina luôn sẵn sàng giải đáp. Phản hồi trong vòng 2 ngày làm việc.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-3">
                <a
                  href="mailto:legal@nexlumina.com"
                  className="bg-white text-teal-700 font-bold px-6 py-3 rounded-xl hover:bg-teal-50 transition-colors text-sm"
                >
                  📧 Liên hệ bộ phận pháp lý
                </a>
                <Link
                  href="/privacy"
                  className="bg-white/20 hover:bg-white/30 text-white font-bold px-6 py-3 rounded-xl transition-colors text-sm border border-white/30"
                >
                  🔒 Xem Chính sách Bảo mật
                </Link>
              </div>
            </div>
          </section>

          {/* Footer note */}
          <p className="text-center text-slate-400 text-xs pb-8 border-t border-slate-100 pt-6">
            © {new Date().getFullYear()} NexLumina Ltd. · Điều Khoản Dịch Vụ v1.0 · Có hiệu lực từ 21/04/2025
            · Áp dụng pháp luật Cộng hoà Xã hội Chủ nghĩa Việt Nam
          </p>
        </main>
      </div>
    </div>
  );
}
