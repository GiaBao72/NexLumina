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

### Việc tiếp theo
- [ ] Setup Next.js 14 + TypeScript + Tailwind + shadcn/ui
- [ ] Cấu trúc thư mục dự án
- [ ] Setup Prisma + database schema
- [ ] Tích hợp Bunny Stream
- [ ] Xây dựng Landing page
- [ ] Auth (NextAuth)
- [ ] Thanh toán (Stripe / PayOS)
- [ ] Admin panel

---

## Ghi chú kỹ thuật
_(cập nhật khi phát sinh vấn đề hoặc quyết định kỹ thuật mới)_
