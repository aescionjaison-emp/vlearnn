export enum Role {
  SUPER_ADMIN = "SUPER_ADMIN",
  ADMIN = "ADMIN",
  EDITOR = "EDITOR",
}

export enum LearningMode {
  ONLINE = "ONLINE",
  HYBRID = "HYBRID",
  IN_PERSON = "IN_PERSON",
  WEEKEND_BOOTCAMP = "WEEKEND_BOOTCAMP",
}

export enum EnquiryStatus {
  NEW = "NEW",
  CONTACTED = "CONTACTED",
  FOLLOW_UP = "FOLLOW_UP",
  INTERESTED = "INTERESTED",
  ENROLLED = "ENROLLED",
  CLOSED = "CLOSED",
}

export enum MessageChannel {
  EMAIL = "EMAIL",
  WHATSAPP_LOG = "WHATSAPP_LOG",
  SYSTEM = "SYSTEM",
}

export enum MessageStatus {
  SENT = "SENT",
  FAILED = "FAILED",
  SKIPPED = "SKIPPED",
}

export interface AdminUser {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: Role;
  lastLoginAt: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CourseCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CourseCategoryWithCount extends CourseCategory {
  _count: {
    courses: number;
  };
}

export interface CourseModule {
  id: string;
  courseId: string;
  title: string;
  description: string | null;
  topics: string[];
  orderIndex: number;
  durationHours: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  summary: string;
  description: string;
  categoryId: string;
  duration: string;
  learningMode: LearningMode;
  fees: number | null;
  isFeatured: boolean;
  isPublished: boolean;
  isArchived: boolean;
  eligibility: string | null;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CourseWithDetails extends Course {
  category: CourseCategory;
  modules: CourseModule[];
}

export interface Enquiry {
  id: string;
  enquiryNumber: string;
  fullName: string;
  email: string;
  countryCode: string;
  phone: string;
  courseId: string | null;
  learningMode: LearningMode | null;
  message: string;
  status: EnquiryStatus;
  notes: string | null;
  followUpDate: string | null;
  consentGiven: boolean;
  source: string;
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
  providerMessageId: string | null;
  createdAt: string;
}

export interface EmailNotification {
  id: string;
  enquiryId: string;
  recipient: string;
  subject: string;
  status: MessageStatus;
  providerMessageId: string | null;
  errorMessage: string | null;
  createdAt: string;
}

export interface EnquiryWithDetails extends Enquiry {
  course: Course | null;
  messages: EnquiryMessage[];
  emailNotifications: EmailNotification[];
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
  facebookUrl: string | null;
  linkedinUrl: string | null;
  twitterUrl: string | null;
  githubUrl: string | null;
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

