import { v4 as uuidv4 } from "uuid";
import { Query } from "firebase-admin/firestore";
import { getDb } from "../config/firebase";
import {
  AdminUser,
  CourseCategory,
  CourseCategoryWithCount,
  Course,
  CourseWithDetails,
  CourseModule,
  Enquiry,
  EnquiryWithDetails,
  EnquiryMessage,
  EmailNotification,
  SiteSettings,
  FAQ,
  Testimonial,
  FacultyProfile,
  Role,
  LearningMode,
  EnquiryStatus,
  MessageChannel,
  MessageStatus,
} from "../types/models";

// Helper for generating UUID if uuid package not imported
function generateId(): string {
  try {
    return uuidv4();
  } catch {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
}

export class FirestoreService {
  // ==========================================
  // 1. ADMIN USER AUTHENTICATION & MANAGEMENT
  // ==========================================

  async findAdminByEmail(email: string): Promise<AdminUser | null> {
    const db = getDb();
    const cleanEmail = email.toLowerCase().trim();
    const snap = await db
      .collection("admin_users")
      .where("email", "==", cleanEmail)
      .limit(1)
      .get();

    if (snap.empty) {
      return null;
    }

    const doc = snap.docs[0];
    return { id: doc.id, ...doc.data() } as AdminUser;
  }

  async findAdminById(id: string): Promise<AdminUser | null> {
    const db = getDb();
    const doc = await db.collection("admin_users").doc(id).get();
    if (!doc.exists) {
      return null;
    }
    return { id: doc.id, ...doc.data() } as AdminUser;
  }

  async updateAdminLastLogin(id: string): Promise<void> {
    const db = getDb();
    await db.collection("admin_users").doc(id).update({
      lastLoginAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  async createAdminUser(data: {
    id?: string;
    email: string;
    passwordHash: string;
    name: string;
    role?: Role;
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
  }): Promise<AdminUser> {
    const db = getDb();
    const id = data.id || generateId();
    const now = new Date().toISOString();
    const admin: AdminUser = {
      id,
      email: data.email.toLowerCase().trim(),
      passwordHash: data.passwordHash,
      name: data.name,
      role: data.role || Role.ADMIN,
      lastLoginAt: null,
      isActive: data.isActive !== undefined ? data.isActive : true,
      createdAt: data.createdAt || now,
      updatedAt: data.updatedAt || now,
    };

    await db.collection("admin_users").doc(id).set(admin);
    return admin;
  }

  // ==========================================
  // 2. COURSE CATEGORIES
  // ==========================================

  async getCategories(): Promise<CourseCategoryWithCount[]> {
    const db = getDb();
    const snap = await db.collection("course_categories").get();
    const categories: CourseCategory[] = [];
    snap.forEach((doc) => categories.push({ id: doc.id, ...doc.data() } as CourseCategory));

    // Sort by displayOrder ascending
    categories.sort((a, b) => a.displayOrder - b.displayOrder);

    // Compute course counts for published & non-archived courses
    const coursesSnap = await db
      .collection("courses")
      .where("isPublished", "==", true)
      .where("isArchived", "==", false)
      .get();

    const countMap: Record<string, number> = {};
    coursesSnap.forEach((doc) => {
      const catId = doc.data().categoryId;
      if (catId) {
        countMap[catId] = (countMap[catId] || 0) + 1;
      }
    });

    return categories.map((cat) => ({
      ...cat,
      _count: {
        courses: countMap[cat.id] || 0,
      },
    }));
  }

  async getCategoryById(id: string): Promise<CourseCategory | null> {
    const db = getDb();
    const doc = await db.collection("course_categories").doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() } as CourseCategory;
  }

  async getCategoryBySlug(slug: string): Promise<CourseCategory | null> {
    const db = getDb();
    const snap = await db
      .collection("course_categories")
      .where("slug", "==", slug.trim().toLowerCase())
      .limit(1)
      .get();
    if (snap.empty) return null;
    const doc = snap.docs[0];
    return { id: doc.id, ...doc.data() } as CourseCategory;
  }

  async getCategoryByName(name: string): Promise<CourseCategory | null> {
    const db = getDb();
    const snap = await db
      .collection("course_categories")
      .where("name", "==", name.trim())
      .limit(1)
      .get();
    if (snap.empty) return null;
    const doc = snap.docs[0];
    return { id: doc.id, ...doc.data() } as CourseCategory;
  }

  async createCategory(data: {
    id?: string;
    name: string;
    slug?: string;
    description?: string | null;
    displayOrder?: number;
    createdAt?: string;
    updatedAt?: string;
  }): Promise<CourseCategory> {
    const db = getDb();
    const slug = (data.slug || data.name)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    // Verify name uniqueness
    const existingName = await this.getCategoryByName(data.name);
    if (existingName) {
      const err: any = new Error(`A category with the name "${data.name}" already exists.`);
      err.code = "CATEGORY_NAME_EXISTS";
      err.statusCode = 409;
      throw err;
    }

    const id = data.id || generateId();
    const now = new Date().toISOString();
    const category: CourseCategory = {
      id,
      name: data.name.trim(),
      slug,
      description: data.description || null,
      displayOrder: data.displayOrder ?? 0,
      createdAt: data.createdAt || now,
      updatedAt: data.updatedAt || now,
    };

    await db.collection("course_categories").doc(id).set(category);
    return category;
  }

  async updateCategory(
    id: string,
    data: { name?: string; slug?: string; description?: string | null; displayOrder?: number }
  ): Promise<CourseCategory> {
    const db = getDb();
    const existing = await this.getCategoryById(id);
    if (!existing) {
      const err: any = new Error("Category not found.");
      err.statusCode = 404;
      throw err;
    }

    if (data.name && data.name.trim() !== existing.name) {
      const conflict = await this.getCategoryByName(data.name.trim());
      if (conflict && conflict.id !== id) {
        const err: any = new Error(`A category with the name "${data.name}" already exists.`);
        err.statusCode = 409;
        throw err;
      }
    }

    const updated: CourseCategory = {
      ...existing,
      ...data,
      name: data.name ? data.name.trim() : existing.name,
      slug: data.slug ? data.slug.trim() : existing.slug,
      updatedAt: new Date().toISOString(),
    };

    await db.collection("course_categories").doc(id).set(updated);
    return updated;
  }

  async deleteCategory(id: string): Promise<void> {
    const db = getDb();
    const coursesSnap = await db
      .collection("courses")
      .where("categoryId", "==", id)
      .limit(1)
      .get();

    if (!coursesSnap.empty) {
      const err: any = new Error("Cannot delete category because active courses are assigned to it.");
      err.statusCode = 400;
      throw err;
    }

    await db.collection("course_categories").doc(id).delete();
  }

  // ==========================================
  // 3. COURSES & SYLLABUS MODULES
  // ==========================================

  private async attachCategoryAndSortModules(courseDoc: any): Promise<CourseWithDetails> {
    const data = courseDoc.data ? courseDoc.data() : courseDoc;
    const id = courseDoc.id || data.id;
    const modules: CourseModule[] = Array.isArray(data.modules) ? [...data.modules] : [];
    modules.sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));

    let category: CourseCategory | null = null;
    if (data.categoryId) {
      category = await this.getCategoryById(data.categoryId);
    }

    const defaultCategory: CourseCategory = {
      id: data.categoryId || "uncategorized",
      name: "General Technology",
      slug: "general-technology",
      description: null,
      displayOrder: 0,
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: data.updatedAt || new Date().toISOString(),
    };

    return {
      id,
      title: data.title,
      slug: data.slug,
      summary: data.summary,
      description: data.description,
      categoryId: data.categoryId,
      duration: data.duration,
      learningMode: data.learningMode || LearningMode.HYBRID,
      fees: data.fees !== undefined ? data.fees : null,
      isFeatured: Boolean(data.isFeatured),
      isPublished: Boolean(data.isPublished),
      isArchived: Boolean(data.isArchived),
      eligibility: data.eligibility || null,
      displayOrder: data.displayOrder || 0,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      modules,
      category: category || defaultCategory,
    };
  }

  async getPublicCourses(options?: {
    categorySlug?: string;
    search?: string;
  }): Promise<CourseWithDetails[]> {
    const db = getDb();
    let query = db
      .collection("courses")
      .where("isPublished", "==", true)
      .where("isArchived", "==", false);

    let targetCategoryId: string | null = null;
    if (options?.categorySlug) {
      const cat = await this.getCategoryBySlug(options.categorySlug);
      if (cat) {
        targetCategoryId = cat.id;
        query = query.where("categoryId", "==", cat.id);
      } else {
        // If category slug does not exist, return empty list
        return [];
      }
    }

    const snap = await query.get();
    let courses: CourseWithDetails[] = [];
    for (const doc of snap.docs) {
      const courseWithDetails = await this.attachCategoryAndSortModules(doc);
      courses.push(courseWithDetails);
    }

    // Text search filter if provided
    if (options?.search) {
      const term = options.search.toLowerCase().trim();
      courses = courses.filter(
        (c) =>
          c.title.toLowerCase().includes(term) ||
          c.summary.toLowerCase().includes(term) ||
          c.description.toLowerCase().includes(term) ||
          (c.category?.name && c.category.name.toLowerCase().includes(term))
      );
    }

    // Sort by displayOrder ascending, then createdAt descending
    courses.sort((a, b) => {
      if (a.displayOrder !== b.displayOrder) {
        return a.displayOrder - b.displayOrder;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return courses;
  }

  async getPublicCourseBySlug(slug: string): Promise<CourseWithDetails | null> {
    const db = getDb();
    const cleanSlug = slug.toLowerCase().trim();
    const snap = await db
      .collection("courses")
      .where("slug", "==", cleanSlug)
      .limit(1)
      .get();

    if (snap.empty) {
      return null;
    }

    const doc = snap.docs[0];
    const data = doc.data();

    // Must be published and not archived for public access
    if (!data.isPublished || data.isArchived) {
      return null;
    }

    return await this.attachCategoryAndSortModules(doc);
  }

  async getAllAdminCourses(): Promise<CourseWithDetails[]> {
    const db = getDb();
    const snap = await db.collection("courses").get();
    const courses: CourseWithDetails[] = [];
    for (const doc of snap.docs) {
      courses.push(await this.attachCategoryAndSortModules(doc));
    }

    courses.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return courses;
  }

  async getCourseById(id: string): Promise<CourseWithDetails | null> {
    const db = getDb();
    const doc = await db.collection("courses").doc(id).get();
    if (!doc.exists) {
      return null;
    }
    return await this.attachCategoryAndSortModules(doc);
  }

  async getCourseBySlug(slug: string): Promise<Course | null> {
    const db = getDb();
    const cleanSlug = slug.toLowerCase().trim();
    const snap = await db
      .collection("courses")
      .where("slug", "==", cleanSlug)
      .limit(1)
      .get();
    if (snap.empty) return null;
    const doc = snap.docs[0];
    return { id: doc.id, ...doc.data() } as Course;
  }

  async createCourse(data: {
    id?: string;
    title: string;
    slug: string;
    summary: string;
    description: string;
    categoryId: string;
    duration: string;
    learningMode?: LearningMode;
    fees?: number | null;
    isFeatured?: boolean;
    isPublished?: boolean;
    isArchived?: boolean;
    eligibility?: string | null;
    displayOrder?: number;
    modules?: Array<{
      id?: string;
      title: string;
      description?: string | null;
      topics?: string[];
      orderIndex?: number;
      durationHours?: number | null;
    }>;
    createdAt?: string;
    updatedAt?: string;
  }): Promise<CourseWithDetails> {
    const db = getDb();

    // 1. Validate Category exists
    const cat = await this.getCategoryById(data.categoryId);
    if (!cat) {
      const err: any = new Error(
        `Category with ID "${data.categoryId}" does not exist. Please select an existing category.`
      );
      err.statusCode = 400;
      err.code = "CATEGORY_NOT_FOUND";
      throw err;
    }

    // 2. Validate Slug uniqueness
    const cleanSlug = data.slug.toLowerCase().trim();
    const existingSlug = await this.getCourseBySlug(cleanSlug);
    if (existingSlug) {
      const err: any = new Error(
        `A course with URL slug "${cleanSlug}" already exists. Please choose a unique slug.`
      );
      err.statusCode = 409;
      err.code = "COURSE_SLUG_CONFLICT";
      throw err;
    }

    const courseId = data.id || generateId();
    const now = new Date().toISOString();

    const modules: CourseModule[] = (data.modules || []).map((m, idx) => ({
      id: m.id || generateId(),
      courseId,
      title: m.title.trim(),
      description: m.description || null,
      topics: Array.isArray(m.topics) ? m.topics : [],
      orderIndex: m.orderIndex !== undefined ? m.orderIndex : idx + 1,
      durationHours: m.durationHours !== undefined ? m.durationHours : null,
      createdAt: now,
      updatedAt: now,
    }));

    const courseData = {
      id: courseId,
      title: data.title.trim(),
      slug: cleanSlug,
      summary: data.summary.trim(),
      description: data.description.trim(),
      categoryId: data.categoryId,
      duration: data.duration.trim(),
      learningMode: data.learningMode || LearningMode.HYBRID,
      fees: data.fees !== undefined ? data.fees : null,
      isFeatured: Boolean(data.isFeatured),
      isPublished: data.isPublished !== undefined ? Boolean(data.isPublished) : true,
      isArchived: Boolean(data.isArchived),
      eligibility: data.eligibility || null,
      displayOrder: data.displayOrder ?? 0,
      modules,
      createdAt: data.createdAt || now,
      updatedAt: data.updatedAt || now,
    };

    await db.collection("courses").doc(courseId).set(courseData);
    return await this.attachCategoryAndSortModules(courseData);
  }

  async updateCourse(
    id: string,
    data: {
      title?: string;
      slug?: string;
      summary?: string;
      description?: string;
      categoryId?: string;
      duration?: string;
      learningMode?: LearningMode;
      fees?: number | null;
      isFeatured?: boolean;
      isPublished?: boolean;
      isArchived?: boolean;
      eligibility?: string | null;
      displayOrder?: number;
      modules?: Array<{
        id?: string;
        title: string;
        description?: string | null;
        topics?: string[];
        orderIndex?: number;
        durationHours?: number | null;
      }>;
    }
  ): Promise<CourseWithDetails> {
    const db = getDb();
    const existing = await this.getCourseById(id);
    if (!existing) {
      const err: any = new Error(`Course with ID "${id}" was not found.`);
      err.statusCode = 404;
      throw err;
    }

    // Slug check if changed
    let cleanSlug = existing.slug;
    if (data.slug && data.slug.toLowerCase().trim() !== existing.slug) {
      cleanSlug = data.slug.toLowerCase().trim();
      const conflict = await this.getCourseBySlug(cleanSlug);
      if (conflict && conflict.id !== id) {
        const err: any = new Error(
          `A course with URL slug "${cleanSlug}" already exists. Please choose a unique slug.`
        );
        err.statusCode = 409;
        throw err;
      }
    }

    // Category check if changed
    let categoryId = existing.categoryId;
    if (data.categoryId && data.categoryId !== existing.categoryId) {
      const cat = await this.getCategoryById(data.categoryId);
      if (!cat) {
        const err: any = new Error(
          `Category with ID "${data.categoryId}" does not exist.`
        );
        err.statusCode = 400;
        throw err;
      }
      categoryId = data.categoryId;
    }

    const now = new Date().toISOString();
    let modules = existing.modules;
    if (data.modules) {
      modules = data.modules.map((m, idx) => ({
        id: m.id || generateId(),
        courseId: id,
        title: m.title.trim(),
        description: m.description || null,
        topics: Array.isArray(m.topics) ? m.topics : [],
        orderIndex: m.orderIndex !== undefined ? m.orderIndex : idx + 1,
        durationHours: m.durationHours !== undefined ? m.durationHours : null,
        createdAt: existing.createdAt,
        updatedAt: now,
      }));
    }

    const updated = {
      ...existing,
      ...data,
      slug: cleanSlug,
      categoryId,
      modules,
      updatedAt: now,
    };

    await db.collection("courses").doc(id).set(updated);
    return await this.attachCategoryAndSortModules(updated);
  }

  async patchCourseStatus(
    id: string,
    partial: { isPublished?: boolean; isArchived?: boolean }
  ): Promise<CourseWithDetails> {
    const db = getDb();
    const course = await this.getCourseById(id);
    if (!course) {
      const err: any = new Error("Course not found");
      err.statusCode = 404;
      throw err;
    }

    const updateData: any = { updatedAt: new Date().toISOString() };
    if (partial.isPublished !== undefined) updateData.isPublished = Boolean(partial.isPublished);
    if (partial.isArchived !== undefined) updateData.isArchived = Boolean(partial.isArchived);

    await db.collection("courses").doc(id).update(updateData);
    return (await this.getCourseById(id))!;
  }

  async deleteCourse(id: string): Promise<void> {
    const db = getDb();
    await db.collection("courses").doc(id).delete();
  }

  // ==========================================
  // 4. ENQUIRIES & ADMISSIONS CRM
  // ==========================================

  async createEnquiry(data: {
    id?: string;
    enquiryNumber?: string;
    fullName: string;
    email: string;
    countryCode?: string;
    phone: string;
    courseId?: string | null;
    learningMode?: LearningMode | null;
    message: string;
    status?: EnquiryStatus;
    notes?: string | null;
    followUpDate?: string | null;
    consentGiven?: boolean;
    source?: string;
    createdAt?: string;
    updatedAt?: string;
  }): Promise<Enquiry> {
    const db = getDb();
    const id = data.id || generateId();
    const now = new Date().toISOString();
    const year = new Date().getFullYear();

    // 1. If explicit enquiryNumber was passed (e.g. migration / deterministic test data)
    if (data.enquiryNumber) {
      const enquiry: Enquiry = {
        id,
        enquiryNumber: data.enquiryNumber,
        fullName: data.fullName.trim(),
        email: data.email.toLowerCase().trim(),
        countryCode: data.countryCode || "+91",
        phone: data.phone.trim(),
        courseId: data.courseId || null,
        learningMode: data.learningMode || null,
        message: data.message.trim(),
        status: data.status || EnquiryStatus.NEW,
        notes: data.notes || null,
        followUpDate: data.followUpDate || null,
        consentGiven: data.consentGiven !== undefined ? data.consentGiven : true,
        source: data.source || "WEBSITE",
        createdAt: data.createdAt || now,
        updatedAt: data.updatedAt || now,
      };

      await db.collection("enquiries").doc(id).set(enquiry);
      return enquiry;
    }

    // 2. Collision-safe sequential generation inside a Firestore atomic transaction
    const counterRef = db.collection("counters").doc(`enquiries_${year}`);

    return await db.runTransaction(async (transaction) => {
      const counterDoc = await transaction.get(counterRef);
      let nextCount: number;

      if (!counterDoc.exists) {
        // Initialize sequence for the year
        // For 2026, legacy random 4-digit numbers occupied up to 9979. Starting at 10001 guarantees zero overlap.
        // For future years, 1001 provides a clean 4-digit sequence.
        nextCount = year === 2026 ? 10001 : 1001;
      } else {
        const current = counterDoc.data()?.lastNumber || (year === 2026 ? 10000 : 1000);
        nextCount = current + 1;
      }

      let assignedNumber = `VL-ENQ-${year}-${nextCount}`;

      // Verification against uniqueness registry to prevent collisions
      let lockRef = db.collection("enquiry_numbers").doc(assignedNumber);
      let lockDoc = await transaction.get(lockRef);

      while (lockDoc.exists) {
        nextCount++;
        assignedNumber = `VL-ENQ-${year}-${nextCount}`;
        lockRef = db.collection("enquiry_numbers").doc(assignedNumber);
        lockDoc = await transaction.get(lockRef);
      }

      const enquiryDocRef = db.collection("enquiries").doc(id);

      const enquiryRecord: Enquiry = {
        id,
        enquiryNumber: assignedNumber,
        fullName: data.fullName.trim(),
        email: data.email.toLowerCase().trim(),
        countryCode: data.countryCode || "+91",
        phone: data.phone.trim(),
        courseId: data.courseId || null,
        learningMode: data.learningMode || null,
        message: data.message.trim(),
        status: data.status || EnquiryStatus.NEW,
        notes: data.notes || null,
        followUpDate: data.followUpDate || null,
        consentGiven: data.consentGiven !== undefined ? data.consentGiven : true,
        source: data.source || "WEBSITE",
        createdAt: data.createdAt || now,
        updatedAt: data.updatedAt || now,
      };

      // Atomic commit of all three records
      transaction.set(
        counterRef,
        {
          year,
          lastNumber: nextCount,
          updatedAt: now,
        },
        { merge: true }
      );

      transaction.set(lockRef, {
        enquiryId: id,
        enquiryNumber: assignedNumber,
        createdAt: now,
      });

      transaction.set(enquiryDocRef, enquiryRecord);

      return enquiryRecord;
    });
  }

  async deleteEnquiry(id: string): Promise<boolean> {
    const db = getDb();
    const doc = await db.collection("enquiries").doc(id).get();
    if (!doc.exists) return false;
    const enquiry = doc.data() as Enquiry;
    if (enquiry?.enquiryNumber) {
      await db.collection("enquiry_numbers").doc(enquiry.enquiryNumber).delete().catch(() => {});
    }
    await db.collection("enquiries").doc(id).delete();
    return true;
  }

  async getEnquiryById(id: string): Promise<EnquiryWithDetails | null> {
    const db = getDb();
    const doc = await db.collection("enquiries").doc(id).get();
    if (!doc.exists) return null;

    const enquiry = { id: doc.id, ...doc.data() } as Enquiry;

    // Attach Course if courseId exists
    let course: Course | null = null;
    if (enquiry.courseId) {
      course = await this.getCourseById(enquiry.courseId);
    }

    // Fetch messages
    const messagesSnap = await db
      .collection("enquiry_messages")
      .where("enquiryId", "==", id)
      .get();
    const messages: EnquiryMessage[] = [];
    messagesSnap.forEach((mDoc) =>
      messages.push({ id: mDoc.id, ...mDoc.data() } as EnquiryMessage)
    );
    messages.sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    // Fetch email notifications
    const emailsSnap = await db
      .collection("email_notifications")
      .where("enquiryId", "==", id)
      .get();
    const emailNotifications: EmailNotification[] = [];
    emailsSnap.forEach((eDoc) =>
      emailNotifications.push({ id: eDoc.id, ...eDoc.data() } as EmailNotification)
    );
    emailNotifications.sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    return {
      ...enquiry,
      course,
      messages,
      emailNotifications,
    };
  }

  async getEnquiryByNumber(enquiryNumber: string): Promise<Enquiry | null> {
    const db = getDb();
    const snap = await db
      .collection("enquiries")
      .where("enquiryNumber", "==", enquiryNumber.trim())
      .limit(1)
      .get();
    if (snap.empty) return null;
    const doc = snap.docs[0];
    return { id: doc.id, ...doc.data() } as Enquiry;
  }

  async getAdminEnquiries(options?: {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    enquiries: EnquiryWithDetails[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const db = getDb();
    let query: Query = db.collection("enquiries");

    if (options?.status) {
      query = query.where("status", "==", options.status);
    }

    const snap = await query.get();
    let enquiries: Enquiry[] = [];
    snap.forEach((doc) => enquiries.push({ id: doc.id, ...doc.data() } as Enquiry));

    // Client-side search if provided
    if (options?.search) {
      const term = options.search.toLowerCase().trim();
      enquiries = enquiries.filter(
        (e) =>
          e.fullName.toLowerCase().includes(term) ||
          e.email.toLowerCase().includes(term) ||
          e.phone.toLowerCase().includes(term) ||
          e.enquiryNumber.toLowerCase().includes(term)
      );
    }

    // Sort by createdAt descending
    enquiries.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const total = enquiries.length;
    const page = Math.max(1, options?.page || 1);
    const limit = Math.max(1, options?.limit || 50);
    const totalPages = Math.ceil(total / limit) || 1;
    const paged = enquiries.slice((page - 1) * limit, page * limit);

    const enriched: EnquiryWithDetails[] = [];
    for (const enq of paged) {
      let course: Course | null = null;
      if (enq.courseId) {
        course = await this.getCourseById(enq.courseId);
      }
      enriched.push({
        ...enq,
        course,
        messages: [],
        emailNotifications: [],
      });
    }

    return {
      enquiries: enriched,
      total,
      page,
      totalPages,
    };
  }

  async updateEnquiryStatus(id: string, status: EnquiryStatus): Promise<Enquiry> {
    const db = getDb();
    const doc = await db.collection("enquiries").doc(id).get();
    if (!doc.exists) {
      const err: any = new Error("Enquiry not found");
      err.statusCode = 404;
      throw err;
    }
    const update = { status, updatedAt: new Date().toISOString() };
    await db.collection("enquiries").doc(id).update(update);
    return { id, ...(doc.data() as any), ...update };
  }

  async updateEnquiryNotes(
    id: string,
    notes: string | null,
    followUpDate?: string | null
  ): Promise<Enquiry> {
    const db = getDb();
    const doc = await db.collection("enquiries").doc(id).get();
    if (!doc.exists) {
      const err: any = new Error("Enquiry not found");
      err.statusCode = 404;
      throw err;
    }
    const update: any = {
      notes: notes || null,
      updatedAt: new Date().toISOString(),
    };
    if (followUpDate !== undefined) {
      update.followUpDate = followUpDate || null;
    }
    await db.collection("enquiries").doc(id).update(update);
    return { id, ...(doc.data() as any), ...update };
  }

  async addEnquiryMessage(data: {
    id?: string;
    enquiryId: string;
    senderRole?: string;
    senderEmail: string;
    recipientEmail: string;
    subject: string;
    body: string;
    channel?: MessageChannel;
    status?: MessageStatus;
    providerMessageId?: string | null;
    createdAt?: string;
  }): Promise<EnquiryMessage> {
    const db = getDb();
    const id = data.id || generateId();
    const msg: EnquiryMessage = {
      id,
      enquiryId: data.enquiryId,
      senderRole: data.senderRole || "ADMIN",
      senderEmail: data.senderEmail,
      recipientEmail: data.recipientEmail,
      subject: data.subject,
      body: data.body,
      channel: data.channel || MessageChannel.EMAIL,
      status: data.status || MessageStatus.SENT,
      providerMessageId: data.providerMessageId || null,
      createdAt: data.createdAt || new Date().toISOString(),
    };
    await db.collection("enquiry_messages").doc(id).set(msg);
    return msg;
  }

  async addEmailNotification(data: {
    id?: string;
    enquiryId: string;
    recipient: string;
    subject: string;
    status?: MessageStatus;
    providerMessageId?: string | null;
    errorMessage?: string | null;
    createdAt?: string;
  }): Promise<EmailNotification> {
    const db = getDb();
    const id = data.id || generateId();
    const notif: EmailNotification = {
      id,
      enquiryId: data.enquiryId,
      recipient: data.recipient,
      subject: data.subject,
      status: data.status || MessageStatus.SENT,
      providerMessageId: data.providerMessageId || null,
      errorMessage: data.errorMessage || null,
      createdAt: data.createdAt || new Date().toISOString(),
    };
    await db.collection("email_notifications").doc(id).set(notif);
    return notif;
  }

  async hasSentEmailNotification(enquiryId: string): Promise<boolean> {
    const db = getDb();
    const snap = await db
      .collection("email_notifications")
      .where("enquiryId", "==", enquiryId)
      .where("status", "==", MessageStatus.SENT)
      .limit(1)
      .get();
    return !snap.empty;
  }

  // ==========================================
  // 5. SITE SETTINGS, FAQS, TESTIMONIALS, FACULTY
  // ==========================================

  async getSiteSettings(): Promise<SiteSettings> {
    const db = getDb();
    const doc = await db.collection("site_settings").doc("default").get();
    if (doc.exists) {
      return { id: "default", ...doc.data() } as SiteSettings;
    }

    const defaultSettings: SiteSettings = {
      id: "default",
      instituteName: "VLEARNN",
      tagLine: "Practical IT & Advanced Technical Training",
      heroTitle: "Master Real-World IT Engineering with Industry Practitioners",
      heroSubtitle:
        "Cohort-based, production-grade training in Artificial Intelligence, Full Stack Engineering, Cloud DevOps, and Data Systems. Designed for ambitious professionals and engineers.",
      aboutStory:
        "VLEARNN was founded by seasoned software architects and engineering leaders with a clear mission: bridge the gap between theoretical classroom learning and high-stakes production engineering.",
      mission:
        "To empower learners with authentic, hands-on technical skills, production mental models, and career-defining competencies.",
      vision:
        "To become the gold standard in industry-integrated technical education across emerging technologies.",
      address:
        "VLEARNN Tech Campus, Level 4, Innovation Square, Tech Corridor, Bangalore 560103, India",
      phone: "+91 98765 43210",
      email: "admissions@vlearnn.com",
      whatsappNumber: "+919876543210",
      facebookUrl: "https://facebook.com/vlearnn",
      linkedinUrl: "https://linkedin.com/company/vlearnn",
      twitterUrl: "https://twitter.com/vlearnn",
      githubUrl: "https://github.com/vlearnn",
      updatedAt: new Date().toISOString(),
    };

    await db.collection("site_settings").doc("default").set(defaultSettings);
    return defaultSettings;
  }

  async updateSiteSettings(data: Partial<SiteSettings>): Promise<SiteSettings> {
    const db = getDb();
    const current = await this.getSiteSettings();
    const updated: SiteSettings = {
      ...current,
      ...data,
      id: "default",
      updatedAt: new Date().toISOString(),
    };
    await db.collection("site_settings").doc("default").set(updated);
    return updated;
  }

  async getFaqs(onlyPublished = true): Promise<FAQ[]> {
    const db = getDb();
    let query: Query = db.collection("faqs");
    if (onlyPublished) {
      query = query.where("isPublished", "==", true);
    }
    const snap = await query.get();
    const faqs: FAQ[] = [];
    snap.forEach((doc) => faqs.push({ id: doc.id, ...doc.data() } as FAQ));
    faqs.sort((a, b) => a.displayOrder - b.displayOrder);
    return faqs;
  }

  async createFaq(data: {
    id?: string;
    question: string;
    answer: string;
    category?: string;
    displayOrder?: number;
    isPublished?: boolean;
    createdAt?: string;
    updatedAt?: string;
  }): Promise<FAQ> {
    const db = getDb();
    const id = data.id || generateId();
    const now = new Date().toISOString();
    const faq: FAQ = {
      id,
      question: data.question.trim(),
      answer: data.answer.trim(),
      category: data.category?.trim() || "General",
      displayOrder: data.displayOrder ?? 0,
      isPublished: data.isPublished !== undefined ? Boolean(data.isPublished) : true,
      createdAt: data.createdAt || now,
      updatedAt: data.updatedAt || now,
    };
    await db.collection("faqs").doc(id).set(faq);
    return faq;
  }

  async updateFaq(id: string, data: Partial<FAQ>): Promise<FAQ> {
    const db = getDb();
    const doc = await db.collection("faqs").doc(id).get();
    if (!doc.exists) {
      const err: any = new Error("FAQ not found");
      err.statusCode = 404;
      throw err;
    }
    const updated = {
      ...(doc.data() as FAQ),
      ...data,
      id,
      updatedAt: new Date().toISOString(),
    };
    await db.collection("faqs").doc(id).set(updated);
    return updated;
  }

  async deleteFaq(id: string): Promise<void> {
    const db = getDb();
    await db.collection("faqs").doc(id).delete();
  }

  async getTestimonials(onlyPublished = true): Promise<Testimonial[]> {
    const db = getDb();
    let query: Query = db.collection("testimonials");
    if (onlyPublished) {
      query = query.where("isPublished", "==", true);
    }
    const snap = await query.get();
    const testimonials: Testimonial[] = [];
    snap.forEach((doc) =>
      testimonials.push({ id: doc.id, ...doc.data() } as Testimonial)
    );
    testimonials.sort((a, b) => a.displayOrder - b.displayOrder);
    return testimonials;
  }

  async createTestimonial(data: {
    id?: string;
    studentName: string;
    courseName: string;
    role: string;
    company: string;
    quote: string;
    rating?: number;
    displayOrder?: number;
    isPublished?: boolean;
    createdAt?: string;
    updatedAt?: string;
  }): Promise<Testimonial> {
    const db = getDb();
    const id = data.id || generateId();
    const now = new Date().toISOString();
    const testimonial: Testimonial = {
      id,
      studentName: data.studentName.trim(),
      courseName: data.courseName.trim(),
      role: data.role.trim(),
      company: data.company.trim(),
      quote: data.quote.trim(),
      rating: data.rating ?? 5,
      displayOrder: data.displayOrder ?? 0,
      isPublished: data.isPublished !== undefined ? Boolean(data.isPublished) : true,
      createdAt: data.createdAt || now,
      updatedAt: data.updatedAt || now,
    };
    await db.collection("testimonials").doc(id).set(testimonial);
    return testimonial;
  }

  async updateTestimonial(id: string, data: Partial<Testimonial>): Promise<Testimonial> {
    const db = getDb();
    const doc = await db.collection("testimonials").doc(id).get();
    if (!doc.exists) {
      const err: any = new Error("Testimonial not found");
      err.statusCode = 404;
      throw err;
    }
    const updated = {
      ...(doc.data() as Testimonial),
      ...data,
      id,
      updatedAt: new Date().toISOString(),
    };
    await db.collection("testimonials").doc(id).set(updated);
    return updated;
  }

  async deleteTestimonial(id: string): Promise<void> {
    const db = getDb();
    await db.collection("testimonials").doc(id).delete();
  }

  async getFaculty(onlyPublished = true): Promise<FacultyProfile[]> {
    const db = getDb();
    let query: Query = db.collection("faculty_profiles");
    if (onlyPublished) {
      query = query.where("isPublished", "==", true);
    }
    const snap = await query.get();
    const faculty: FacultyProfile[] = [];
    snap.forEach((doc) =>
      faculty.push({ id: doc.id, ...doc.data() } as FacultyProfile)
    );
    faculty.sort((a, b) => a.displayOrder - b.displayOrder);
    return faculty;
  }

  async createFaculty(data: {
    id?: string;
    name: string;
    title: string;
    bio: string;
    expertise: string[];
    yearsExperience: number;
    displayOrder?: number;
    isPublished?: boolean;
    createdAt?: string;
    updatedAt?: string;
  }): Promise<FacultyProfile> {
    const db = getDb();
    const id = data.id || generateId();
    const now = new Date().toISOString();
    const prof: FacultyProfile = {
      id,
      name: data.name.trim(),
      title: data.title.trim(),
      bio: data.bio.trim(),
      expertise: Array.isArray(data.expertise) ? data.expertise : [],
      yearsExperience: data.yearsExperience,
      displayOrder: data.displayOrder ?? 0,
      isPublished: data.isPublished !== undefined ? Boolean(data.isPublished) : true,
      createdAt: data.createdAt || now,
      updatedAt: data.updatedAt || now,
    };
    await db.collection("faculty_profiles").doc(id).set(prof);
    return prof;
  }

  // ==========================================
  // 6. ADMIN DASHBOARD METRICS
  // ==========================================

  async getDashboardMetrics(): Promise<{
    metrics: {
      totalEnquiries: number;
      newEnquiries: number;
      followUpsDue: number;
      enrolledStudents: number;
      publishedCourses: number;
    };
    recentEnquiries: EnquiryWithDetails[];
    courseWiseEnquiries: Array<{
      courseId: string;
      title: string;
      enquiryCount: number;
    }>;
  }> {
    const db = getDb();

    // 1. Fetch Enquiries
    const enqSnap = await db.collection("enquiries").get();
    const allEnquiries: Enquiry[] = [];
    enqSnap.forEach((doc) =>
      allEnquiries.push({ id: doc.id, ...doc.data() } as Enquiry)
    );

    let totalEnquiries = allEnquiries.length;
    let newEnquiries = 0;
    let followUpsDue = 0;
    let enrolledStudents = 0;
    const courseEnquiryCountMap: Record<string, number> = {};

    allEnquiries.forEach((e) => {
      if (e.status === EnquiryStatus.NEW) newEnquiries++;
      if (e.status === EnquiryStatus.FOLLOW_UP) followUpsDue++;
      if (e.status === EnquiryStatus.ENROLLED) enrolledStudents++;
      if (e.courseId) {
        courseEnquiryCountMap[e.courseId] =
          (courseEnquiryCountMap[e.courseId] || 0) + 1;
      }
    });

    // 2. Fetch Courses
    const coursesSnap = await db
      .collection("courses")
      .where("isPublished", "==", true)
      .where("isArchived", "==", false)
      .get();
    const publishedCourses = coursesSnap.size;

    const allCoursesList: Course[] = [];
    coursesSnap.forEach((doc) =>
      allCoursesList.push({ id: doc.id, ...doc.data() } as Course)
    );

    // 3. Recent enquiries (top 5, sorted by createdAt desc)
    allEnquiries.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    const topEnquiries = allEnquiries.slice(0, 5);
    const recentEnquiries: EnquiryWithDetails[] = [];
    for (const enq of topEnquiries) {
      let course: Course | null = null;
      if (enq.courseId) {
        course = await this.getCourseById(enq.courseId);
      }
      recentEnquiries.push({
        ...enq,
        course,
        messages: [],
        emailNotifications: [],
      });
    }

    // 4. Course-wise Enquiry Breakdown
    const courseWiseEnquiries = allCoursesList.map((c) => ({
      courseId: c.id,
      title: c.title,
      enquiryCount: courseEnquiryCountMap[c.id] || 0,
    }));
    courseWiseEnquiries.sort((a, b) => b.enquiryCount - a.enquiryCount);

    return {
      metrics: {
        totalEnquiries,
        newEnquiries,
        followUpsDue,
        enrolledStudents,
        publishedCourses,
      },
      recentEnquiries,
      courseWiseEnquiries,
    };
  }
}

export const firestoreService = new FirestoreService();

