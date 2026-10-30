import { Response, NextFunction } from "express";
import { z } from "zod";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { firestoreService } from "../services/firestoreService";
import { env } from "../config/env";
import { realtime } from "../services/realtimeService";
import { sendStudentReplyEmail } from "../services/emailService";
import { AuthenticatedRequest } from "../middleware/auth";
import { EnquiryStatus, LearningMode, Role } from "../types/models";

// Auth Login
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function adminLogin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await firestoreService.findAdminByEmail(email);

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password credentials.",
      });
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password credentials.",
      });
    }

    await firestoreService.updateAdminLastLogin(user.id);

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
      env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      message: "Admin authentication successful",
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getAdminMe(req: AuthenticatedRequest, res: Response) {
  res.json({
    success: true,
    data: req.adminUser,
  });
}

// Dashboard Metrics
export async function getDashboardMetrics(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const data = await firestoreService.getDashboardMetrics();

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
}

// Course Management
export async function getAdminCourses(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const courses = await firestoreService.getAllAdminCourses();

    res.json({
      success: true,
      data: courses,
    });
  } catch (error) {
    next(error);
  }
}

export const courseSchema = z.object({
  title: z
    .string({ required_error: "Course title is required." })
    .trim()
    .min(3, "Course title must be at least 3 characters."),
  slug: z
    .string({ required_error: "URL slug is required." })
    .trim()
    .min(3, "URL slug must be at least 3 characters.")
    .transform((val) =>
      val
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
    )
    .refine((val) => val.length >= 3, {
      message: "URL slug must be at least 3 characters after alphanumeric cleanup.",
    }),
  summary: z
    .string({ required_error: "Course summary is required." })
    .trim()
    .min(5, "Course summary must be at least 5 characters."),
  description: z
    .string({ required_error: "Course description is required." })
    .trim()
    .min(10, "Course description must be at least 10 characters."),
  categoryId: z
    .string({ required_error: "Please select a course category." })
    .trim()
    .uuid("Invalid category ID format. Please select an existing category."),
  duration: z
    .string({ required_error: "Duration is required." })
    .trim()
    .min(2, "Duration is required (e.g. '14 Weeks')."),
  learningMode: z
    .nativeEnum(LearningMode, {
      errorMap: () => ({
        message: "Invalid learning mode. Must be ONLINE, HYBRID, IN_PERSON, or WEEKEND_BOOTCAMP.",
      }),
    })
    .default(LearningMode.HYBRID),
  fees: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? null : Number(val)),
    z
      .number({ invalid_type_error: "Fees must be a valid number." })
      .int("Fees must be a whole number.")
      .nonnegative("Tuition fees cannot be negative.")
      .nullable()
      .optional()
  ),
  isFeatured: z.boolean().default(false),
  isPublished: z.boolean().default(true),
  isArchived: z.boolean().optional(),
  eligibility: z
    .string()
    .optional()
    .nullable()
    .transform((val) => (val && val.trim().length > 0 ? val.trim() : null)),
  displayOrder: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? 0 : Number(val)),
    z.number().int().default(0)
  ),
  modules: z
    .array(
      z.object({
        title: z
          .string({ required_error: "Module title is required." })
          .trim()
          .min(2, "Module title must be at least 2 characters."),
        description: z
          .string()
          .optional()
          .nullable()
          .transform((val) => (val && val.trim().length > 0 ? val.trim() : null)),
        topics: z
          .array(z.string())
          .default([])
          .transform((topics) => topics.map((t) => t.trim()).filter(Boolean)),
        durationHours: z.preprocess(
          (val) => (val === "" || val === null || val === undefined ? null : Number(val)),
          z.number().int().nonnegative("Duration hours cannot be negative.").nullable().optional()
        ),
      })
    )
    .optional()
    .default([]),
});

