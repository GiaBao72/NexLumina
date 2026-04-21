# NexLumina — Project Log

## Thông tin dự án
- **Tên:** NexLumina
- **Loại:** Website bán khóa học trực tuyến
- **Video hosting:** Bunny Stream (bunny.net)
- **Repo:** https://github.com/GiaBao72/NexLumina
- **Path VPS:** /home/tmc/projects/NexLumina
- **Owner:** GiaBao72
- **Bắt đầu:** 2026-04-21

---

## Thiết kế giao diện

### Style
- Premium Modern + Aurora accent
- Cảm hứng: Udemy Pro + Coursera + Linear
- Clean, đáng tin, conversion cao
- WCAG 2.2 AA compliant

### Màu sắc
```
Primary:       #0D9488  (teal)
Secondary:     #2DD4BF
Accent/CTA:    #EA580C  (cam — urgency, mua ngay)
Background:    #F0FDFA
Surface/Card:  #FFFFFF
Text chính:    #134E4A
Text phụ:      #64748B
Border:        #5EEAD4
Destructive:   #DC2626
```

### Typography
- Heading: Plus Jakarta Sans (700–800)
- Body: DM Sans (400–500)
- Mono: JetBrains Mono (giá, code)

### Spacing & Radius
- Spacing: 4/8/12/16/24/32/48/64px
- Border radius: 12px card, 8px button, 999px tag/badge

---

## Cấu trúc trang

| Route | Mô tả |
|-------|-------|
| / | Landing page |
| /courses | Danh sách khóa học + filter |
| /courses/:slug | Chi tiết khóa học + Bunny preview |
| /learn/:courseSlug/:lessonSlug | Trang học — Bunny player + sidebar |
| /dashboard | Dashboard học viên — tiến độ, chứng chỉ |
| /login | Đăng nhập |
| /register | Đăng ký |
| /forgot-password | Quên mật khẩu |
| /admin | Admin panel — khóa học, học viên, đơn hàng |

### Landing page sections
1. Navbar: logo + menu + CTA
2. Hero: headline + subtext + CTA + social proof
3. Stats bar: tổng khóa học, học viên, rating, giảng viên
4. Featured Courses: grid 3 cột, card thumbnail Bunny
5. Categories: icon grid 6–8 danh mục
6. How it works: 3 bước
7. Testimonials: horizontal scroll
8. Pricing / CTA section
9. Footer

---

## Công nghệ sử dụng

### Frontend
- **Next.js 14** (App Router) — SSR/SSG, SEO
- **TypeScript** — type-safe
- **Tailwind CSS** — utility-first styling
- **shadcn/ui** — component library, WCAG AA
- **Framer Motion** — animation

### Video
- **Bunny Stream** — upload, encode, embed player
- Token authentication bảo vệ video đã mua

### Backend / API
- **Next.js API Routes** — tích hợp sẵn
- **Prisma ORM** + **PostgreSQL** (Supabase / Neon)
- **NextAuth.js** — auth (email + Google OAuth)
- **Stripe** — thanh toán quốc tế (hoặc PayOS cho VN)

### Storage & CDN
- **Bunny Storage** — thumbnail, tài liệu
- **Bunny CDN** — phân phối toàn cầu

### Deploy
- **Vercel** (frontend + API) — ưu tiên
- Fallback: VPS hiện tại + PM2 + Nginx

---

## Chuẩn quốc tế áp dụng
- WCAG 2.2 AA (accessibility)
- Core Web Vitals: LCP < 2.5s, CLS < 0.1, FID < 100ms
- Mobile-first responsive
- SEO: Open Graph, sitemap.xml, robots.txt, JSON-LD structured data
- HTTPS + CSP headers
- i18n ready (mở rộng tiếng Anh sau)

---

## Tiến độ

### 2026-04-21
- [x] Khởi tạo folder dự án /home/tmc/projects/NexLumina
- [x] Tạo repo GitHub https://github.com/GiaBao72/NexLumina (branch main)
- [x] Xác định thiết kế: Premium Modern + Aurora, màu teal/cam
- [x] Xác định công nghệ: Next.js 14 + TypeScript + Tailwind + shadcn/ui + Bunny + Prisma + NextAuth + Stripe
- [x] Xác định cấu trúc trang: 9 routes chính
- [x] Setup Next.js 14 (App Router) + TypeScript + Tailwind CSS + shadcn/ui
- [x] Tạo cấu trúc thư mục chuẩn (app router, components, lib, hooks, types)
- [x] Cấu hình fonts: Plus Jakarta Sans (heading) + DM Sans (body) + JetBrains Mono
- [x] Thiết lập CSS variables theo design system (teal/cam/WCAG AA)
- [x] Setup Prisma 5 + schema đầy đủ: User, Account, Session, Course, Section, Lesson, Enrollment, Progress, Review, Order
- [x] Setup NextAuth.js beta (JWT + Google OAuth + Credentials)
- [x] Tạo src/lib/prisma.ts (singleton client)
- [x] Tạo src/lib/auth.ts (NextAuth config)
- [x] Tạo src/types/index.ts (TypeScript interfaces)
- [x] Tạo .env.example với tất cả biến môi trường cần thiết
- [x] Push lên GitHub (branch main)

