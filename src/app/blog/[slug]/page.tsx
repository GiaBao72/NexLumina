import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookOpen, Clock, ArrowLeft, Tag } from "lucide-react";

// Dữ liệu tĩnh — sau này có thể thay bằng CMS/DB
const POSTS = [
  {
    slug: "lo-trinh-hoc-lap-trinh-tu-zero",
    category: "Lập trình",
    tag: "Hướng dẫn",
    title: "Lộ trình học lập trình từ zero: Bắt đầu từ đâu?",
    excerpt: "Bạn chưa biết gì về lập trình và muốn bắt đầu? Bài viết này tổng hợp lộ trình thực chiến từ HTML/CSS đến Full-Stack theo thứ tự tối ưu nhất.",
    author: "Minh Khoa",
    date: "15 Tháng 4, 2026",
    readTime: "8 phút",
    cover: "bg-gradient-to-br from-teal-500 to-cyan-400",
    content: `
## Tại sao cần lộ trình?

Bắt đầu học lập trình mà không có lộ trình rõ ràng giống như đi rừng không có bản đồ — bạn sẽ lãng phí rất nhiều thời gian học những thứ không cần thiết hoặc bỏ qua nền tảng quan trọng.

## Lộ trình đề xuất

### Bước 1: HTML & CSS (2–4 tuần)
Đây là nền tảng của web. Học cách tạo cấu trúc trang (HTML) và làm đẹp nó (CSS). Đừng bỏ qua Flexbox và Grid — chúng là công cụ layout quan trọng nhất hiện nay.

### Bước 2: JavaScript cơ bản (4–8 tuần)
JavaScript là ngôn ngữ của web. Tập trung vào: biến, vòng lặp, hàm, DOM manipulation, và fetch API. Đừng học jQuery — nó đã lỗi thời.

### Bước 3: Một framework front-end (6–10 tuần)
React là lựa chọn tốt nhất hiện tại về thị trường việc làm. Vue cũng tốt nếu bạn muốn học curve nhẹ hơn.

### Bước 4: Back-end cơ bản (4–6 tuần)
Node.js + Express hoặc Python + FastAPI. Học cách tạo REST API, kết nối database.

### Bước 5: Database (2–4 tuần)
PostgreSQL hoặc MySQL cho SQL. MongoDB nếu muốn NoSQL. Học cơ bản về JOIN, INDEX, và query optimization.

## Lời khuyên thực tế

- **Build project thật** ngay từ bước 2 — đừng chỉ làm theo tutorial
- **Dành 70% thời gian để code**, 30% để đọc/xem
- **Stack Overflow và docs chính thức** là bạn tốt nhất của bạn
- **Đừng học quá nhiều thứ cùng lúc** — focus từng bước
    `,
  },
  {
    slug: "ui-ux-design-cho-nguoi-moi",
    category: "Thiết kế",
    tag: "Mới bắt đầu",
    title: "UI/UX Design cho người mới: Figma hay Adobe XD?",
    excerpt: "So sánh chi tiết hai công cụ thiết kế hàng đầu hiện nay, cùng lời khuyên thực tế để bạn chọn đúng công cụ phù hợp với mục tiêu nghề nghiệp.",
    author: "Thu Hà",
    date: "10 Tháng 4, 2026",
    readTime: "6 phút",
    cover: "bg-gradient-to-br from-purple-500 to-pink-400",
    content: `
## Figma vs Adobe XD — Cuộc chiến công cụ thiết kế

Năm 2024, câu hỏi này vẫn còn được hỏi nhiều. Nhưng câu trả lời ngày càng rõ ràng hơn.

## Tại sao Figma thắng?

### Collaboration thời gian thực
Figma cho phép nhiều người cùng làm việc trên một file — như Google Docs của thiết kế. Adobe XD có tính năng này nhưng kém mượt hơn.

### Community và plugins
Figma Community là kho tài nguyên khổng lồ — icon sets, UI kits, templates, plugins. Adobe XD kém xa ở điểm này.

### Cross-platform
Figma chạy trên browser — không cần cài đặt, dùng được trên Mac, Windows, Linux, Chromebook.

### Pricing
Figma miễn phí cho cá nhân với 3 dự án. Adobe XD cần Creative Cloud subscription.

## Khi nào dùng Adobe XD?

- Bạn đã quen với hệ sinh thái Adobe (Photoshop, Illustrator)
- Công ty bạn đang dùng Adobe CC
- Cần tích hợp chặt với After Effects cho animation

## Kết luận

**Người mới bắt đầu: chọn Figma.** Cộng đồng lớn hơn, miễn phí, dễ học theo tutorial trên YouTube. Adobe XD vẫn tốt nhưng đang mất thị phần nhanh.
    `,
  },
  {
    slug: "data-analyst-2026",
    category: "Dữ liệu",
    tag: "Xu hướng",
    title: "Data Analyst 2026: Kỹ năng nào đang được tuyển dụng nhiều nhất?",
    excerpt: "Phân tích hơn 500 tin tuyển dụng Data Analyst tại Việt Nam, tổng hợp những kỹ năng, công cụ và mức lương thực tế bạn cần biết trước khi apply.",
    author: "Quốc Bảo",
    date: "5 Tháng 4, 2026",
    readTime: "10 phút",
    cover: "bg-gradient-to-br from-orange-400 to-amber-400",
    content: `
## Phân tích thị trường tuyển dụng Data Analyst 2026

Sau khi phân tích hơn 500 tin tuyển dụng từ TopCV, LinkedIn, và ITviec, đây là những gì chúng tôi tìm thấy.

## Top kỹ năng được yêu cầu

### 1. SQL (95% tin tuyển dụng)
SQL vẫn là kỹ năng số một. Không có SQL thì gần như không apply được. Tập trung vào: JOIN, subquery, window functions, và query optimization.

### 2. Excel/Google Sheets (88%)
Vẫn phổ biến ở SME. Cần thành thạo: VLOOKUP/XLOOKUP, Pivot Table, Power Query, và basic VBA.

### 3. Python (71%)
Pandas, NumPy, Matplotlib, Seaborn. Không cần ML — chỉ cần data wrangling và visualization.

### 4. Power BI hoặc Tableau (65%)
Power BI phổ biến hơn ở Việt Nam vì giá rẻ hơn. Tableau nhiều hơn ở công ty nước ngoài.

### 5. Statistics cơ bản (58%)
A/B testing, hypothesis testing, regression basics. Không cần PhD, chỉ cần hiểu và apply được.

## Mức lương thực tế

- **Fresher (0–1 năm)**: 8–15 triệu/tháng
- **Junior (1–3 năm)**: 15–30 triệu/tháng
- **Senior (3+ năm)**: 30–60 triệu/tháng
- **Lead/Manager**: 60–100+ triệu/tháng

## Lời khuyên

Build portfolio với 3–5 project thật: phân tích dữ liệu thật (Kaggle, government open data), visualize kết quả, đăng lên GitHub và LinkedIn.
    `,
  },
  {
    slug: "hoc-tieng-anh-thuong-mai-hieu-qua",
    category: "Ngoại ngữ",
    tag: "Kinh nghiệm",
    title: "Học tiếng Anh thương mại hiệu quả trong 3 tháng",
    excerpt: "Phương pháp học tiếng Anh B2 Business theo chu trình nghe–nói–đọc–viết, áp dụng được ngay từ tuần đầu tiên dù bạn bận rộn đến đâu.",
    author: "Lan Anh",
    date: "28 Tháng 3, 2026",
    readTime: "7 phút",
    cover: "bg-gradient-to-br from-green-500 to-emerald-400",
    content: `
## Tại sao tiếng Anh thương mại khác tiếng Anh thông thường?

Business English tập trung vào ngữ cảnh công việc: email, họp hành, thuyết trình, đàm phán. Bạn không cần vocabulary về thiên nhiên hay lịch sử — bạn cần biết cách viết proposal, phản hồi client, và present số liệu.

## Lộ trình 3 tháng

### Tháng 1: Foundation
- **Tuần 1–2**: Grammar review — tenses, conditionals, passive voice
- **Tuần 3–4**: Business vocabulary cơ bản — meetings, emails, presentations

### Tháng 2: Core Skills
- **Nghe**: BBC Business Daily, Harvard Business Review podcast (30 phút/ngày)
- **Đọc**: The Economist, Harvard Business Review (1 bài/ngày)
- **Viết**: Luyện email template — inquiry, proposal, complaint, follow-up

### Tháng 3: Advanced Practice
- **Speaking**: Mock meetings, role-play negotiation scenarios
- **Writing**: Full business report, executive summary
- **Listening**: TED Talks, earnings calls

## Công cụ miễn phí

- **Anki** — flashcard vocab với spaced repetition
- **BBC Learning English** — Business English section
- **Grammarly** — check email trước khi gửi
- **Speechling** — luyện phát âm với native speaker feedback

## Key mindset

Đừng chờ "sẵn sàng" — dùng tiếng Anh ngay từ ngày đầu, dù sai. Sai và sửa nhanh hơn là không dùng bao giờ.
    `,
  },
  {
    slug: "ai-ml-co-ban-cho-dev",
    category: "AI & ML",
    tag: "Kỹ thuật",
    title: "AI/ML cơ bản cho Developer: Không cần toán cao cấp",
    excerpt: "Giải thích trực quan các khái niệm Machine Learning thường gặp dưới góc nhìn của lập trình viên — không cần nền toán chuyên sâu.",
    author: "Trí Dũng",
    date: "20 Tháng 3, 2026",
    readTime: "12 phút",
    cover: "bg-gradient-to-br from-blue-500 to-indigo-400",
    content: `
## ML dưới góc nhìn của Developer

Bạn không cần hiểu đạo hàm của hàm loss để dùng ML hiệu quả — giống như bạn không cần biết cách compiler hoạt động để viết code tốt.

## 5 khái niệm cốt lõi

### 1. Model = Hàm f(input) → output
Một model ML về cơ bản là một hàm: nhận input, trả output. Training = tìm tham số tốt nhất cho hàm đó.

### 2. Supervised vs Unsupervised Learning
- **Supervised**: có label (dữ liệu đã được đánh nhãn) → predict label mới
- **Unsupervised**: không có label → tìm pattern ẩn (clustering, anomaly detection)

### 3. Overfitting và Underfitting
- **Overfitting**: model học thuộc training data, không generalize được → giảm model complexity hoặc thêm data
- **Underfitting**: model quá đơn giản, không capture được pattern → tăng model complexity

### 4. Train/Validation/Test Split
Luôn giữ test set độc lập, không bao giờ train trên nó. Validation set để tune hyperparameters.

### 5. Feature Engineering > Algorithm
Trong 80% trường hợp thực tế, feature tốt quan trọng hơn thuật toán phức tạp.

## Bắt đầu từ đâu?

1. **scikit-learn** — ML library Python chuẩn, API clean, docs tuyệt vời
2. **Kaggle** — dataset thật + competitions + notebooks từ community
3. **fast.ai** — khóa học ML practical, top-down approach

## Dự án đầu tiên nên làm

Titanic survival prediction trên Kaggle — dataset nhỏ, bài toán rõ ràng, cộng đồng hỗ trợ lớn. Sau khi làm xong, bạn sẽ hiểu toàn bộ ML pipeline từ data cleaning đến model evaluation.
    `,
  },
  {
    slug: "ky-nang-mem-cho-it",
    category: "Kỹ năng mềm",
    tag: "Phát triển bản thân",
    title: "5 kỹ năng mềm không thể thiếu để thăng tiến trong IT",
    excerpt: "Technical skill chỉ là nửa chặng đường. Bài viết phân tích kỹ năng giao tiếp, quản lý thời gian, tư duy phản biện và cách rèn luyện chúng trong công việc hàng ngày.",
    author: "Minh Khoa",
    date: "12 Tháng 3, 2026",
    readTime: "5 phút",
    cover: "bg-gradient-to-br from-rose-500 to-pink-400",
    content: `
## Tại sao soft skills quan trọng trong IT?

Nghiên cứu của Google (Project Aristotle) cho thấy team hiệu quả nhất không phải là team có kỹ thuật giỏi nhất — mà là team có psychological safety và communication tốt nhất.

## 5 kỹ năng mềm quan trọng nhất

### 1. Giao tiếp kỹ thuật cho non-tech
Khả năng giải thích vấn đề kỹ thuật phức tạp bằng ngôn ngữ đơn giản cho manager, client, stakeholder. Luyện bằng: viết blog, dạy lại cho người khác, chuẩn bị báo cáo sprint.

### 2. Quản lý thời gian và ưu tiên công việc
Developer giỏi biết nói "không" với task ít quan trọng. Áp dụng: Eisenhower Matrix (khẩn cấp vs quan trọng), time-boxing, và "eat the frog" (làm task khó nhất trước).

### 3. Tư duy phản biện và problem-solving
Không nhảy vào giải pháp ngay — dành 20% thời gian để hiểu rõ vấn đề. Hỏi "5 Whys" trước khi code. Review solution trước khi implement.

### 4. Làm việc nhóm và code review
Review code của người khác một cách constructive, không personal. Nhận feedback mà không phòng thủ. Pair programming khi gặp vấn đề phức tạp.

### 5. Học liên tục và adaptability
Tech thay đổi nhanh — người thích nghi được sẽ survive. Dành 1 giờ/ngày để đọc, thử công nghệ mới, theo dõi industry trends.

## Cách phát triển

- **Giao tiếp**: viết daily standup bằng văn bản, luyện technical presentation hàng tháng
- **Quản lý thời gian**: dùng Notion hoặc Obsidian để track task và reflection hàng tuần
- **Problem-solving**: tham gia LeetCode, system design discussions, post-mortem sau mỗi incident
    `,
  },
];

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = POSTS.find((p) => p.slug === slug);
  if (!post) return { title: "Không tìm thấy | NexLumina" };
  return {
    title: `${post.title} | Blog NexLumina`,
    description: post.excerpt,
  };
}

