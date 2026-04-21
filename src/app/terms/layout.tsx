import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Điều Khoản Dịch Vụ | NexLumina',
  description:
    'Điều khoản và điều kiện sử dụng NexLumina — nền tảng học trực tuyến. Tìm hiểu về quyền, nghĩa vụ và chính sách hoàn tiền.',
  keywords: ['điều khoản dịch vụ', 'NexLumina', 'terms of service', 'chính sách hoàn tiền'],
  openGraph: {
    title: 'Điều Khoản Dịch Vụ | NexLumina',
    description: 'Điều khoản và điều kiện sử dụng dịch vụ NexLumina.',
    type: 'website',
    url: 'https://nexlumina.com/terms',
    siteName: 'NexLumina',
  },
  robots: { index: true, follow: true },
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
