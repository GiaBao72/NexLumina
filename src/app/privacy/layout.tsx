import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Chính Sách Bảo Mật | NexLumina',
  description:
    'Tìm hiểu cách NexLumina thu thập, sử dụng và bảo vệ dữ liệu cá nhân của bạn theo tiêu chuẩn GDPR. Cập nhật ngày 21 tháng 4 năm 2025.',
  keywords: ['chính sách bảo mật', 'NexLumina', 'GDPR', 'bảo vệ dữ liệu', 'quyền riêng tư'],
  openGraph: {
    title: 'Chính Sách Bảo Mật | NexLumina',
    description: 'NexLumina cam kết bảo vệ quyền riêng tư và dữ liệu cá nhân của người dùng theo chuẩn GDPR.',
    type: 'website',
    url: 'https://nexlumina.com/privacy',
    siteName: 'NexLumina',
  },
  robots: { index: true, follow: true },
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