export function generateStaticParams() {
  return POSTS.map((p) => ({ slug: p.slug }));
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = POSTS.find((p) => p.slug === slug);
  if (!post) notFound();

  // Related posts (same category, exclude current)
  const related = POSTS.filter((p) => p.category === post.category && p.slug !== slug).slice(0, 2);

  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <div className={`${post.cover} py-16 px-4`}>
        <div className="mx-auto max-w-3xl text-white">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-sm text-white/80 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Quay lại Blog
          </Link>
          <div className="flex items-center gap-2 mb-4">
            <span className="rounded-full bg-white/20 text-white text-xs font-semibold px-3 py-1 flex items-center gap-1">
              <Tag className="h-3 w-3" /> {post.tag}
            </span>
            <span className="text-white/70 text-xs flex items-center gap-1">
              <Clock className="h-3 w-3" /> {post.readTime}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight mb-4">{post.title}</h1>
          <p className="text-white/80 text-base">{post.author} · {post.date}</p>
        </div>
      </div>

      {/* Content */}
      <article className="mx-auto max-w-3xl px-4 py-12">
        <div className="prose prose-lg prose-teal max-w-none">
          {post.content.trim().split("\n").map((line, i) => {
            if (line.startsWith("## ")) return <h2 key={i} className="text-2xl font-bold text-gray-900 mt-8 mb-4">{line.slice(3)}</h2>;
            if (line.startsWith("### ")) return <h3 key={i} className="text-xl font-bold text-gray-800 mt-6 mb-3">{line.slice(4)}</h3>;
            if (line.startsWith("- ")) return <li key={i} className="text-gray-700 ml-4 list-disc mb-1">{line.slice(2)}</li>;
            if (line.startsWith("**") && line.endsWith("**")) return <p key={i} className="font-bold text-gray-900">{line.slice(2, -2)}</p>;
            if (line.trim() === "") return <br key={i} />;
            return <p key={i} className="text-gray-700 leading-relaxed mb-3">{line}</p>;
          })}
        </div>

        {/* CTA */}
        <div className="mt-12 rounded-2xl bg-teal-50 border border-teal-100 p-8 text-center">
          <BookOpen className="h-10 w-10 text-teal-500 mx-auto mb-3" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Muốn học sâu hơn về {post.category}?</h3>
          <p className="text-gray-500 text-sm mb-4">
            Khám phá các khóa học {post.category} chất lượng cao trên NexLumina.
          </p>
          <Link
            href={`/courses?category=${encodeURIComponent(post.category.toLowerCase().replace(/ /g, "-"))}`}
            className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-6 py-3 text-sm font-semibold text-white hover:bg-teal-700 transition-colors"
          >
            Xem khóa học {post.category}
          </Link>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-12">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Bài viết liên quan</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  href={`/blog/${r.slug}`}
                  className="group flex gap-3 rounded-xl border border-gray-100 bg-gray-50 hover:bg-white hover:shadow-sm p-4 transition-all"
                >
                  <div className={`shrink-0 h-14 w-14 rounded-lg ${r.cover} flex items-center justify-center`}>
                    <BookOpen className="h-6 w-6 text-white/70" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-teal-600 font-semibold mb-0.5">{r.category}</p>
                    <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-teal-700 transition-colors">
                      {r.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 pt-8 border-t border-gray-100">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-sm text-teal-600 hover:underline"
          >
            <ArrowLeft className="h-4 w-4" /> Xem tất cả bài viết
          </Link>
        </div>
      </article>
    </main>
  );
}
