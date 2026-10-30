import { Router } from "express";
import {
  getCourses,
  getCourseBySlug,
  getCategories,
  submitEnquiry,
  getSiteSettings,
  getFAQs,
  getTestimonials,
  getFaculty,
  streamPublicEvents,
} from "../controllers/publicController";
import { enquiryLimiter } from "../middleware/rateLimiter";

const router = Router();

// Public Real-Time Events Stream (Publicly accessible, safe events only)
router.get("/events/stream", streamPublicEvents);

// Public Course & Category Endpoints
router.get("/courses", getCourses);
router.get("/courses/:slug", getCourseBySlug);
router.get("/categories", getCategories);

// Public Enquiry Submission with Rate Limiter
router.post("/enquiries", enquiryLimiter, submitEnquiry);

// Public Site Content Endpoints
router.get("/content/site-settings", getSiteSettings);
router.get("/content/faqs", getFAQs);
router.get("/content/testimonials", getTestimonials);
router.get("/content/faculty", getFaculty);

export default router;