export async function createCourse(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const body = courseSchema.parse(req.body);

    // 1. Verify category exists in database
    const category = await firestoreService.getCategoryById(body.categoryId);
    if (!category) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "The selected category does not exist in the database.",
          fields: {
            categoryId: "Please select an existing category from the dropdown.",
          },
        },
        message: "The selected category does not exist in the database.",
      });
    }

    // 2. Check for unique slug conflict (HTTP 409 Conflict)
    const existingSlug = await firestoreService.getCourseBySlug(body.slug);
    if (existingSlug) {
      return res.status(409).json({
        success: false,
        error: {
          code: "CONFLICT",
          message: `A course with URL slug "${body.slug}" already exists. Please choose a different slug.`,
          fields: {
            slug: "This URL slug is already taken. Please enter a unique slug.",
          },
        },
        message: `A course with URL slug "${body.slug}" already exists.`,
      });
    }

    // 3. Atomically persist course and syllabus modules via Firestore Service
    const course = await firestoreService.createCourse(body);

    // 4. Realtime broadcast for instant public and admin synchronization
    realtime.broadcastContentUpdate("courses_updated", {
      action: "CREATE",
      courseId: course.id,
      slug: course.slug,
      isPublished: course.isPublished,
    });

    res.status(201).json({
      success: true,
      message: "Course created successfully",
      data: course,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateCourse(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const body = courseSchema.partial().parse(req.body);

    const existingCourse = await firestoreService.getCourseById(id);
    if (!existingCourse) {
      return res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Course not found.",
          fields: {},
        },
        message: "Course not found.",
      });
    }

    // Check slug conflict with another course
    if (body.slug) {
      const slugConflict = await firestoreService.getCourseBySlug(body.slug);
      if (slugConflict && slugConflict.id !== id) {
        return res.status(409).json({
          success: false,
          error: {
            code: "CONFLICT",
            message: `Another course is already using the slug "${body.slug}".`,
            fields: {
              slug: "This URL slug is already taken.",
            },
          },
          message: "Another course is already using this URL slug.",
        });
      }
    }

    // Check category exists if updating category
    if (body.categoryId) {
      const category = await firestoreService.getCategoryById(body.categoryId);
      if (!category) {
        return res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "The selected category does not exist.",
            fields: { categoryId: "Please select an existing category." },
          },
          message: "The selected category does not exist.",
        });
      }
    }

    const updated = await firestoreService.updateCourse(id, body);

    realtime.broadcastContentUpdate("courses_updated", {
      action: "UPDATE",
      courseId: id,
      slug: updated?.slug,
      isPublished: updated?.isPublished,
    });

    res.json({
      success: true,
      message: "Course updated successfully",
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}

export async function archiveCourse(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;

    const course = await firestoreService.patchCourseStatus(id, {
      isArchived: true,
      isPublished: false,
    });

    realtime.broadcastContentUpdate("courses_updated", {
      action: "ARCHIVE",
      courseId: id,
      slug: course.slug,
      isPublished: false,
    });

    res.json({
      success: true,
      message: "Course safely archived. Historical enquiry relationships preserved.",
      data: course,
    });
  } catch (error) {
    next(error);
  }
}

// Categories Management
export async function getAdminCategories(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const categories = await firestoreService.getCategories();

    res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
}

const categorySchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().optional().nullable(),
  displayOrder: z.number().int().default(0),
});

export async function createCategory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const body = categorySchema.parse(req.body);
    const cat = await firestoreService.createCategory(body);

    realtime.broadcastContentUpdate("categories_updated", {
      action: "CREATE",
      categoryId: cat.id,
      slug: cat.slug,
    });

    res.status(201).json({
      success: true,
      data: cat,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateCategory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const body = categorySchema.partial().parse(req.body);

    const cat = await firestoreService.updateCategory(id, body);

    realtime.broadcastContentUpdate("categories_updated", {
      action: "UPDATE",
      categoryId: cat.id,
      slug: cat.slug,
    });

    res.json({
      success: true,
      data: cat,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteCategory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    await firestoreService.deleteCategory(id);

    realtime.broadcastContentUpdate("categories_updated", {
      action: "DELETE",
      categoryId: id,
    });

    res.json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    next(error);
  }
}

// Enquiry Management CRM
export async function getAdminEnquiries(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { search, status, page = "1", limit = "20" } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit as string, 10) || 20));

    const result = await firestoreService.getAdminEnquiries({
      status: typeof status === "string" ? status : undefined,
      search: typeof search === "string" ? search : undefined,
      page: pageNum,
      limit: limitNum,
    });

    res.json({
      success: true,
      data: result.enquiries,
      pagination: {
        total: result.total,
        page: result.page,
        limit: limitNum,
        totalPages: result.totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getEnquiryById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const enquiry = await firestoreService.getEnquiryById(id);

    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: "Enquiry not found",
      });
    }

    res.json({
      success: true,
      data: enquiry,
    });
  } catch (error) {
    next(error);
  }
}

const statusUpdateSchema = z.object({
  status: z.nativeEnum(EnquiryStatus),
});

