export type Role = "SUPER_ADMIN" | "ADMIN" | "EDITOR";

export type LearningMode = "ONLINE" | "HYBRID" | "IN_PERSON" | "WEEKEND_BOOTCAMP";

export type EnquiryStatus = "NEW" | "CONTACTED" | "FOLLOW_UP" | "INTERESTED" | "ENROLLED" | "CLOSED";

export type MessageChannel = "EMAIL" | "WHATSAPP_LOG" | "SYSTEM";

export type MessageStatus = "SENT" | "FAILED" | "SKIPPED";

export interface CourseCategory {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  displayOrder: number;
  courseCount?: number;
}

export interface CourseModule {
  id: string;
  courseId: string;
  title: string;
  description?: string | null;
  topics: string[];
  orderIndex: number;
  durationHours?: number | null;
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  summary: string;
  description: string;
  categoryId: string;
  category?: CourseCategory;
  duration: string;
  learningMode: LearningMode;
  fees?: number | null;
  isFeatured: boolean;
  isPublished: boolean;
  isArchived: boolean;
  eligibility?: string | null;
  displayOrder: number;
  modules?: CourseModule[];
  createdAt: string;
  updatedAt: string;
}

export interface EnquiryMessage {
  id: string;
  enquiryId: string;
  senderRole: string;
  senderEmail: string;
  recipientEmail: string;
  subject: string;
  body: string;
  channel: MessageChannel;
  status: MessageStatus;
  providerMessageId?: string | null;
  createdAt: string;
}

export interface EmailNotification {
  id: string;
  enquiryId: string;
  recipient: string;
  subject: string;
  status: MessageStatus;
  providerMessageId?: string | null;
  errorMessage?: string | null;
  createdAt: string;
}

export interface Enquiry {
  id: string;
  enquiryNumber: string;
  fullName: string;
  email: string;
  countryCode: string;
  phone: string;
  courseId?: string | null;
  course?: {
    id: string;
    title: string;
    slug: string;
    category?: CourseCategory;
  } | null;
  learningMode?: LearningMode | null;
  message: string;
  status: EnquiryStatus;
  notes?: string | null;
  followUpDate?: string | null;
  consentGiven: boolean;
  source: string;
  createdAt: string;
  updatedAt: string;
  messages?: EnquiryMessage[];
  emailNotifications?: EmailNotification[];
  _count?: {
    messages: number;
  };
}

export interface SiteSettings {
  id: string;
  instituteName: string;
  tagLine: string;
  heroTitle: string;
  heroSubtitle: string;
  aboutStory: string;
  mission: string;
  vision: string;
  address: string;
  phone: string;
  email: string;
  whatsappNumber: string;
  facebookUrl?: string | null;
  linkedinUrl?: string | null;
  twitterUrl?: string | null;
  githubUrl?: string | null;
  updatedAt: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  displayOrder: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Testimonial {
  id: string;
  studentName: string;
  courseName: string;
  role: string;
  company: string;
  quote: string;
  rating: number;
  isPublished: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface FacultyProfile {
  id: string;
  name: string;
  title: string;
  bio: string;
  expertise: string[];
  yearsExperience: number;
  displayOrder: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminMetrics {
  totalEnquiries: number;
  newEnquiries: number;
  followUpsDue: number;
  enrolledStudents: number;
  publishedCourses: number;
}

export interface DashboardData {
  metrics: AdminMetrics;
  courseWiseEnquiries: Array<{
    courseId: string;
    title: string;
    enquiryCount: number;
  }>;
  recentEnquiries: Enquiry[];
}

