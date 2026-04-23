// ─── Course ──────────────────────────────────────────────────────────────────
export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail: string | null;
  previewVideo: string | null;
  price: number;
  salePrice: number | null;
  level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  language: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  featured: boolean;
  badge: string | null;
  totalDuration: number | string | null; // số phút (DB) hoặc string "X giờ" (API format)
  totalLessons: number;
  fakeRating: number | null;
  fakeReviews: number | null;
  fakeStudents: number | null;
  categoryId: string;
  category: { id: string; name: string; slug: string } | null;
  _count?: { enrollments: number; reviews: number };
  createdAt: Date | string;
  updatedAt: Date | string;
}

// ─── Lesson ───────────────────────────────────────────────────────────────────
export interface Lesson {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  bunnyVideoId: string | null;
  duration: number;
  order: number;
  isFree: boolean;
  sectionId: string;
}

// ─── Section ──────────────────────────────────────────────────────────────────
export interface Section {
  id: string;
  title: string;
  order: number;
  courseId: string;
  lessons: Lesson[];
}

// ─── Category ─────────────────────────────────────────────────────────────────
export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  _count?: { courses: number };
}

// ─── User ─────────────────────────────────────────────────────────────────────
export interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: "STUDENT" | "ADMIN";
}

// ─── Cart ─────────────────────────────────────────────────────────────────────
export interface CartItem {
  courseId: string;
  title: string;
  thumbnail: string | null;
  price: number;
  salePrice: number | null;
}

// ─── Stats trang chủ ──────────────────────────────────────────────────────────
export interface HomeStats {
  totalCourses: number;
  totalStudents: number;
  satisfactionRate: number;
  totalCategories?: number;
}
