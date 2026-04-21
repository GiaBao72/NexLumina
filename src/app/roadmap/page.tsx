'use client';

import { useState } from 'react';
import Link from 'next/link';

// ── Types ─────────────────────────────────────────────────────────────────────
type Level = 'beginner' | 'intermediate' | 'advanced';
type Category = 'all' | 'dev' | 'design' | 'data' | 'business' | 'language';

interface Course {
  title: string;
  duration: string;
  slug: string;
}

interface RoadmapPath {
  id: string;
  category: Category;
  icon: string;
  title: string;
  subtitle: string;
  color: { bg: string; border: string; badge: string; badgeText: string; accent: string };
  level: Level;
  totalDuration: string;
  totalCourses: number;
  outcome: string;
  skills: string[];
  phases: { phase: string; title: string; courses: Course[] }[];
  popular?: boolean;
}

// ── Data ──────────────────────────────────────────────────────────────────────
const roadmaps: RoadmapPath[] = [
  {
    id: 'fullstack-web',
    category: 'dev',
    icon: '💻',
    title: 'Full-Stack Web Developer',
    subtitle: 'Từ zero đến sản phẩm thực tế với React + Node.js',
    color: { bg: 'bg-blue-50', border: 'border-blue-200', badge: 'bg-blue-100', badgeText: 'text-blue-700', accent: 'bg-blue-600' },
    level: 'beginner',
    totalDuration: '6 tháng',
    totalCourses: 8,
    outcome: 'Xây dựng và deploy ứng dụng web full-stack hoàn chỉnh',
    skills: ['HTML/CSS', 'JavaScript', 'React', 'Node.js', 'PostgreSQL', 'Git/GitHub', 'REST API', 'Deploy/CI-CD'],
    popular: true,
    phases: [
      { phase: 'Giai đoạn 1', title: 'Nền tảng Frontend', courses: [
        { title: 'HTML & CSS từ cơ bản đến nâng cao', duration: '15 giờ', slug: 'html-css-co-ban' },
        { title: 'JavaScript ES6+ & DOM Manipulation', duration: '20 giờ', slug: 'javascript-es6' },
      ]},
      { phase: 'Giai đoạn 2', title: 'React & Ecosystem', courses: [
        { title: 'React 18 — Hooks, Context, Performance', duration: '25 giờ', slug: 'react-18-hooks' },
        { title: 'Next.js 14 — SSR, App Router, SEO', duration: '20 giờ', slug: 'nextjs-14' },
      ]},
      { phase: 'Giai đoạn 3', title: 'Backend & Database', courses: [
        { title: 'Node.js & Express — REST API từ A–Z', duration: '22 giờ', slug: 'nodejs-express-api' },
        { title: 'PostgreSQL & Prisma ORM', duration: '15 giờ', slug: 'postgresql-prisma' },
      ]},
      { phase: 'Giai đoạn 4', title: 'Thực chiến & Deploy', courses: [
        { title: 'Authentication, JWT & Security Best Practices', duration: '12 giờ', slug: 'auth-security' },
        { title: 'Deploy: Docker, Vercel, VPS với CI/CD', duration: '10 giờ', slug: 'deploy-docker-vercel' },
      ]},
    ],
  },
  {
    id: 'uiux-designer',
    category: 'design',
    icon: '🎨',
    title: 'UI/UX Designer',
    subtitle: 'Thiết kế sản phẩm số từ wireframe đến prototype thực tế',
    color: { bg: 'bg-purple-50', border: 'border-purple-200', badge: 'bg-purple-100', badgeText: 'text-purple-700', accent: 'bg-purple-600' },
    level: 'beginner',
    totalDuration: '4 tháng',
    totalCourses: 6,
    outcome: 'Thiết kế UI/UX chuyên nghiệp, portfolio sẵn sàng đi xin việc',
    skills: ['Design Thinking', 'Figma', 'User Research', 'Wireframing', 'Prototyping', 'Design System', 'Usability Testing', 'Handoff'],
    phases: [
      { phase: 'Giai đoạn 1', title: 'Tư duy & Nền tảng', courses: [
        { title: 'Design Thinking & UX Research', duration: '12 giờ', slug: 'design-thinking' },
        { title: 'Figma từ cơ bản đến chuyên sâu', duration: '20 giờ', slug: 'figma-co-ban' },
      ]},
      { phase: 'Giai đoạn 2', title: 'UI Design & Design System', courses: [
        { title: 'UI Design Principles — Typography, Color, Layout', duration: '18 giờ', slug: 'ui-principles' },
        { title: 'Xây dựng Design System chuyên nghiệp', duration: '15 giờ', slug: 'design-system' },
      ]},
      { phase: 'Giai đoạn 3', title: 'Thực chiến & Portfolio', courses: [
        { title: 'Prototyping & Usability Testing', duration: '14 giờ', slug: 'prototyping-testing' },
        { title: 'Case Study thực tế & Xây dựng Portfolio', duration: '10 giờ', slug: 'portfolio-ux' },
      ]},
    ],
  },
  {
    id: 'data-analyst',
    category: 'data',
    icon: '📊',
    title: 'Data Analyst',
    subtitle: 'Phân tích dữ liệu chuyên nghiệp với Python, SQL và Power BI',
    color: { bg: 'bg-green-50', border: 'border-green-200', badge: 'bg-green-100', badgeText: 'text-green-700', accent: 'bg-green-600' },
    level: 'beginner',
    totalDuration: '5 tháng',
    totalCourses: 7,
    outcome: 'Phân tích và trực quan hoá dữ liệu để hỗ trợ quyết định kinh doanh',
    skills: ['Python', 'Pandas', 'SQL', 'Power BI', 'Statistics', 'Data Visualization', 'Excel Advanced', 'A/B Testing'],
    phases: [
      { phase: 'Giai đoạn 1', title: 'Nền tảng dữ liệu', courses: [
        { title: 'SQL cho Data Analyst — từ cơ bản đến window function', duration: '18 giờ', slug: 'sql-data-analyst' },
        { title: 'Python cho phân tích dữ liệu: Pandas & NumPy', duration: '22 giờ', slug: 'python-pandas-numpy' },
      ]},
      { phase: 'Giai đoạn 2', title: 'Visualisation & BI', courses: [
        { title: 'Power BI — Dashboard chuyên nghiệp', duration: '20 giờ', slug: 'power-bi-dashboard' },
        { title: 'Data Visualisation với Matplotlib & Seaborn', duration: '14 giờ', slug: 'matplotlib-seaborn' },
      ]},
      { phase: 'Giai đoạn 3', title: 'Thống kê & Thực chiến', courses: [
        { title: 'Statistics for Data Analysis — A/B Testing', duration: '16 giờ', slug: 'statistics-ab-testing' },
        { title: 'Excel nâng cao cho Business Analyst', duration: '10 giờ', slug: 'excel-nang-cao' },
        { title: 'Dự án thực tế: Phân tích dữ liệu bán hàng', duration: '8 giờ', slug: 'du-an-data-analyst' },
      ]},
    ],
  },
  {
    id: 'ai-ml-engineer',
    category: 'data',
    icon: '🤖',
    title: 'AI / ML Engineer',
    subtitle: 'Xây dựng và deploy mô hình AI thực tế từ đầu đến cuối',
    color: { bg: 'bg-yellow-50', border: 'border-yellow-200', badge: 'bg-yellow-100', badgeText: 'text-yellow-700', accent: 'bg-yellow-500' },
    level: 'intermediate',
    totalDuration: '8 tháng',
    totalCourses: 9,
    outcome: 'Xây dựng, huấn luyện và deploy mô hình ML/AI vào sản phẩm thực',
    skills: ['Python', 'TensorFlow/PyTorch', 'Scikit-learn', 'NLP', 'Computer Vision', 'MLOps', 'FastAPI', 'Docker'],
    popular: true,
    phases: [
      { phase: 'Giai đoạn 1', title: 'Python & Math nền tảng', courses: [
        { title: 'Python nâng cao cho ML Engineer', duration: '15 giờ', slug: 'python-ml-nang-cao' },
        { title: 'Toán học cho Machine Learning: Linear Algebra & Calculus', duration: '20 giờ', slug: 'toan-ml' },
      ]},
      { phase: 'Giai đoạn 2', title: 'Classical ML', courses: [
        { title: 'Machine Learning với Scikit-learn', duration: '25 giờ', slug: 'ml-scikit-learn' },
        { title: 'Feature Engineering & Model Evaluation', duration: '15 giờ', slug: 'feature-engineering' },
      ]},
      { phase: 'Giai đoạn 3', title: 'Deep Learning & AI', courses: [
        { title: 'Deep Learning với PyTorch', duration: '30 giờ', slug: 'deep-learning-pytorch' },
        { title: 'NLP & Large Language Models', duration: '25 giờ', slug: 'nlp-llm' },
        { title: 'Computer Vision với YOLO & Transformers', duration: '20 giờ', slug: 'computer-vision' },
      ]},
      { phase: 'Giai đoạn 4', title: 'MLOps & Deploy', courses: [
        { title: 'MLOps: Deploy mô hình với FastAPI & Docker', duration: '18 giờ', slug: 'mlops-fastapi' },
        { title: 'Dự án tốt nghiệp: Xây dựng AI Product', duration: '12 giờ', slug: 'capstone-ai' },
      ]},
    ],
  },
  {
    id: 'digital-marketing',
    category: 'business',
    icon: '📣',
    title: 'Digital Marketing',
    subtitle: 'Chiến lược marketing toàn diện cho thời đại số',
    color: { bg: 'bg-orange-50', border: 'border-orange-200', badge: 'bg-orange-100', badgeText: 'text-orange-700', accent: 'bg-orange-500' },
    level: 'beginner',
    totalDuration: '3 tháng',
    totalCourses: 6,
    outcome: 'Lên kế hoạch và triển khai chiến lược digital marketing hiệu quả',
    skills: ['SEO/SEM', 'Facebook Ads', 'Google Ads', 'Content Marketing', 'Email Marketing', 'Analytics', 'Social Media', 'Copywriting'],
    phases: [
      { phase: 'Giai đoạn 1', title: 'Nền tảng & SEO', courses: [
        { title: 'Digital Marketing Fundamentals', duration: '10 giờ', slug: 'digital-marketing-co-ban' },
        { title: 'SEO từ A–Z: Kỹ thuật & Nội dung', duration: '18 giờ', slug: 'seo-a-z' },
      ]},
      { phase: 'Giai đoạn 2', title: 'Paid Advertising', courses: [
        { title: 'Facebook & Instagram Ads nâng cao', duration: '20 giờ', slug: 'facebook-ads' },
        { title: 'Google Ads — Search, Display, Shopping', duration: '18 giờ', slug: 'google-ads' },
      ]},
      { phase: 'Giai đoạn 3', title: 'Content & Analytics', courses: [
        { title: 'Content Marketing & Copywriting', duration: '15 giờ', slug: 'content-marketing' },
        { title: 'Google Analytics 4 & Data-driven Marketing', duration: '12 giờ', slug: 'ga4-analytics' },
      ]},
    ],
  },
  {
    id: 'english-professional',
    category: 'language',
    icon: '🌐',
    title: 'Business English',
    subtitle: 'Tiếng Anh thương mại cho môi trường quốc tế',
    color: { bg: 'bg-red-50', border: 'border-red-200', badge: 'bg-red-100', badgeText: 'text-red-700', accent: 'bg-red-500' },
    level: 'intermediate',
    totalDuration: '4 tháng',
    totalCourses: 5,
    outcome: 'Giao tiếp tự tin trong môi trường làm việc quốc tế và vượt IELTS 6.5+',
    skills: ['Business Writing', 'Presentation Skills', 'Email Etiquette', 'Meeting & Negotiation', 'IELTS Writing', 'Listening', 'Vocabulary', 'Pronunciation'],
    phases: [
      { phase: 'Giai đoạn 1', title: 'Grammar & Vocabulary', courses: [
        { title: 'Business English Grammar nâng cao', duration: '15 giờ', slug: 'business-english-grammar' },
        { title: 'Business Vocabulary & Idioms thực chiến', duration: '12 giờ', slug: 'business-vocabulary' },
      ]},
      { phase: 'Giai đoạn 2', title: 'Kỹ năng giao tiếp', courses: [
        { title: 'Business Writing: Email, Report, Proposal', duration: '18 giờ', slug: 'business-writing' },
        { title: 'Presentation & Public Speaking Skills', duration: '15 giờ', slug: 'presentation-skills' },
      ]},
      { phase: 'Giai đoạn 3', title: 'IELTS & Thực chiến', courses: [
        { title: 'IELTS Academic 6.5+ — Chiến lược và luyện thi', duration: '20 giờ', slug: 'ielts-65' },
      ]},
    ],
  },
];

