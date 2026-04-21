'use client';

import { useEffect, useRef, useState } from 'react';
import Navbar from '@/components/Navbar';

// ── Section definitions ───────────────────────────────────────────────────────
const sections = [
  { id: 'thu-thap',     label: '1. Thu thập dữ liệu' },
  { id: 'su-dung',      label: '2. Sử dụng dữ liệu' },
  { id: 'chia-se',      label: '3. Chia sẻ dữ liệu' },
  { id: 'cookie',       label: '4. Cookie & Tracking' },
  { id: 'quyen-gdpr',   label: '5. Quyền GDPR của bạn' },
  { id: 'bao-mat',      label: '6. Bảo mật dữ liệu' },
  { id: 'luu-tru',      label: '7. Lưu trữ dữ liệu' },
  { id: 'tre-em',       label: '8. Trẻ em (dưới 16 tuổi)' },
  { id: 'thay-doi',     label: '9. Thay đổi chính sách' },
  { id: 'lien-he-dpo',  label: '10. Liên hệ DPO' },
] as const;

// ── Reusable sub-components ───────────────────────────────────────────────────
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

function Paragraph({ children }: { children: React.ReactNode }) {
  return <p className="text-slate-600 leading-relaxed mb-4">{children}</p>;
}

function InfoCard({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200 mb-4">
      <span className="text-2xl flex-shrink-0">{icon}</span>
      <div>
        <p className="font-semibold text-slate-800 mb-1">{title}</p>
        <p className="text-slate-600 text-sm leading-relaxed">{children}</p>
      </div>
    </div>
  );
}

function RightCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-xl border border-blue-100 bg-blue-50 mb-3">
      <span className="text-xl">{icon}</span>
      <div>
        <p className="font-semibold text-blue-900 text-sm">{title}</p>
        <p className="text-blue-700 text-xs mt-0.5 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="list-none space-y-2 mb-4">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2 text-slate-600 text-sm">
          <span className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-500 flex-shrink-0" />
          {item}
        </li>
      ))}
    </ul>
  );
}

