export type UserRole = 'SUPER_BOSS' | 'BOSS_ADMIN' | 'BOSS_FINANCEIRO' | 'BOSS_RH' | 'BOSS_MKT' | 'PROFESSOR' | 'ALUNO' | 'SUPORTE';

export interface UserProfile {
  uid: string;
  email: string | null;
  role: UserRole;
  displayName: string | null;
  photoURL: string | null;
  createdAt: number;
}

export interface HomeSection {
  id: string;
  type: 'hero' | 'pain' | 'transformer' | 'about' | 'methods' | 'courses' | 'teachers' | 'testimonials' | 'platform' | 'community' | 'cta' | 'footer';
  title: string;
  subtitle?: string;
  content?: string;
  order: number;
  isActive: boolean;
  ctaText?: string;
  ctaLink?: string;
  imageUrl?: string;
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  teacherId: string;
  thumbnailUrl: string;
  status: 'draft' | 'published' | 'archived';
  category: string;
  modules?: CourseModule[];
}

export interface CourseModule {
  id: string;
  title: string;
  order: number;
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  title: string;
  duration: string;
  videoUrl?: string;
  content?: string;
  order: number;
}

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  enrolledAt: number;
  status: 'active' | 'suspended' | 'expired';
}
