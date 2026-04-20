// Course types
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
  totalDuration: number;
  totalLessons: number;
  categoryId: string;
  instructorId: string;
  createdAt: Date;
  updatedAt: Date;
}

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

export interface Section {
  id: string;
  title: string;
  order: number;
  courseId: string;
  lessons: Lesson[];
}

// User types
export interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: "STUDENT" | "INSTRUCTOR" | "ADMIN";
}

// Order types
export interface CartItem {
  courseId: string;
  title: string;
  thumbnail: string | null;
  price: number;
  salePrice: number | null;
}