### Cập nhật tiến độ thực tế (tổng hợp sau nhiều session)

#### Deploy & Infrastructure
- [x] Thay Prisma Postgres cloud → PostgreSQL local (localhost:5432)
- [x] Tạo DB user `nexlumina` / DB `nexlumina`
- [x] Cập nhật .env: DATABASE_URL local, AUTH_SECRET, NEXTAUTH_URL
- [x] Chạy `prisma db push` thành công (schema sync)
- [x] Build production (`npm run build`) thành công
- [x] Deploy qua PM2, port 12431 (thay thế course-demo)
- [x] Nginx proxy: 1234 → 5678 (nội bộ); router: 12431 → 1234
- [x] NEXTAUTH_URL = IP public VPS

#### Pages đã xây dựng (17+ routes live)
- [x] / — Landing page (Hero, Stats, Categories, Featured Courses, Testimonials, CTA, Footer)
- [x] /login — Đăng nhập (Credentials, UI chuẩn)
- [x] /register — Đăng ký
- [x] /forgot-password — Quên mật khẩu
- [x] /courses — Danh sách khóa học + filter/search
- [x] /courses/:slug — Chi tiết khóa học
- [x] /learn/:courseSlug/:lessonSlug — Trang học (Bunny player + sidebar)
- [x] /dashboard — Dashboard học viên (stats, heatmap, streak)
- [x] /profile — Hồ sơ cá nhân
- [x] /cart — Giỏ hàng
- [x] /checkout — Thanh toán
- [x] /order-success — Đặt hàng thành công
- [x] /admin — Admin panel (quản lý khóa học, học viên, đơn hàng)
- [x] /terms — Điều khoản dịch vụ (đang xây)
- [x] /privacy — Chính sách bảo mật GDPR (đang xây)
- [x] /roadmap — Lộ trình học (đang xây)

#### UI/UX đã cải thiện
- [x] Navbar với active state, mobile menu
- [x] Dark mode support (CSS variables)
- [x] WCAG AA contrast trên các component chính
- [x] Mobile-first responsive
- [x] Heatmap 7-column, streak milestone progress bar
- [x] Login back-to-home button fixed top-left
- [x] ScorePopup mobile-safe position
- [x] Courses mobile tab scroll hint
- [x] Typewriter CLS fix (min-h reserved)
- [x] Shuffle on retry trong ExerciseRunner

#### Hoàn thành (2026-04-21 — session 2)
- [x] /terms — Điều khoản dịch vụ 10 mục chuẩn quốc tế: tổng quan, điều kiện, tài khoản, khóa học & thanh toán, SHTT, hành vi cấm, hoàn tiền, giới hạn trách nhiệm, đình chỉ, liên hệ & tranh chấp
- [x] /privacy — Fix lỗi metadata export trên 'use client' → tách ra layout.tsx riêng
- [x] /roadmap — 6 lộ trình học (Full-Stack, UI/UX Designer, Data Analyst, AI/ML Engineer, Digital Marketing, Business English); filter category + expand phases chi tiết; FAQ 4 câu
- [x] Tách metadata ra layout.tsx cho /terms, /privacy, /roadmap
- [x] Build production thành công (20/20 routes — tất cả static)
- [x] PM2 restart — online

#### Hoàn thành (2026-04-21 — session 3 — Flow mua khóa học)
- [x] CartContext (localStorage) + hook useCart — persist qua reload, no duplicates
- [x] CartProvider gắn vào Providers.tsx bọc toàn app
- [x] courses/[slug]: nút "Thêm vào giỏ" kết nối CartContext; đổi thành "Xem giỏ hàng →" khi đã có trong giỏ (desktop + mobile)
- [x] cart/page.tsx: đọc items từ CartContext, xóa hardcode; link checkout truyền ?discount=
- [x] checkout/page.tsx: đọc cart từ CartContext; clearCart() sau khi đặt; save order vào sessionStorage; Suspense wrapper cho useSearchParams; link /terms và /privacy thực; hiện empty state khi cart trống; nút submit hiển thị tổng tiền
- [x] order-success/page.tsx: đọc order từ sessionStorage; hiện đúng items + tổng + email; link "Vào học ngay" đúng slug; fix Math.random() trong module scope
- [x] Build 20/20 routes ✓ — PM2 restart online

### Việc tiếp theo
- [ ] Navbar hiện số lượng badge giỏ hàng (CartContext count)
- [ ] Google OAuth (khi có client ID/secret)
- [ ] Tích hợp Bunny Stream thực tế (upload video + token auth)
- [ ] Thanh toán (Stripe / PayOS)
- [ ] Sitemap.xml, robots.txt, JSON-LD structured data
- [ ] CSP headers

---

## Ghi chú kỹ thuật
- Dùng `prisma db push` thay `migrate deploy` vì project chưa có migration files
- Google OAuth comment trong .env, dùng Credentials provider trước
- Port binding: app → 12431 qua PM2; Nginx 1234→5678 nội bộ
- NEXTAUTH_URL phải là IP public, không phải localhost
- Tailwind v4: dùng `@import "tailwindcss"`, KHÔNG dùng `@tailwind` directives