// ── Main page component ───────────────────────────────────────────────────────
export default function PrivacyPage() {
  const [activeSection, setActiveSection] = useState<string>(sections[0].id);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Highlight sidebar item on scroll
  useEffect(() => {
    const targets = sections.map(s => document.getElementById(s.id)).filter(Boolean) as HTMLElement[];

    observerRef.current = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-20% 0px -70% 0px' },
    );

    targets.forEach(el => observerRef.current?.observe(el));
    return () => observerRef.current?.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar />

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 text-white py-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          {/* GDPR Badge */}
          <span className="inline-flex items-center gap-2 bg-white/20 backdrop-blur border border-white/30 text-white text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            GDPR Compliant
          </span>

          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">
            Chính Sách Bảo Mật
          </h1>
          <p className="text-blue-100 text-lg md:text-xl max-w-2xl mx-auto mb-8 leading-relaxed">
            NexLumina cam kết bảo vệ quyền riêng tư của bạn. Tài liệu này mô tả cách chúng tôi thu thập,
            sử dụng và bảo vệ thông tin cá nhân của bạn.
          </p>

          {/* Meta strip */}
          <div className="flex flex-wrap justify-center gap-6 text-sm text-blue-200">
            <span className="flex items-center gap-1.5">
              <span>📅</span>
              <span>Cập nhật: <strong className="text-white">21 tháng 4, 2025</strong></span>
            </span>
            <span className="flex items-center gap-1.5">
              <span>🌍</span>
              <span>Phiên bản: <strong className="text-white">Tiếng Việt / GDPR v2.1</strong></span>
            </span>
            <span className="flex items-center gap-1.5">
              <span>⚖️</span>
              <span>Tuân thủ: <strong className="text-white">GDPR · PDPD Việt Nam</strong></span>
            </span>
          </div>
        </div>
      </section>

      {/* ── Body: sidebar + content ─────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 flex flex-col lg:flex-row gap-10">

        {/* ── Sidebar ────────────────────────────────────────────────────────── */}
        <aside className="lg:w-64 flex-shrink-0">
          <div className="sticky top-6 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-200 px-5 py-3">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Nội dung</p>
            </div>
            <nav className="py-2">
              {sections.map(s => (
                <button
                  key={s.id}
                  onClick={() => scrollTo(s.id)}
                  className={[
                    'w-full text-left px-5 py-2.5 text-sm transition-colors duration-150',
                    activeSection === s.id
                      ? 'bg-blue-50 text-blue-700 font-semibold border-r-2 border-blue-600'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                  ].join(' ')}
                >
                  {s.label}
                </button>
              ))}
            </nav>
            {/* DPO contact mini-card */}
            <div className="mx-4 mb-4 mt-2 bg-blue-600 text-white rounded-xl p-4 text-center">
              <p className="text-xs font-semibold mb-1">Cần hỗ trợ?</p>
              <p className="text-xs text-blue-200 mb-2">Liên hệ DPO của chúng tôi</p>
              <a
                href="mailto:dpo@nexlumina.com"
                className="inline-block bg-white text-blue-600 text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
              >
                dpo@nexlumina.com
              </a>
            </div>
          </div>
        </aside>

        {/* ── Main content ───────────────────────────────────────────────────── */}
        <main className="flex-1 min-w-0 space-y-14">

          {/* GDPR trust bar */}
          <div className="flex flex-wrap gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
            {[
              { icon: '🔒', text: 'Mã hóa AES-256' },
              { icon: '🛡️', text: 'Tuân thủ GDPR' },
              { icon: '🏠', text: 'Dữ liệu lưu tại EU / VN' },
              { icon: '✉️', text: 'DPO được chỉ định' },
              { icon: '🔍', text: 'Kiểm toán độc lập hàng năm' },
            ].map(item => (
              <span key={item.text} className="flex items-center gap-1.5 text-emerald-800 text-xs font-medium bg-white border border-emerald-200 rounded-full px-3 py-1">
                <span>{item.icon}</span>
                {item.text}
              </span>
            ))}
          </div>

          {/* ─ 1. Thu thập dữ liệu ─────────────────────────────────────────── */}
          <section>
            <SectionHeading id="thu-thap">1. Thu Thập Dữ Liệu</SectionHeading>
            <Paragraph>
              NexLumina thu thập thông tin cần thiết để cung cấp và cải thiện dịch vụ học trực tuyến.
              Chúng tôi chỉ thu thập dữ liệu có cơ sở pháp lý rõ ràng theo Điều 6 GDPR.
            </Paragraph>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <InfoCard icon="👤" title="Thông tin tài khoản">
                Họ tên, địa chỉ email, ảnh đại diện, số điện thoại (tùy chọn), ngôn ngữ ưa thích.
              </InfoCard>
              <InfoCard icon="🎓" title="Dữ liệu học tập">
                Khóa học đã đăng ký, tiến độ học, điểm số bài kiểm tra, chứng chỉ đã nhận.
              </InfoCard>
              <InfoCard icon="💳" title="Thông tin thanh toán">
                Lịch sử giao dịch, phương thức thanh toán (được mã hóa). Số thẻ KHÔNG được lưu trực tiếp.
              </InfoCard>
              <InfoCard icon="📊" title="Dữ liệu kỹ thuật">
                Địa chỉ IP, loại trình duyệt, hệ điều hành, nhật ký truy cập, số nhận dạng thiết bị.
              </InfoCard>
            </div>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-r-xl p-4">
              <p className="text-yellow-800 text-sm font-semibold mb-1">⚠ Cơ sở pháp lý thu thập</p>
              <BulletList items={[
                'Thực hiện hợp đồng — cung cấp dịch vụ học tập bạn đã đăng ký (Điều 6(1)(b) GDPR).',
                'Lợi ích hợp pháp — phân tích cải thiện nền tảng, phát hiện gian lận (Điều 6(1)(f) GDPR).',
                'Sự đồng ý — gửi bản tin, thông báo khuyến mãi (Điều 6(1)(a) GDPR).',
                'Nghĩa vụ pháp lý — lưu giữ hồ sơ thuế, kế toán theo quy định Việt Nam.',
              ]} />
            </div>
          </section>

          {/* ─ 2. Sử dụng dữ liệu ─────────────────────────────────────────── */}
          <section>
            <SectionHeading id="su-dung">2. Sử Dụng Dữ Liệu</SectionHeading>
            <Paragraph>
              Dữ liệu được thu thập phục vụ các mục đích cụ thể, rõ ràng và hợp pháp. Chúng tôi không xử lý
              dữ liệu theo cách không tương thích với mục đích ban đầu.
            </Paragraph>
            <BulletList items={[
              'Cung cấp, duy trì và nâng cấp nền tảng học NexLumina.',
              'Cá nhân hóa lộ trình học dựa trên tiến độ và sở thích của bạn.',
              'Gửi thông báo quan trọng về tài khoản, khóa học, chứng chỉ.',
              'Xử lý thanh toán và hoàn tiền khi cần thiết.',
              'Phân tích hiệu quả nền tảng, cải thiện trải nghiệm người dùng.',
              'Phát hiện, ngăn chặn gian lận và các hành vi vi phạm điều khoản sử dụng.',
              'Tuân thủ nghĩa vụ pháp lý và phản hồi yêu cầu từ cơ quan có thẩm quyền.',
              'Nghiên cứu và phát triển các tính năng mới (dữ liệu được ẩn danh hóa).',
            ]} />
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
              <p className="font-semibold text-blue-900 mb-2">📢 Thông tin marketing</p>
              <p className="text-blue-700 text-sm leading-relaxed">
                Chúng tôi chỉ gửi email marketing khi có sự đồng ý rõ ràng của bạn. Bạn có thể rút lại
                sự đồng ý bất kỳ lúc nào qua liên kết <strong>Hủy đăng ký</strong> trong email hoặc
                tại <strong>Cài đặt tài khoản → Thông báo</strong>.
              </p>
            </div>
          </section>

          {/* ─ 3. Chia sẻ dữ liệu ─────────────────────────────────────────── */}
          <section>
            <SectionHeading id="chia-se">3. Chia Sẻ Dữ Liệu</SectionHeading>
            <Paragraph>
              NexLumina không bán dữ liệu cá nhân của bạn. Chúng tôi có thể chia sẻ thông tin trong các
              trường hợp hạn chế sau:
            </Paragraph>
            <div className="space-y-3 mb-5">
              {[
                {
                  icon: '🤝',
                  title: 'Đối tác giảng viên',
                  desc: 'Tên và tiến độ học của bạn được chia sẻ với giảng viên khóa học bạn đăng ký nhằm hỗ trợ giảng dạy.',
                },
                {
                  icon: '💼',
                  title: 'Nhà cung cấp dịch vụ',
                  desc: 'Các bên thứ ba xử lý dữ liệu thay mặt chúng tôi (thanh toán, email, lưu trữ đám mây) theo thỏa thuận bảo vệ dữ liệu (DPA).',
                },
                {
                  icon: '⚖️',
                  title: 'Yêu cầu pháp lý',
                  desc: 'Khi có lệnh của tòa án hoặc cơ quan nhà nước có thẩm quyền theo quy định pháp luật Việt Nam và EU.',
                },
                {
                  icon: '🏢',
                  title: 'Tái cơ cấu doanh nghiệp',
                  desc: 'Trong trường hợp sáp nhập, mua lại hoặc bán tài sản, người dùng sẽ được thông báo trước.',
                },
              ].map(item => (
                <div key={item.title} className="flex gap-4 p-4 border border-slate-200 rounded-xl hover:border-blue-300 transition-colors">
                  <span className="text-2xl flex-shrink-0">{item.icon}</span>
                  <div>
                    <p className="font-semibold text-slate-800 mb-1">{item.title}</p>
                    <p className="text-slate-600 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-red-800 text-sm font-semibold">🚫 Chúng tôi KHÔNG bao giờ:</p>
              <BulletList items={[
                'Bán dữ liệu cá nhân cho bên thứ ba vì mục đích thương mại.',
                'Chia sẻ thông tin y tế hoặc tài chính mà không có sự đồng ý đặc biệt.',
                'Cho phép bên thứ ba sử dụng dữ liệu của bạn ngoài mục đích đã thỏa thuận.',
              ]} />
            </div>
          </section>

          {/* ─ 4. Cookie & Tracking ────────────────────────────────────────── */}
          <section>
            <SectionHeading id="cookie">4. Cookie & Tracking</SectionHeading>
            <Paragraph>
              NexLumina sử dụng cookie và công nghệ tương tự để vận hành nền tảng, phân tích lưu lượng
              và cải thiện trải nghiệm học tập.
            </Paragraph>
            <div className="overflow-x-auto rounded-xl border border-slate-200 mb-5">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-left border-b border-slate-200">
                    <th className="px-4 py-3 font-semibold text-slate-700">Loại cookie</th>
                    <th className="px-4 py-3 font-semibold text-slate-700">Mục đích</th>
                    <th className="px-4 py-3 font-semibold text-slate-700">Thời hạn</th>
                    <th className="px-4 py-3 font-semibold text-slate-700">Có thể từ chối?</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[
                    ['🔧 Thiết yếu', 'Đăng nhập, giỏ hàng, bảo mật CSRF', 'Phiên / 30 ngày', '❌ Không'],
                    ['📊 Phân tích', 'Google Analytics — đo lượng truy cập', '2 năm', '✅ Có'],
                    ['🎯 Marketing', 'Google Ads, Meta Pixel — quảng cáo tùy chỉnh', '1 năm', '✅ Có'],
                    ['⚙️ Chức năng', 'Nhớ ngôn ngữ, theme, vị trí học', '1 năm', '✅ Có'],
                  ].map(([type, purpose, duration, opt], i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-800">{type}</td>
                      <td className="px-4 py-3 text-slate-600">{purpose}</td>
                      <td className="px-4 py-3 text-slate-600">{duration}</td>
                      <td className="px-4 py-3">{opt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm py-3 px-5 rounded-xl transition-colors">
                ⚙️ Quản lý tùy chọn cookie
              </button>
              <button className="flex-1 border border-slate-300 hover:border-slate-400 text-slate-700 font-semibold text-sm py-3 px-5 rounded-xl transition-colors">
                📄 Xem Chính sách Cookie đầy đủ
              </button>
            </div>
          </section>

          {/* ─ 5. Quyền GDPR ───────────────────────────────────────────────── */}
          <section>
            <SectionHeading id="quyen-gdpr">5. Quyền GDPR Của Bạn</SectionHeading>
            <Paragraph>
              Theo GDPR và Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân của Việt Nam, bạn có các
              quyền sau đối với dữ liệu của mình:
            </Paragraph>
            <div className="grid md:grid-cols-2 gap-3 mb-6">
              <RightCard
                icon="👁️"
                title="Quyền Truy Cập (Điều 15 GDPR)"
                description="Yêu cầu bản sao toàn bộ dữ liệu cá nhân chúng tôi đang lưu trữ về bạn. Phản hồi trong vòng 30 ngày, miễn phí."
              />
              <RightCard
                icon="🗑️"
                title="Quyền Xóa — 'Quyền được quên' (Điều 17)"
                description="Yêu cầu xóa dữ liệu cá nhân khi không còn cần thiết hoặc rút sự đồng ý. Một số dữ liệu có thể được giữ lại theo nghĩa vụ pháp lý."
              />
              <RightCard
                icon="✏️"
                title="Quyền Chỉnh Sửa (Điều 16)"
                description="Yêu cầu sửa thông tin cá nhân không chính xác hoặc không đầy đủ. Bạn cũng có thể tự cập nhật trong Cài đặt tài khoản."
              />
              <RightCard
                icon="📦"
                title="Quyền Di Chuyển Dữ Liệu (Điều 20)"
                description="Nhận dữ liệu của bạn ở định dạng có cấu trúc (JSON/CSV) để chuyển sang nền tảng khác."
              />
              <RightCard
                icon="🚫"
                title="Quyền Phản Đối (Điều 21)"
                description="Phản đối việc xử lý dữ liệu dựa trên lợi ích hợp pháp hoặc phục vụ mục đích tiếp thị trực tiếp."
              />
              <RightCard
                icon="⏸️"
                title="Quyền Hạn Chế Xử Lý (Điều 18)"
                description="Yêu cầu tạm dừng xử lý dữ liệu trong khi tranh chấp về tính chính xác hoặc tính hợp pháp đang được giải quyết."
              />
            </div>
            <div className="bg-slate-800 text-white rounded-2xl p-6">
              <p className="font-bold text-lg mb-2">📬 Cách thực hiện quyền của bạn</p>
              <p className="text-slate-300 text-sm mb-4 leading-relaxed">
                Gửi yêu cầu bằng văn bản đến DPO qua email hoặc cổng thông tin tự phục vụ.
                Chúng tôi sẽ xác minh danh tính và phản hồi trong <strong className="text-white">30 ngày</strong>.
                Yêu cầu quá mức có thể tính phí hành chính hợp lý.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href="mailto:dpo@nexlumina.com?subject=GDPR Request"
                  className="flex-1 text-center bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm py-2.5 px-4 rounded-lg transition-colors"
                >
                  ✉️ Email DPO
                </a>
                <a
                  href="/privacy"
                  className="flex-1 text-center bg-white/10 hover:bg-white/20 text-white font-semibold text-sm py-2.5 px-4 rounded-lg transition-colors"
                >
                  🖥️ Cổng tự phục vụ
                </a>
              </div>
            </div>
          </section>

          {/* ─ 6. Bảo mật dữ liệu ─────────────────────────────────────────── */}
          <section>
            <SectionHeading id="bao-mat">6. Bảo Mật Dữ Liệu</SectionHeading>
            <Paragraph>
              Chúng tôi áp dụng các biện pháp kỹ thuật và tổ chức phù hợp theo Điều 32 GDPR để bảo vệ
              dữ liệu cá nhân khỏi truy cập trái phép, mất mát hoặc tiết lộ.
            </Paragraph>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
              {[
                { icon: '🔐', title: 'Mã hóa dữ liệu', desc: 'AES-256 lúc lưu trữ, TLS 1.3 khi truyền tải.' },
                { icon: '🏰', title: 'Kiểm soát truy cập', desc: 'Nguyên tắc đặc quyền tối thiểu, MFA cho nhân viên.' },
                { icon: '📡', title: 'Giám sát 24/7', desc: 'SIEM, phát hiện xâm nhập và cảnh báo thời gian thực.' },
                { icon: '🧪', title: 'Kiểm tra bảo mật', desc: 'Pentest hàng năm, bug bounty program.' },
                { icon: '💾', title: 'Sao lưu dự phòng', desc: 'Backup tự động hàng ngày, lưu trữ địa lý phân tán.' },
                { icon: '📋', title: 'Đào tạo nhân viên', desc: 'Tập huấn GDPR định kỳ cho toàn bộ nhân sự.' },
              ].map(item => (
                <div key={item.title} className="p-4 border border-slate-200 rounded-xl hover:shadow-md transition-shadow">
                  <span className="text-2xl mb-2 block">{item.icon}</span>
                  <p className="font-semibold text-slate-800 text-sm mb-1">{item.title}</p>
                  <p className="text-slate-500 text-xs leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
              <p className="font-semibold text-orange-800 mb-2">🚨 Thông báo vi phạm dữ liệu</p>
              <p className="text-orange-700 text-sm leading-relaxed">
                Trong trường hợp vi phạm dữ liệu nghiêm trọng, chúng tôi cam kết thông báo cho cơ quan
                giám sát có thẩm quyền trong vòng <strong>72 giờ</strong> và thông báo đến người dùng bị
                ảnh hưởng trong <strong>7 ngày làm việc</strong> theo quy định Điều 33-34 GDPR.
              </p>
            </div>
          </section>

          {/* ─ 7. Lưu trữ dữ liệu ─────────────────────────────────────────── */}
          <section>
            <SectionHeading id="luu-tru">7. Lưu Trữ Dữ Liệu</SectionHeading>
            <Paragraph>
              Chúng tôi chỉ lưu trữ dữ liệu trong thời gian cần thiết cho mục đích ban đầu hoặc theo
              yêu cầu pháp lý (nguyên tắc giảm thiểu lưu trữ — Điều 5(1)(e) GDPR).
            </Paragraph>
            <div className="overflow-x-auto rounded-xl border border-slate-200 mb-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-left">
                    <th className="px-4 py-3 font-semibold text-slate-700">Loại dữ liệu</th>
                    <th className="px-4 py-3 font-semibold text-slate-700">Thời gian lưu</th>
                    <th className="px-4 py-3 font-semibold text-slate-700">Lý do</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[
                    ['Dữ liệu tài khoản', '5 năm sau khi xóa tài khoản', 'Nghĩa vụ pháp lý, giải quyết tranh chấp'],
                    ['Nhật ký truy cập', '12 tháng', 'Bảo mật, phát hiện gian lận'],
                    ['Dữ liệu thanh toán', '10 năm', 'Quy định kế toán, thuế Việt Nam'],
                    ['Chứng chỉ hoàn thành', 'Vô thời hạn', 'Xác minh bằng cấp cho người học'],
                    ['Cookie phân tích', '2 năm', 'Phân tích xu hướng sử dụng'],
                    ['Email marketing', 'Đến khi hủy đăng ký', 'Dựa trên sự đồng ý'],
                  ].map(([type, duration, reason], i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-800">{type}</td>
                      <td className="px-4 py-3 text-blue-700 font-medium">{duration}</td>
                      <td className="px-4 py-3 text-slate-600">{reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Paragraph>
              Dữ liệu được lưu trữ tại các máy chủ đặt tại <strong>Liên minh châu Âu (Frankfurt, Đức)</strong>{' '}
              và <strong>Việt Nam (TP. Hồ Chí Minh)</strong>. Chuyển dữ liệu quốc tế được thực hiện theo
              Điều khoản Hợp đồng Chuẩn (SCCs) của EU.
            </Paragraph>
          </section>

          {/* ─ 8. Trẻ em ───────────────────────────────────────────────────── */}
          <section>
            <SectionHeading id="tre-em">8. Trẻ Em (Dưới 16 Tuổi)</SectionHeading>
            <div className="bg-purple-50 border border-purple-200 rounded-2xl p-6 mb-5">
              <div className="flex items-start gap-4">
                <span className="text-4xl flex-shrink-0">👶</span>
                <div>
                  <p className="font-bold text-purple-900 text-lg mb-2">
                    Dịch vụ NexLumina yêu cầu người dùng từ đủ 16 tuổi trở lên.
                  </p>
                  <p className="text-purple-700 text-sm leading-relaxed">
                    Theo Điều 8 GDPR và Nghị định 13/2023 của Việt Nam, chúng tôi không cố ý thu thập
                    dữ liệu cá nhân của trẻ em dưới 16 tuổi mà không có sự đồng ý có thể xác minh từ
                    cha/mẹ hoặc người giám hộ hợp pháp.
                  </p>
                </div>
              </div>
            </div>
            <BulletList items={[
              'Quá trình đăng ký yêu cầu xác nhận tuổi. Người dùng khai báo sai tuổi chịu trách nhiệm theo quy định pháp luật.',
              'Nếu chúng tôi phát hiện tài khoản của người dùng dưới 16 tuổi, tài khoản sẽ bị tạm khóa và thông báo đến người giám hộ.',
              'Đối với chương trình học dành cho học sinh (<16 tuổi), nhà trường hoặc phụ huynh phải ký thỏa thuận xử lý dữ liệu riêng.',
              'Chúng tôi cung cấp công cụ quản lý tài khoản cho phụ huynh theo dõi và kiểm soát dữ liệu của trẻ.',
              'Phụ huynh có thể yêu cầu xóa toàn bộ dữ liệu của con tại địa chỉ: dpo@nexlumina.com.',
            ]} />
          </section>

          {/* ─ 9. Thay đổi chính sách ──────────────────────────────────────── */}
          <section>
            <SectionHeading id="thay-doi">9. Thay Đổi Chính Sách</SectionHeading>
            <Paragraph>
              NexLumina có thể cập nhật Chính sách Bảo mật này để phản ánh thay đổi trong hoạt động
              kinh doanh, yêu cầu pháp lý hoặc cải tiến thực hành bảo mật.
            </Paragraph>
            <div className="space-y-3 mb-5">
              {[
                {
                  type: 'Thay đổi không đáng kể',
                  color: 'bg-slate-50 border-slate-200',
                  textColor: 'text-slate-700',
                  desc: 'Sửa lỗi chính tả, làm rõ ngôn từ — cập nhật ngay, không cần thông báo.',
                },
                {
                  type: 'Thay đổi quan trọng',
                  color: 'bg-yellow-50 border-yellow-200',
                  textColor: 'text-yellow-800',
                  desc: 'Thay đổi ảnh hưởng đến quyền lợi — thông báo qua email ít nhất 30 ngày trước.',
                },
                {
                  type: 'Thay đổi yêu cầu đồng ý',
                  color: 'bg-red-50 border-red-200',
                  textColor: 'text-red-800',
                  desc: 'Thay đổi mục đích xử lý dữ liệu — yêu cầu sự đồng ý mới từ người dùng.',
                },
              ].map(item => (
                <div key={item.type} className={`p-4 rounded-xl border ${item.color}`}>
                  <p className={`font-semibold text-sm mb-1 ${item.textColor}`}>{item.type}</p>
                  <p className={`text-sm ${item.textColor} opacity-80`}>{item.desc}</p>
                </div>
              ))}
            </div>
            <div className="bg-slate-100 rounded-xl p-4">
              <p className="text-slate-700 text-sm font-semibold mb-2">📜 Lịch sử phiên bản</p>
              <div className="space-y-1.5">
                {[
                  { date: '21/04/2025', version: 'v2.1', note: 'Bổ sung điều khoản PDPD Việt Nam, cập nhật SCCs.' },
                  { date: '01/01/2024', version: 'v2.0', note: 'Cập nhật GDPR 2023, thêm quyền di chuyển dữ liệu.' },
                  { date: '15/05/2022', version: 'v1.0', note: 'Phiên bản đầu tiên.' },
                ].map(item => (
                  <div key={item.version} className="flex items-baseline gap-3 text-sm">
                    <span className="text-slate-500 text-xs w-20 flex-shrink-0">{item.date}</span>
                    <span className="bg-blue-100 text-blue-700 text-xs font-mono px-2 py-0.5 rounded">{item.version}</span>
                    <span className="text-slate-600">{item.note}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ─ 10. Liên hệ DPO ─────────────────────────────────────────────── */}
          <section>
            <SectionHeading id="lien-he-dpo">10. Liên Hệ DPO</SectionHeading>
            <Paragraph>
              NexLumina đã chỉ định Cán bộ Bảo vệ Dữ liệu (DPO — Data Protection Officer) theo Điều
              37-39 GDPR để giám sát việc tuân thủ và tiếp nhận yêu cầu từ người dùng.
            </Paragraph>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              {/* DPO card */}
              <div className="border border-slate-200 rounded-2xl p-6">
                <div className="flex items-center gap-4 mb-5">
                  <div className="h-14 w-14 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl flex-shrink-0">
                    🛡️
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">Nguyễn Minh Quân</p>
                    <p className="text-slate-500 text-sm">Data Protection Officer</p>
                    <p className="text-slate-500 text-xs">CIPP/E Certified · IAPP Member</p>
                  </div>
                </div>
                <div className="space-y-3 text-sm">
                  {[
                    { icon: '✉️', label: 'Email', value: 'dpo@nexlumina.com', href: 'mailto:dpo@nexlumina.com' },
                    { icon: '📞', label: 'Điện thoại', value: '+84 28 3821 9900', href: 'tel:+84283821990' },
                    { icon: '📍', label: 'Địa chỉ', value: '123 Nguyễn Huệ, Q.1, TP.HCM', href: null },
                    { icon: '⏰', label: 'Giờ làm việc', value: 'T2 – T6, 09:00–17:00 ICT', href: null },
                  ].map(item => (
                    <div key={item.label} className="flex items-start gap-3">
                      <span>{item.icon}</span>
                      <div>
                        <span className="text-slate-500">{item.label}: </span>
                        {item.href ? (
                          <a href={item.href} className="text-blue-600 hover:underline font-medium">{item.value}</a>
                        ) : (
                          <span className="text-slate-800">{item.value}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SA / Complaint */}
              <div className="border border-slate-200 rounded-2xl p-6 flex flex-col">
                <p className="font-semibold text-slate-800 mb-3">⚖️ Khiếu nại lên cơ quan giám sát</p>
                <p className="text-slate-600 text-sm leading-relaxed mb-4">
                  Nếu bạn không hài lòng với cách chúng tôi xử lý khiếu nại, bạn có quyền gửi khiếu
                  nại đến cơ quan giám sát bảo vệ dữ liệu có thẩm quyền:
                </p>
                <div className="space-y-3 text-sm flex-1">
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <p className="font-semibold text-slate-700">🇻🇳 Việt Nam</p>
                    <p className="text-slate-600 text-xs mt-0.5">Bộ Công an — Cục An ninh mạng và PCTP sử dụng CNTT</p>
                    <a href="https://bocongan.gov.vn" className="text-blue-600 text-xs hover:underline">bocongan.gov.vn</a>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <p className="font-semibold text-slate-700">🇪🇺 EU (nếu bạn ở EU)</p>
                    <p className="text-slate-600 text-xs mt-0.5">Cơ quan DPA tại quốc gia thành viên EU nơi bạn cư trú</p>
                    <a href="https://edpb.europa.eu" className="text-blue-600 text-xs hover:underline">edpb.europa.eu</a>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl p-8 text-center">
              <p className="text-2xl font-bold mb-2">Có câu hỏi về quyền riêng tư?</p>
              <p className="text-blue-100 mb-6 max-w-lg mx-auto text-sm">
                Đội ngũ DPO của chúng tôi luôn sẵn sàng hỗ trợ bạn. Thời gian phản hồi tối đa 3 ngày
                làm việc đối với yêu cầu thông thường.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-3">
                <a
                  href="mailto:dpo@nexlumina.com"
                  className="bg-white text-blue-600 font-bold px-6 py-3 rounded-xl hover:bg-blue-50 transition-colors text-sm"
                >
                  ✉️ Liên hệ DPO ngay
                </a>
                <a
                  href="/privacy"
                  className="bg-white/20 hover:bg-white/30 text-white font-bold px-6 py-3 rounded-xl transition-colors text-sm border border-white/30"
                >
                  🖥️ Quản lý dữ liệu của tôi
                </a>
              </div>
            </div>
          </section>

          {/* Footer note */}
          <p className="text-center text-slate-400 text-xs pb-8 border-t border-slate-100 pt-6">
            © {new Date().getFullYear()} NexLumina Ltd. · Chính sách Bảo mật v2.1 · Cập nhật 21/04/2025
            · Tuân thủ GDPR 2016/679 & Nghị định 13/2023/NĐ-CP
          </p>
        </main>
      </div>
    </div>
  );
}
