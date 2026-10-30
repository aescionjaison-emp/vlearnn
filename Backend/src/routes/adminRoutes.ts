import { Router } from "express";
import {
  adminLogin,
  getAdminMe,
  getDashboardMetrics,
  getAdminCourses,
  createCourse,
  updateCourse,
  archiveCourse,
  getAdminCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getAdminEnquiries,
  getEnquiryById,
  updateEnquiryStatus,
  updateEnquiryNotes,
  replyEnquiryEmail,
  updateSiteSettings,
  getAdminFAQs,
  createFAQ,
  updateFAQ,
  deleteFAQ,
  getAdminTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  streamAdminEvents,
} from "../controllers/adminController";
import { requireAdmin, requireRole } from "../middleware/auth";
import { Role } from "../types/models";

const router = Router();

// Public Admin Auth Login (No auth header needed)
router.post("/auth/login", adminLogin);

// Protected Admin Routes (Require valid server-verified token)
router.use(requireAdmin);

// Admin Profile & Realtime Events
router.get("/auth/me", getAdminMe);
router.get("/events/stream", streamAdminEvents);
router.get("/metrics", getDashboardMetrics);

// Admin Courses (SUPER_ADMIN, ADMIN, EDITOR can manage courses, but only SUPER_ADMIN & ADMIN can archive)
router.get("/courses", getAdminCourses);
router.post("/courses", createCourse);
router.put("/courses/:id", updateCourse);
router.delete("/courses/:id", requireRole([Role.SUPER_ADMIN, Role.ADMIN]), archiveCourse);

// Admin Categories (Only SUPER_ADMIN & ADMIN can delete categories)
router.get("/categories", getAdminCategories);
router.post("/categories", createCategory);
router.put("/categories/:id", updateCategory);
router.delete("/categories/:id", requireRole([Role.SUPER_ADMIN, Role.ADMIN]), deleteCategory);

// Admin Enquiry Management CRM (Protected: SUPER_ADMIN & ADMIN only; private student data is forbidden to EDITOR)
router.get("/enquiries", requireRole([Role.SUPER_ADMIN, Role.ADMIN]), getAdminEnquiries);
router.get("/enquiries/:id", requireRole([Role.SUPER_ADMIN, Role.ADMIN]), getEnquiryById);
router.patch("/enquiries/:id/status", requireRole([Role.SUPER_ADMIN, Role.ADMIN]), updateEnquiryStatus);
router.patch("/enquiries/:id/notes", requireRole([Role.SUPER_ADMIN, Role.ADMIN]), updateEnquiryNotes);
router.post("/enquiries/:id/reply-email", requireRole([Role.SUPER_ADMIN, Role.ADMIN]), replyEnquiryEmail);

// Admin Content Management
router.put("/content/site-settings", updateSiteSettings);

// Admin FAQs (Only SUPER_ADMIN & ADMIN can delete FAQs)
router.get("/faqs", getAdminFAQs);
router.post("/faqs", createFAQ);
router.put("/faqs/:id", updateFAQ);
router.delete("/faqs/:id", requireRole([Role.SUPER_ADMIN, Role.ADMIN]), deleteFAQ);

// Admin Testimonials (Only SUPER_ADMIN & ADMIN can delete testimonials)
router.get("/testimonials", getAdminTestimonials);
router.post("/testimonials", createTestimonial);
router.put("/testimonials/:id", updateTestimonial);
router.delete("/testimonials/:id", requireRole([Role.SUPER_ADMIN, Role.ADMIN]), deleteTestimonial);

export default router;

