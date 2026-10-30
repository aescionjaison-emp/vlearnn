import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { firestoreService } from "../services/firestoreService";
import { sendAdminEnquiryNotification } from "../services/emailService";
import { realtime } from "../services/realtimeService";
import { LearningMode, EnquiryStatus } from "../types/models";

export const enquirySchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name must not exceed 100 characters"),
  email: z.string().trim().email("Please provide a valid email address").max(100),
  countryCode: z.string().trim().default("+91"),
  phone: z
    .string()
    .trim()
    .min(7, "Phone number must be at least 7 digits")
    .max(15, "Phone number must not exceed 15 digits"),
  courseSlug: z.string().trim().optional(),
  courseId: z.string().trim().optional(),
  learningMode: z.nativeEnum(LearningMode).optional(),
  message: z
    .string()
    .trim()
    .min(10, "Message must be at least 10 characters")
    .max(2000, "Message cannot exceed 2000 characters"),
  consentGiven: z.boolean().refine((val) => val === true, "Consent for communication is required"),
});

export async function getCourses(req: Request, res: Response, next: NextFunction) {
  try {
    const { category, search, featured } = req.query;

    let courses = await firestoreService.getPublicCourses({
      categorySlug: typeof category === "string" ? category : undefined,
      search: typeof search === "string" ? search : undefined,
    });

    if (featured === "true") {
      courses = courses.filter((c) => c.isFeatured);
    }

    res.json({
      success: true,
      count: courses.length,
      data: courses,
    });
  } catch (error) {
    next(error);
  }
}

export async function getCourseBySlug(req: Request, res: Response, next: NextFunction) {
  try {
    const { slug } = req.params;
    const course = await firestoreService.getPublicCourseBySlug(slug);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found or is currently not open for public admissions.",
      });
    }

    res.json({
      success: true,
      data: course,
    });
  } catch (error) {
    next(error);
  }
}

export async function getCategories(req: Request, res: Response, next: NextFunction) {
  try {
    const categories = await firestoreService.getCategories();

    res.json({
      success: true,
      data: categories.map((cat) => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        courseCount: cat._count.courses,
      })),
    });
  } catch (error) {
    next(error);
  }
}

export async function submitEnquiry(req: Request, res: Response, next: NextFunction) {
  try {
    const validatedData = enquirySchema.parse(req.body);

    let matchedCourse: { id: string; title: string; slug: string } | null = null;

    // Validate course if provided
    if (validatedData.courseSlug || validatedData.courseId) {
      let course = null;
      if (validatedData.courseSlug) {
        course = await firestoreService.getCourseBySlug(validatedData.courseSlug);
      } else if (validatedData.courseId) {
        course = await firestoreService.getCourseById(validatedData.courseId);
      }

      if (!course || !course.isPublished || course.isArchived) {
        return res.status(400).json({
          success: false,
          message: "The requested course is invalid or currently unavailable for enquiries.",
        });
      }

      matchedCourse = {
        id: course.id,
        title: course.title,
        slug: course.slug,
      };
    }

    const enquiry = await firestoreService.createEnquiry({
      fullName: validatedData.fullName,
      email: validatedData.email.toLowerCase(),
      countryCode: validatedData.countryCode,
      phone: validatedData.phone,
      courseId: matchedCourse ? matchedCourse.id : null,
      learningMode: validatedData.learningMode,
      message: validatedData.message,
      status: EnquiryStatus.NEW,
      consentGiven: validatedData.consentGiven,
    });

    // Send email notification to Admin (Preserves enquiry regardless of email failure)
    sendAdminEnquiryNotification({
      enquiryId: enquiry.id,
      enquiryNumber: enquiry.enquiryNumber,
      fullName: enquiry.fullName,
      email: enquiry.email,
      phone: `${enquiry.countryCode} ${enquiry.phone}`,
      courseTitle: matchedCourse?.title,
      learningMode: enquiry.learningMode,
      message: enquiry.message,
    }).catch((err) => console.error("Async email dispatch error:", err));

    // Broadcast realtime event to active admin dashboards
    realtime.broadcast("new_enquiry", {
      id: enquiry.id,
      enquiryNumber: enquiry.enquiryNumber,
      fullName: enquiry.fullName,
      courseTitle: matchedCourse?.title || "General Enquiry",
      status: enquiry.status,
      createdAt: enquiry.createdAt,
    });

    res.status(201).json({
      success: true,
      message:
        "Thank you for reaching out! Your enquiry has been received. Our admissions team will contact you shortly.",
      data: {
        enquiryNumber: enquiry.enquiryNumber,
        createdAt: enquiry.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getSiteSettings(req: Request, res: Response, next: NextFunction) {
  try {
    const settings = await firestoreService.getSiteSettings();

    res.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    next(error);
  }
}

export async function getFAQs(req: Request, res: Response, next: NextFunction) {
  try {
    const faqs = await firestoreService.getFaqs(true);

    res.json({
      success: true,
      data: faqs,
    });
  } catch (error) {
    next(error);
  }
}

export async function getTestimonials(req: Request, res: Response, next: NextFunction) {
  try {
    const testimonials = await firestoreService.getTestimonials(true);

    res.json({
      success: true,
      data: testimonials,
    });
  } catch (error) {
    next(error);
  }
}

export async function getFaculty(req: Request, res: Response, next: NextFunction) {
  try {
    const faculty = await firestoreService.getFaculty(true);

    res.json({
      success: true,
      data: faculty,
    });
  } catch (error) {
    next(error);
  }
}

// Server-Sent Events (SSE) Stream for Public Clients (No sensitive enquiry data)
export function streamPublicEvents(req: Request, res: Response) {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  });

  const clientId = `pub-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  realtime.addPublicClient(clientId, res);
}
