import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Lộ Trình Học Tập | NexLumina',
  description:
    'Khám phá các lộ trình học tập được thiết kế bởi chuyên gia: Full-Stack, UI/UX, Data Science, AI/ML, Digital Marketing và nhiều hơn nữa.',
  keywords: ['lộ trình học', 'NexLumina', 'learning path', 'roadmap', 'khoá học online'],
  openGraph: {
    title: 'Lộ Trình Học Tập | NexLumina',
    description: 'Chọn lộ trình phù hợp và học đúng thứ tự — từ nền tảng đến thành thạo.',
    type: 'website',
    url: 'https://nexlumina.com/roadmap',
    siteName: 'NexLumina',
  },
  robots: { index: true, follow: true },
};

export default function RoadmapLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