// ── Helper ────────────────────────────────────────────────────────────────────
const levelLabel: Record<Level, string> = {
  beginner: 'Người mới bắt đầu',
  intermediate: 'Trung cấp',
  advanced: 'Nâng cao',
};
const levelColor: Record<Level, string> = {
  beginner: 'bg-emerald-100 text-emerald-700',
  intermediate: 'bg-blue-100 text-blue-700',
  advanced: 'bg-purple-100 text-purple-700',
};
const categoryLabel: Record<Category, string> = {
  all: 'Tất cả',
  dev: '💻 Lập trình',
  design: '🎨 Thiết kế',
  data: '📊 Data & AI',
  business: '💼 Kinh doanh',
  language: '🌐 Ngoại ngữ',
};

// ── Main Component ────────────────────────────────────────────────────────────
export default function RoadmapPage() {
  const [activeCategory, setActiveCategory] = useState<Category>('all');
  const [expandedPath, setExpandedPath] = useState<string | null>(null);

  const filtered = activeCategory === 'all'
    ? roadmaps
    : roadmaps.filter((r) => r.category === activeCategory);

  return (
    <div className="min-h-screen bg-white font-sans">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900 text-white py-20 px-6 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative">
          <span className="inline-flex items-center gap-2 bg-teal-500/20 backdrop-blur border border-teal-400/30 text-teal-300 text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
            <span className="h-2 w-2 rounded-full bg-teal-400 animate-pulse" />
            6 lộ trình · 41 khóa học · Được cập nhật liên tục
          </span>

          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">
            Lộ Trình Học Tập
          </h1>
          <p className="text-slate-300 text-lg md:text-xl max-w-2xl mx-auto mb-8 leading-relaxed">
            Chọn lộ trình phù hợp với mục tiêu của bạn. Từng bước có hướng dẫn rõ ràng — không cần
            mày mò tự tìm thứ tự học.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
            {[
              { value: '6', label: 'Lộ trình chuyên sâu' },
              { value: '41+', label: 'Khóa học được chọn lọc' },
              { value: '4–8', label: 'Tháng đến thành thạo' },
              { value: '12k+', label: 'Học viên đã hoàn thành' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/10 backdrop-blur rounded-2xl p-4 text-center">
                <p className="text-2xl font-extrabold text-white">{stat.value}</p>
                <p className="text-slate-400 text-xs mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section className="bg-slate-50 border-b border-slate-200 py-10 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-sm font-semibold text-slate-500 uppercase tracking-widest mb-8">
            Lộ trình học tập hoạt động như thế nào?
          </p>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: '01', icon: '🎯', title: 'Chọn lộ trình', desc: 'Chọn mục tiêu nghề nghiệp phù hợp với bạn' },
              { step: '02', icon: '📚', title: 'Học theo thứ tự', desc: 'Từng khóa học được sắp xếp từ nền tảng đến nâng cao' },
              { step: '03', icon: '🛠️', title: 'Thực hành dự án', desc: 'Áp dụng ngay vào dự án thực tế sau mỗi giai đoạn' },
              { step: '04', icon: '🎓', title: 'Nhận chứng chỉ', desc: 'Chứng chỉ lộ trình được xác nhận bởi doanh nghiệp' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="relative inline-block mb-3">
                  <span className="text-3xl">{item.icon}</span>
                  <span className="absolute -top-1 -right-4 text-xs font-bold text-slate-400">{item.step}</span>
                </div>
                <p className="font-bold text-slate-800 text-sm mb-1">{item.title}</p>
                <p className="text-slate-500 text-xs leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Filter + Grid ─────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">

        {/* Filter tabs */}
        <div className="flex gap-2 flex-wrap mb-10">
          {(Object.keys(categoryLabel) as Category[]).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={[
                'px-4 py-2 rounded-full text-sm font-medium transition-colors duration-150 border',
                activeCategory === cat
                  ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-teal-400 hover:text-teal-700',
              ].join(' ')}
            >
              {categoryLabel[cat]}
            </button>
          ))}
        </div>

        {/* Roadmap cards */}
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map((path) => {
            const isExpanded = expandedPath === path.id;
            return (
              <div
                key={path.id}
                className={`border rounded-2xl overflow-hidden transition-all duration-300 ${path.color.border} ${path.color.bg} hover:shadow-md`}
              >
                {/* Card header */}
                <div className="p-6">
                  {/* Top row: icon + badges */}
                  <div className="flex items-start justify-between mb-4">
                    <span className="text-4xl">{path.icon}</span>
                    <div className="flex flex-col items-end gap-1.5">
                      {path.popular && (
                        <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2.5 py-0.5 rounded-full">
                          🔥 Phổ biến nhất
                        </span>
                      )}
                      <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${levelColor[path.level]}`}>
                        {levelLabel[path.level]}
                      </span>
                    </div>
                  </div>

                  <h2 className="text-lg font-extrabold text-slate-900 mb-1">{path.title}</h2>
                  <p className="text-slate-500 text-sm leading-relaxed mb-4">{path.subtitle}</p>

                  {/* Meta row */}
                  <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
                    <span className="flex items-center gap-1">
                      <span>⏱️</span> {path.totalDuration}
                    </span>
                    <span className="flex items-center gap-1">
                      <span>📚</span> {path.totalCourses} khóa học
                    </span>
                  </div>

                  {/* Outcome */}
                  <div className={`rounded-xl p-3 mb-4 ${path.color.badge}`}>
                    <p className="text-xs font-semibold text-slate-600 mb-0.5">🎯 Kết quả đầu ra</p>
                    <p className={`text-xs leading-relaxed ${path.color.badgeText}`}>{path.outcome}</p>
                  </div>

                  {/* Skills */}
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {path.skills.slice(0, 6).map((skill) => (
                      <span key={skill} className="bg-white border border-slate-200 text-slate-600 text-xs px-2.5 py-1 rounded-lg">
                        {skill}
                      </span>
                    ))}
                    {path.skills.length > 6 && (
                      <span className="bg-white border border-slate-200 text-slate-400 text-xs px-2.5 py-1 rounded-lg">
                        +{path.skills.length - 6}
                      </span>
                    )}
                  </div>

                  {/* CTA buttons */}
                  <div className="flex gap-2">
                    <Link
                      href={`/courses?roadmap=${path.id}`}
                      className={`flex-1 text-center text-sm font-bold py-2.5 rounded-xl text-white transition-opacity hover:opacity-90 ${path.color.accent}`}
                    >
                      Bắt đầu lộ trình
                    </Link>
                    <button
                      onClick={() => setExpandedPath(isExpanded ? null : path.id)}
                      className="px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 text-xs font-medium hover:bg-slate-50 transition-colors"
                    >
                      {isExpanded ? '▲ Ẩn' : '▼ Chi tiết'}
                    </button>
                  </div>
                </div>

                {/* Expandable phases */}
                {isExpanded && (
                  <div className="border-t border-slate-200 bg-white px-6 py-5">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">
                      Lộ trình chi tiết
                    </p>
                    <div className="space-y-4">
                      {path.phases.map((phase, phaseIdx) => (
                        <div key={phaseIdx} className="relative">
                          {/* Phase connector */}
                          {phaseIdx < path.phases.length - 1 && (
                            <div className="absolute left-3.5 top-8 bottom-0 w-0.5 bg-slate-200" />
                          )}
                          <div className="flex items-start gap-3">
                            {/* Phase number */}
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 ${path.color.accent}`}>
                              {phaseIdx + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-slate-400 font-medium">{phase.phase}</p>
                              <p className="font-bold text-slate-800 text-sm mb-2">{phase.title}</p>
                              <div className="space-y-2">
                                {phase.courses.map((course, courseIdx) => (
                                  <Link
                                    key={courseIdx}
                                    href={`/courses/${course.slug}`}
                                    className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl hover:border-teal-300 hover:bg-teal-50/30 transition-colors group"
                                  >
                                    <span className="text-sm text-slate-700 group-hover:text-teal-700 font-medium leading-tight pr-2">
                                      {course.title}
                                    </span>
                                    <span className="text-xs text-slate-400 flex-shrink-0 whitespace-nowrap">
                                      {course.duration}
                                    </span>
                                  </Link>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Bottom CTA */}
                    <div className="mt-5 pt-4 border-t border-slate-100">
                      <Link
                        href={`/courses?roadmap=${path.id}`}
                        className={`block w-full text-center text-sm font-bold py-3 rounded-xl text-white transition-opacity hover:opacity-90 ${path.color.accent}`}
                      >
                        Đăng ký lộ trình — Bắt đầu ngay hôm nay
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ── CTA section ───────────────────────────────────────────────────── */}
        <section className="mt-16 bg-gradient-to-r from-teal-600 to-emerald-600 rounded-3xl p-10 text-white text-center">
          <span className="inline-block bg-white/20 text-white text-xs font-semibold px-4 py-1.5 rounded-full mb-4">
            Không biết chọn lộ trình nào?
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold mb-3">
            Làm bài kiểm tra hướng nghiệp miễn phí
          </h2>
          <p className="text-teal-100 max-w-lg mx-auto mb-6 text-sm leading-relaxed">
            Hệ thống AI của NexLumina sẽ gợi ý lộ trình phù hợp nhất dựa trên nền tảng, mục tiêu
            và thời gian học của bạn — chỉ mất 3 phút.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Link
              href="/courses"
              className="bg-white text-teal-700 font-bold px-8 py-3.5 rounded-xl hover:bg-teal-50 transition-colors text-sm"
            >
              🚀 Bắt đầu học ngay
            </Link>
            <Link
              href="/courses"
              className="bg-white/20 hover:bg-white/30 text-white font-bold px-8 py-3.5 rounded-xl transition-colors text-sm border border-white/30"
            >
              📚 Xem tất cả khóa học
            </Link>
          </div>
        </section>

        {/* ── FAQ mini ──────────────────────────────────────────────────────── */}
        <section className="mt-14">
          <h2 className="text-xl font-bold text-slate-900 mb-6 text-center">Câu hỏi thường gặp</h2>
          <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {[
              {
                q: 'Tôi có cần học đúng thứ tự không?',
                a: 'Thứ tự được khuyến nghị để tối ưu việc học. Tuy nhiên nếu bạn đã có nền tảng, bạn hoàn toàn có thể bỏ qua các khóa đầu và học từ giai đoạn phù hợp.',
              },
              {
                q: 'Lộ trình có cập nhật không?',
                a: 'Có. Đội ngũ NexLumina cập nhật lộ trình theo sự thay đổi của thị trường và công nghệ, thường mỗi 6 tháng một lần.',
              },
              {
                q: 'Mua lộ trình hay mua từng khóa?',
                a: 'Bạn có thể mua lẻ từng khóa hoặc đăng ký Premium để truy cập toàn bộ. Premium tiết kiệm hơn 60% nếu bạn học theo lộ trình đầy đủ.',
              },
              {
                q: 'Chứng chỉ lộ trình có giá trị không?',
                a: 'Chứng chỉ hoàn thành lộ trình NexLumina được nhiều doanh nghiệp công nhận. Bạn có thể chia sẻ lên LinkedIn hoặc đính kèm vào hồ sơ xin việc.',
              },
            ].map((faq, i) => (
              <div key={i} className="border border-slate-200 rounded-2xl p-5">
                <p className="font-bold text-slate-800 text-sm mb-2">{faq.q}</p>
                <p className="text-slate-500 text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
