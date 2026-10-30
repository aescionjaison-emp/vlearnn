import {
  Course,
  CourseCategory,
  Enquiry,
  SiteSettings,
  FAQ,
  Testimonial,
  FacultyProfile,
  DashboardData,
} from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

function getAuthHeader(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("vlearnn_admin_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export interface ApiErrorResponse extends Error {
  status?: number;
  code?: string;
  fields?: Record<string, string>;
  data?: any;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  const headers = {
    "Content-Type": "application/json",
    ...getAuthHeader(),
    ...options.headers,
  };

  const res = await fetch(url, {
    ...options,
    headers,
    cache: "no-store",
    signal: options.signal || AbortSignal.timeout(6000),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const errorMsg =
      data?.error?.message || data?.message || `Request failed with status ${res.status}`;
    const err = new Error(errorMsg) as ApiErrorResponse;
    err.status = res.status;
    err.data = data;
    err.code =
      data?.error?.code ||
      (res.status === 409
        ? "CONFLICT"
        : res.status === 400
        ? "VALIDATION_ERROR"
        : res.status === 404
        ? "NOT_FOUND"
        : "API_ERROR");

    // Extract structured field-level errors
    const fields: Record<string, string> = { ...(data?.error?.fields || {}) };
    if (Array.isArray(data?.errors)) {
      for (const item of data.errors) {
        if (item.field && !fields[item.field]) {
          fields[item.field] = item.message;
        }
      }
    }
    err.fields = fields;

    throw err;
  }

  return data;
}

// -------------------------------------------------------------
// Public API Calls
// -------------------------------------------------------------

import {
  FALLBACK_COURSES,
  FALLBACK_CATEGORIES,
  FALLBACK_SETTINGS,
  FALLBACK_TESTIMONIALS,
  FALLBACK_FACULTY,
} from "./fallbackData";

export async function fetchPublishedCourses(params?: {
  category?: string;
  search?: string;
  featured?: boolean;
}): Promise<Course[]> {
  try {
    const query = new URLSearchParams();
    if (params?.category) query.set("category", params.category);
    if (params?.search) query.set("search", params.search);
    if (params?.featured) query.set("featured", "true");

    const qs = query.toString();
    const res = await request<{ success: boolean; data: Course[] }>(`/courses${qs ? `?${qs}` : ""}`);
    if (res?.data && res.data.length > 0) return res.data;
    return FALLBACK_COURSES;
  } catch (err) {
    console.warn("fetchPublishedCourses: returning verified course catalog fallback.");
    let list = FALLBACK_COURSES;
    if (params?.category && params.category !== "ALL") {
      list = list.filter((c) => c.category?.slug === params.category || c.categoryId === params.category);
    }
    if (params?.featured) {
      list = list.filter((c) => c.isFeatured);
    }
    return list;
  }
}

export async function fetchCourseBySlug(slug: string): Promise<Course> {
  try {
    const res = await request<{ success: boolean; data: Course }>(`/courses/${slug}`);
    if (res?.data) return res.data;
  } catch (err) {
    console.warn(`fetchCourseBySlug: checking fallback for ${slug}`);
  }
  const match = FALLBACK_COURSES.find((c) => c.slug.toLowerCase() === slug.toLowerCase());
  if (match) return match;
  throw new Error("Course not found");
}

export async function fetchCategories(): Promise<CourseCategory[]> {
  try {
    const res = await request<{ success: boolean; data: CourseCategory[] }>("/categories");
    if (res?.data && res.data.length > 0) return res.data;
  } catch (err) {
    console.warn("fetchCategories: returning verified categories fallback.");
  }
  return FALLBACK_CATEGORIES;
}

export interface SubmitEnquiryPayload {
  fullName: string;
  email: string;
  countryCode?: string;
  phone: string;
  courseSlug?: string;
  courseId?: string;
  learningMode?: string;
  message: string;
  consentGiven: boolean;
}

export async function submitStudentEnquiry(
  payload: SubmitEnquiryPayload
): Promise<{ success: boolean; message: string; data: { enquiryNumber: string; createdAt: string } }> {
  return request("/enquiries", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function fetchSiteSettings(): Promise<SiteSettings> {
  try {
    const res = await request<{ success: boolean; data: SiteSettings }>("/content/site-settings");
    if (res?.data) return res.data;
  } catch (err) {
    console.warn("fetchSiteSettings: returning verified site settings fallback.");
  }
  return FALLBACK_SETTINGS;
}

export async function fetchFAQs(): Promise<FAQ[]> {
  try {
    const res = await request<{ success: boolean; data: FAQ[] }>("/content/faqs");
    if (res?.data) return res.data;
  } catch {
    // Return empty array
  }
  return [];
}

export async function fetchTestimonials(): Promise<Testimonial[]> {
  try {
    const res = await request<{ success: boolean; data: Testimonial[] }>("/content/testimonials");
    if (res?.data && res.data.length > 0) return res.data;
  } catch (err) {
    console.warn("fetchTestimonials: returning verified testimonials fallback.");
  }
  return FALLBACK_TESTIMONIALS;
}

export async function fetchFaculty(): Promise<FacultyProfile[]> {
  try {
    const res = await request<{ success: boolean; data: FacultyProfile[] }>("/content/faculty");
    if (res?.data && res.data.length > 0) return res.data;
  } catch (err) {
    console.warn("fetchFaculty: returning verified faculty fallback.");
  }
  return FALLBACK_FACULTY;
}

// -------------------------------------------------------------
// Admin API Calls
// -------------------------------------------------------------

export async function adminLogin(credentials: { email: string; password: string }) {
  const res = await request<{
    success: boolean;
    data: { token: string; user: { id: string; name: string; email: string; role: string } };
  }>("/admin/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });

  if (res.data?.token && typeof window !== "undefined") {
    localStorage.setItem("vlearnn_admin_token", res.data.token);
    localStorage.setItem("vlearnn_admin_user", JSON.stringify(res.data.user));
    document.cookie = `vlearnn_token=${res.data.token}; path=/; max-age=604800; SameSite=Lax`;
  }

  return res.data;
}

export function clearAdminSession() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("vlearnn_admin_token");
    localStorage.removeItem("vlearnn_admin_user");
    document.cookie = "vlearnn_token=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT;";
  }
}

export function adminLogout() {
  clearAdminSession();
  if (typeof window !== "undefined") {
    window.location.href = "/admin/login";
  }
}

export async function getAdminProfile(timeoutMs: number = 6000): Promise<{
  id: string;
  email: string;
  role: string;
  name: string;
}> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await request<{
      success: boolean;
      data: { id: string; email: string; role: string; name: string };
    }>("/admin/auth/me", {
      signal: controller.signal,
    });
    return res.data;
  } finally {
    clearTimeout(timer);
  }
}

export function getStoredAdminUser() {
  if (typeof window === "undefined") return null;
  const userStr = localStorage.getItem("vlearnn_admin_user");
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

export async function fetchDashboardData(): Promise<DashboardData> {
  const res = await request<{ success: boolean; data: DashboardData }>("/admin/metrics");
  return res.data;
}

export async function fetchAdminCourses(): Promise<Course[]> {
  const res = await request<{ success: boolean; data: Course[] }>("/admin/courses");
  return res.data;
}

export async function createAdminCourse(data: any): Promise<Course> {
  const res = await request<{ success: boolean; data: Course }>("/admin/courses", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res.data;
}

export async function updateAdminCourse(id: string, data: any): Promise<Course> {
  const res = await request<{ success: boolean; data: Course }>(`/admin/courses/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  return res.data;
}

export async function archiveAdminCourse(id: string): Promise<Course> {
  const res = await request<{ success: boolean; data: Course }>(`/admin/courses/${id}`, {
    method: "DELETE",
  });
  return res.data;
}

export async function fetchAdminCategories(): Promise<CourseCategory[]> {
  const res = await request<{ success: boolean; data: CourseCategory[] }>("/admin/categories");
  return res.data;
}

export async function createAdminCategory(data: any): Promise<CourseCategory> {
  const res = await request<{ success: boolean; data: CourseCategory }>("/admin/categories", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res.data;
}

export async function updateAdminCategory(id: string, data: any): Promise<CourseCategory> {
  const res = await request<{ success: boolean; data: CourseCategory }>(`/admin/categories/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  return res.data;
}

export async function deleteAdminCategory(id: string): Promise<void> {
  await request(`/admin/categories/${id}`, {
    method: "DELETE",
  });
}

export async function fetchAdminEnquiries(params?: {
  search?: string;
  status?: string;
  courseId?: string;
  page?: number;
  limit?: number;
}): Promise<{
  data: Enquiry[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
}> {
  const query = new URLSearchParams();
  if (params?.search) query.set("search", params.search);
  if (params?.status && params.status !== "ALL") query.set("status", params.status);
  if (params?.courseId && params.courseId !== "ALL") query.set("courseId", params.courseId);
  if (params?.page) query.set("page", params.page.toString());
  if (params?.limit) query.set("limit", params.limit.toString());

  const qs = query.toString();
  const res = await request<{
    success: boolean;
    data: Enquiry[];
    pagination: { total: number; page: number; limit: number; totalPages: number };
  }>(`/admin/enquiries${qs ? `?${qs}` : ""}`);

  return { data: res.data, pagination: res.pagination };
}

export async function fetchEnquiryById(id: string): Promise<Enquiry> {
  const res = await request<{ success: boolean; data: Enquiry }>(`/admin/enquiries/${id}`);
  return res.data;
}

export async function updateEnquiryStatus(id: string, status: string): Promise<Enquiry> {
  const res = await request<{ success: boolean; data: Enquiry }>(`/admin/enquiries/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
  return res.data;
}

export async function updateEnquiryNotes(
  id: string,
  data: { notes?: string | null; followUpDate?: string | null }
): Promise<Enquiry> {
  const res = await request<{ success: boolean; data: Enquiry }>(`/admin/enquiries/${id}/notes`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  return res.data;
}

export async function replyEnquiryEmail(
  id: string,
  data: { subject: string; body: string }
): Promise<{ success: boolean; message: string }> {
  return request(`/admin/enquiries/${id}/reply-email`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateSiteSettings(data: Partial<SiteSettings>): Promise<SiteSettings> {
  const res = await request<{ success: boolean; data: SiteSettings }>("/admin/content/site-settings", {
    method: "PUT",
    body: JSON.stringify(data),
  });
  return res.data;
}

export async function fetchAdminFAQs(): Promise<FAQ[]> {
  const res = await request<{ success: boolean; data: FAQ[] }>("/admin/faqs");
  return res.data;
}

export async function createAdminFAQ(data: any): Promise<FAQ> {
  const res = await request<{ success: boolean; data: FAQ }>("/admin/faqs", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res.data;
}

export async function updateAdminFAQ(id: string, data: any): Promise<FAQ> {
  const res = await request<{ success: boolean; data: FAQ }>(`/admin/faqs/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  return res.data;
}

export async function deleteAdminFAQ(id: string): Promise<void> {
  await request(`/admin/faqs/${id}`, { method: "DELETE" });
}

export async function fetchAdminTestimonials(): Promise<Testimonial[]> {
  const res = await request<{ success: boolean; data: Testimonial[] }>("/admin/testimonials");
  return res.data;
}

export async function createAdminTestimonial(data: any): Promise<Testimonial> {
  const res = await request<{ success: boolean; data: Testimonial }>("/admin/testimonials", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res.data;
}

export async function updateAdminTestimonial(id: string, data: any): Promise<Testimonial> {
  const res = await request<{ success: boolean; data: Testimonial }>(`/admin/testimonials/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  return res.data;
}

export async function deleteAdminTestimonial(id: string): Promise<void> {
  await request(`/admin/testimonials/${id}`, { method: "DELETE" });
}