export async function updateEnquiryStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { status } = statusUpdateSchema.parse(req.body);

    const updated = await firestoreService.updateEnquiryStatus(id, status);

    realtime.broadcast("enquiry_status_updated", {
      id: updated.id,
      enquiryNumber: updated.enquiryNumber,
      status: updated.status,
    });

    res.json({
      success: true,
      message: `Enquiry status updated to ${status}`,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}

const notesUpdateSchema = z.object({
  notes: z.string().nullable().optional(),
  followUpDate: z.string().datetime().nullable().optional(),
});

export async function updateEnquiryNotes(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const body = notesUpdateSchema.parse(req.body);

    const updated = await firestoreService.updateEnquiryNotes(
      id,
      body.notes !== undefined ? body.notes : null,
      body.followUpDate || null
    );

    res.json({
      success: true,
      message: "Internal notes and follow-up date updated",
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}

const replyEmailSchema = z.object({
  subject: z.string().min(3),
  body: z.string().min(5),
});

export async function replyEnquiryEmail(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { subject, body } = replyEmailSchema.parse(req.body);

    const enquiry = await firestoreService.getEnquiryById(id);

    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: "Enquiry not found",
      });
    }

    const result = await sendStudentReplyEmail({
      enquiryId: enquiry.id,
      recipientEmail: enquiry.email,
      senderEmail: req.adminUser?.email || env.ADMIN_NOTIFICATION_EMAIL,
      subject,
      body,
    });

    // Automatically transition NEW to CONTACTED only if email dispatch succeeded
    if (result.success && enquiry.status === EnquiryStatus.NEW) {
      await firestoreService.updateEnquiryStatus(id, EnquiryStatus.CONTACTED);
    }

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: "EMAIL_DISPATCH_FAILED",
          message: result.error || "Failed to dispatch email reply via provider.",
        },
        message: result.error || "Failed to dispatch email reply via provider.",
        data: result,
      });
    }

    res.json({
      success: true,
      message: "Email reply dispatched successfully via Resend",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

// Site Settings
export async function updateSiteSettings(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { id, createdAt, updatedAt, ...updateData } = req.body;
    const settings = await firestoreService.updateSiteSettings(updateData);

    realtime.broadcastContentUpdate("site_content_updated", { updatedAt: settings.updatedAt });
    realtime.broadcastContentUpdate("public_settings_updated", { updatedAt: settings.updatedAt });

    res.json({
      success: true,
      message: "Site content and institute settings updated successfully",
      data: settings,
    });
  } catch (error) {
    next(error);
  }
}

// FAQs CRUD
export async function getAdminFAQs(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const faqs = await firestoreService.getFaqs(false);
    res.json({ success: true, data: faqs });
  } catch (error) {
    next(error);
  }
}

export async function createFAQ(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const body = z
      .object({
        question: z.string().min(5),
        answer: z.string().min(5),
        category: z.string().default("General"),
        displayOrder: z.number().int().default(0),
        isPublished: z.boolean().default(true),
      })
      .parse(req.body);

    const faq = await firestoreService.createFaq(body);

    realtime.broadcastContentUpdate("faqs_updated", { action: "CREATE", faqId: faq.id });

    res.status(201).json({ success: true, data: faq });
  } catch (error) {
    next(error);
  }
}

export async function updateFAQ(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const body = z
      .object({
        question: z.string().min(5).optional(),
        answer: z.string().min(5).optional(),
        category: z.string().optional(),
        displayOrder: z.number().int().optional(),
        isPublished: z.boolean().optional(),
      })
      .parse(req.body);

    const faq = await firestoreService.updateFaq(id, body);

    realtime.broadcastContentUpdate("faqs_updated", { action: "UPDATE", faqId: faq.id });

    res.json({ success: true, data: faq });
  } catch (error) {
    next(error);
  }
}

export async function deleteFAQ(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    await firestoreService.deleteFaq(id);

    realtime.broadcastContentUpdate("faqs_updated", { action: "DELETE", faqId: id });

    res.json({ success: true, message: "FAQ deleted successfully" });
  } catch (error) {
    next(error);
  }
}

// Testimonials CRUD
export async function getAdminTestimonials(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const testimonials = await firestoreService.getTestimonials(false);
    res.json({ success: true, data: testimonials });
  } catch (error) {
    next(error);
  }
}

export async function createTestimonial(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const body = z
      .object({
        studentName: z.string().min(2),
        courseName: z.string().min(2),
        role: z.string().min(2),
        company: z.string().min(2),
        quote: z.string().min(10),
        rating: z.number().int().min(1).max(5).default(5),
        displayOrder: z.number().int().default(0),
        isPublished: z.boolean().default(true),
      })
      .parse(req.body);

    const item = await firestoreService.createTestimonial(body);

    realtime.broadcastContentUpdate("testimonials_updated", { action: "CREATE", testimonialId: item.id });

    res.status(201).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
}

export async function updateTestimonial(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const body = z
      .object({
        studentName: z.string().min(2).optional(),
        courseName: z.string().min(2).optional(),
        role: z.string().min(2).optional(),
        company: z.string().min(2).optional(),
        quote: z.string().min(10).optional(),
        rating: z.number().int().min(1).max(5).optional(),
        displayOrder: z.number().int().optional(),
        isPublished: z.boolean().optional(),
      })
      .parse(req.body);

    const item = await firestoreService.updateTestimonial(id, body);

    realtime.broadcastContentUpdate("testimonials_updated", { action: "UPDATE", testimonialId: item.id });

    res.json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
}

export async function deleteTestimonial(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    await firestoreService.deleteTestimonial(id);

    realtime.broadcastContentUpdate("testimonials_updated", { action: "DELETE", testimonialId: id });

    res.json({ success: true, message: "Testimonial deleted successfully" });
  } catch (error) {
    next(error);
  }
}

// Server-Sent Events (SSE) Stream for real-time dashboard updates
export function streamAdminEvents(req: AuthenticatedRequest, res: Response) {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  const clientId = `admin-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  realtime.addAdminClient(clientId, res);
}
