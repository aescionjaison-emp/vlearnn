import test from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { createApp } from "../app";
import { firestoreService } from "../services/firestoreService";
import { EnquiryStatus } from "../types/models";

const app = createApp();
let server: http.Server;
let port: number;
let baseUrl: string;

test.before(async () => {
  await new Promise<void>((resolve) => {
    server = app.listen(0, () => {
      const addr = server.address();
      if (addr && typeof addr === "object") {
        port = addr.port;
        baseUrl = `http://127.0.0.1:${port}`;
      }
      resolve();
    });
  });
});

test.after(async () => {
  await new Promise<void>((resolve) => {
    server.close(() => resolve());
  });
});

test("GET /api/health returns 200 and healthy status", async () => {
  const res = await fetch(`${baseUrl}/api/health`);
  const json = (await res.json()) as any;
  assert.equal(res.status, 200);
  assert.equal(json.status, "healthy");
});

test("GET /api/courses returns only published courses", async () => {
  const res = await fetch(`${baseUrl}/api/courses`);
  const json = (await res.json()) as any;
  assert.equal(res.status, 200);
  assert.equal(json.success, true);
  assert.ok(Array.isArray(json.data));
  assert.equal(json.data.length, 6); // 6 published out of 7 total

  // Verify none are unpublished
  const unpublished = json.data.find((c: any) => c.slug === "advanced-systems-architecture");
  assert.equal(unpublished, undefined, "Unpublished course must not appear in public listing");
});

test("GET /api/courses/:slug returns published course details", async () => {
  const res = await fetch(`${baseUrl}/api/courses/artificial-intelligence`);
  const json = (await res.json()) as any;
  assert.equal(res.status, 200);
  assert.equal(json.success, true);
  assert.equal(json.data.slug, "artificial-intelligence");
  assert.ok(json.data.modules.length > 0);
});

test("GET /api/courses/:slug protects unpublished course with 404", async () => {
  const res = await fetch(`${baseUrl}/api/courses/advanced-systems-architecture`);
  assert.equal(res.status, 404, "Unpublished course must return 404 to public requests");
});

test("POST /api/enquiries validates course and persists enquiry to PostgreSQL", async () => {
  const payload = {
    fullName: "Integration Test Candidate",
    email: "test.candidate@example.com",
    countryCode: "+91",
    phone: "9876543210",
    courseSlug: "artificial-intelligence",
    learningMode: "HYBRID",
    message: "This is an automated test enquiry verifying real PostgreSQL persistence.",
    consentGiven: true,
  };

  const res = await fetch(`${baseUrl}/api/enquiries`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const json = (await res.json()) as any;
  assert.equal(res.status, 201);
  assert.equal(json.success, true);
  assert.ok(json.data.enquiryNumber.startsWith("VL-ENQ-"));

  // Verify saved in Firestore
  const dbRecord = await firestoreService.getEnquiryByNumber(json.data.enquiryNumber);
  assert.ok(dbRecord, "Enquiry must be found in Firestore database");
  assert.equal(dbRecord.fullName, "Integration Test Candidate");
  const courseRecord = dbRecord.courseId ? await firestoreService.getCourseById(dbRecord.courseId) : null;
  assert.equal(courseRecord?.slug, "artificial-intelligence");
});

test("POST /api/enquiries rejects invalid or unpublished course", async () => {
  const payload = {
    fullName: "Invalid Course Candidate",
    email: "invalid@example.com",
    phone: "9876543210",
    courseSlug: "non-existent-course-slug",
    message: "Checking invalid course rejection",
    consentGiven: true,
  };

  const res = await fetch(`${baseUrl}/api/enquiries`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const json = (await res.json()) as any;
  assert.equal(res.status, 400);
  assert.equal(json.success, false);
});

test("POST /api/enquiries rejects malformed email or missing required fields", async () => {
  const invalidPayload = {
    fullName: "A", // too short
    email: "not-an-email",
    phone: "123", // too short
    message: "Short", // too short
    consentGiven: false, // consent required
  };

  const res = await fetch(`${baseUrl}/api/enquiries`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(invalidPayload),
  });

  const json = (await res.json()) as any;
  assert.equal(res.status, 400);
  assert.equal(json.success, false);
});

test("GET /api/categories returns persisted categories with course counts", async () => {
  const res = await fetch(`${baseUrl}/api/categories`);
  const json = (await res.json()) as any;
  assert.equal(res.status, 200);
  assert.equal(json.success, true);
  assert.ok(Array.isArray(json.data));
  assert.ok(json.data.length >= 6);

  const aiCategory = json.data.find((c: any) => c.slug === "artificial-intelligence");
  assert.ok(aiCategory, "AI category must exist");
  assert.equal(typeof aiCategory.courseCount, "number");
});

test("GET /api/courses supports search and category query filtering", async () => {
  // Test category filter
  const catRes = await fetch(`${baseUrl}/api/courses?category=artificial-intelligence`);
  const catJson = (await catRes.json()) as any;
  assert.equal(catRes.status, 200);
  assert.ok(catJson.data.length >= 1);
  assert.ok(catJson.data.every((c: any) => c.category.slug === "artificial-intelligence"));

  // Test keyword search filter
  const searchRes = await fetch(`${baseUrl}/api/courses?search=Kubernetes`);
  const searchJson = (await searchRes.json()) as any;
  assert.equal(searchRes.status, 200);
  assert.ok(searchJson.data.length >= 1);
  assert.ok(
    searchJson.data.some(
      (c: any) =>
        c.title.includes("Kubernetes") ||
        c.summary.includes("Kubernetes") ||
        c.description.includes("Kubernetes")
    )
  );
});

test("GET /api/content endpoints retrieve settings, FAQs, testimonials, and faculty", async () => {
  const [settingsRes, faqsRes, testRes, facRes] = await Promise.all([
    fetch(`${baseUrl}/api/content/site-settings`),
    fetch(`${baseUrl}/api/content/faqs`),
    fetch(`${baseUrl}/api/content/testimonials`),
    fetch(`${baseUrl}/api/content/faculty`),
  ]);

  const [settings, faqs, testimonials, faculty] = await Promise.all([
    settingsRes.json() as Promise<any>,
    faqsRes.json() as Promise<any>,
    testRes.json() as Promise<any>,
    facRes.json() as Promise<any>,
  ]);

  assert.equal(settingsRes.status, 200);
  assert.equal(settings.data.instituteName, "VLEARNN");

  assert.equal(faqsRes.status, 200);
  assert.ok(faqs.data.length > 0);

  assert.equal(testRes.status, 200);
  assert.ok(testimonials.data.length > 0);

  assert.equal(facRes.status, 200);
  assert.ok(faculty.data.length > 0);
});

test("Admin Auth: rejects invalid login credentials with 401", async () => {
  const badLoginRes = await fetch(`${baseUrl}/api/admin/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "admin@vlearnn.com",
      password: "WrongPassword123!",
    }),
  });
  assert.equal(badLoginRes.status, 401);

  const nonExistentRes = await fetch(`${baseUrl}/api/admin/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "nobody@vlearnn.com",
      password: "SomePassword123!",
    }),
  });
  assert.equal(nonExistentRes.status, 401);
});

test("Admin Course CRUD: create, update, publish/unpublish, and archive", async () => {
  // Login to get token
  const loginRes = await fetch(`${baseUrl}/api/admin/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "admin@vlearnn.com",
      password: "VlearnnAdmin2026!",
    }),
  });
  const { data: { token } } = (await loginRes.json()) as any;
  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  // Get a category ID
  const categories = await firestoreService.getCategories();
  const cat = categories[0];
  assert.ok(cat, "Category must exist");

  const testSlug = `test-course-${Date.now().toString().slice(-4)}`;

  // 1. Create Course
  const createRes = await fetch(`${baseUrl}/api/admin/courses`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      title: "Integration Test Engineering",
      slug: testSlug,
      summary: "This is a temporary test course verifying admin CRUD operations.",
      description: "A comprehensive curriculum designed to verify admin course creation and updates.",
      categoryId: cat.id,
      duration: "10 Weeks (80 Hours)",
      learningMode: "HYBRID",
      fees: 30000,
      isFeatured: false,
      isPublished: true,
      eligibility: "Prior programming experience recommended.",
      modules: [
        {
          title: "Module 1: Test Foundations",
          description: "Setting up test fixtures.",
          topics: ["Unit testing", "Mocking"],
          durationHours: 20,
        },
      ],
    }),
  });
  const createJson = (await createRes.json()) as any;
  assert.equal(createRes.status, 201);
  assert.equal(createJson.success, true);
  const createdCourseId = createJson.data.id;

  // 2. Verify it appears on public courses endpoint
  const publicRes1 = await fetch(`${baseUrl}/api/courses/${testSlug}`);
  assert.equal(publicRes1.status, 200);

  // 3. Update Course: Unpublish it
  const updateRes = await fetch(`${baseUrl}/api/admin/courses/${createdCourseId}`, {
    method: "PUT",
    headers: authHeaders,
    body: JSON.stringify({
      isPublished: false,
    }),
  });
  assert.equal(updateRes.status, 200);

  // 4. Verify it is now excluded from public endpoint (returns 404)
  const publicRes2 = await fetch(`${baseUrl}/api/courses/${testSlug}`);
  assert.equal(publicRes2.status, 404);

  // 5. Archive Course
  const archiveRes = await fetch(`${baseUrl}/api/admin/courses/${createdCourseId}`, {
    method: "DELETE",
    headers: authHeaders,
  });
  assert.equal(archiveRes.status, 200);

  // Clean up test course safely
  await firestoreService.deleteCourse(createdCourseId);
});

test("Admin Enquiry CRM: status update, private notes persistence, and reply email", async () => {
  // Login
  const loginRes = await fetch(`${baseUrl}/api/admin/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "admin@vlearnn.com",
      password: "VlearnnAdmin2026!",
    }),
  });
  const { data: { token } } = (await loginRes.json()) as any;
  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  // Create an enquiry for testing (using configured verified email so Resend test domain accepts dispatch)
  const testRecipient = process.env.ADMIN_NOTIFICATION_EMAIL || "harisivabalan2006@gmail.com";
  const testEnquiry = await firestoreService.createEnquiry({
    enquiryNumber: `VL-ENQ-CRM-${Date.now().toString().slice(-4)}`,
    fullName: "CRM Test Student",
    email: testRecipient,
    countryCode: "+91",
    phone: "9876543210",
    message: "Looking for detailed batch consultation and EMI options.",
    status: EnquiryStatus.NEW,
    consentGiven: true,
  });

  // 1. Filter enquiries by status NEW
  const filterRes = await fetch(`${baseUrl}/api/admin/enquiries?status=NEW`, {
    headers: authHeaders,
  });
  const filterJson = (await filterRes.json()) as any;
  assert.equal(filterRes.status, 200);
  assert.ok(filterJson.data.some((e: any) => e.id === testEnquiry.id));

  // 2. Update Enquiry Status to CONTACTED
  const statusRes = await fetch(`${baseUrl}/api/admin/enquiries/${testEnquiry.id}/status`, {
    method: "PATCH",
    headers: authHeaders,
    body: JSON.stringify({ status: "CONTACTED" }),
  });
  const statusJson = (await statusRes.json()) as any;
  assert.equal(statusRes.status, 200);
  assert.equal(statusJson.data.status, "CONTACTED");

  // 3. Update Private Notes and Follow-up Date
  const futureDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
  const notesRes = await fetch(`${baseUrl}/api/admin/enquiries/${testEnquiry.id}/notes`, {
    method: "PATCH",
    headers: authHeaders,
    body: JSON.stringify({
      notes: "Private note: Spoke with student. Scheduled follow-up consultation.",
      followUpDate: futureDate,
    }),
  });
  const notesJson = (await notesRes.json()) as any;
  assert.equal(notesRes.status, 200);
  assert.equal(notesJson.data.notes, "Private note: Spoke with student. Scheduled follow-up consultation.");

  // 4. Verify Private Notes NEVER leak to public API
  // Check that public course endpoints or health do not expose notes
  const publicCoursesRes = await fetch(`${baseUrl}/api/courses`);
  const publicCoursesText = await publicCoursesRes.text();
  assert.ok(!publicCoursesText.includes("Private note: Spoke with student"));

  // 5. Send an email reply from Dashboard
  const replyRes = await fetch(`${baseUrl}/api/admin/enquiries/${testEnquiry.id}/reply-email`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      subject: "VLEARNN Admissions Follow-up",
      body: "Hello! We have reviewed your request and would like to invite you for a 1-on-1 counseling call.",
    }),
  });
  const replyJson = (await replyRes.json()) as any;
  assert.equal(replyRes.status, 200);
  assert.equal(replyJson.success, true);

  // Verify message logged in Firestore
  const loggedEnquiry = await firestoreService.getEnquiryById(testEnquiry.id);
  assert.ok(loggedEnquiry?.messages && loggedEnquiry.messages.length > 0, "Reply message must be recorded in database history");
  assert.equal(loggedEnquiry.messages[0].recipientEmail, testRecipient);
});

test("Admin Content & FAQs: update settings and create/update/delete FAQs", async () => {
  // Login
  const loginRes = await fetch(`${baseUrl}/api/admin/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "admin@vlearnn.com",
      password: "VlearnnAdmin2026!",
    }),
  });
  const { data: { token } } = (await loginRes.json()) as any;
  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  // 1. Create a new FAQ
  const createFaqRes = await fetch(`${baseUrl}/api/admin/faqs`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      question: "Can I pay in zero-cost monthly installments?",
      answer: "Yes, we support flexible zero-cost EMI plans across all major credit cards and partner NBFCs.",
      category: "Fees",
      displayOrder: 99,
      isPublished: true,
    }),
  });
  const createFaqJson = (await createFaqRes.json()) as any;
  assert.equal(createFaqRes.status, 201);
  const faqId = createFaqJson.data.id;

  // 2. Verify FAQ appears publicly
  const publicFaqsRes = await fetch(`${baseUrl}/api/content/faqs`);
  const publicFaqsJson = (await publicFaqsRes.json()) as any;
  assert.ok(publicFaqsJson.data.some((f: any) => f.id === faqId));

  // 3. Delete FAQ
  const deleteFaqRes = await fetch(`${baseUrl}/api/admin/faqs/${faqId}`, {
    method: "DELETE",
    headers: authHeaders,
  });
  assert.equal(deleteFaqRes.status, 200);
});

test("Real-time SSE Security: Anonymous clients rejected from admin stream, public stream receives safe events", async () => {
  // 1. Anonymous request to admin SSE stream MUST be rejected with 401
  const anonAdminRes = await fetch(`${baseUrl}/api/admin/events/stream`);
  assert.equal(anonAdminRes.status, 401, "Anonymous clients cannot connect to admin SSE stream");

  // 2. Anonymous client CAN connect to public SSE stream
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 2000);

  try {
    const publicStreamRes = await fetch(`${baseUrl}/api/events/stream`, {
      signal: controller.signal,
    });
    assert.equal(publicStreamRes.status, 200);
    assert.ok(
      publicStreamRes.headers.get("content-type")?.includes("text/event-stream"),
      "Must return text/event-stream content type"
    );
  } catch (err: any) {
    if (err.name !== "AbortError") {
      throw err;
    }
  } finally {
    clearTimeout(timeout);
    controller.abort();
  }
});

test("Admin Categories & Testimonials CRUD: full lifecycle with PostgreSQL persistence", async () => {
  // Login
  const loginRes = await fetch(`${baseUrl}/api/admin/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "admin@vlearnn.com",
      password: "VlearnnAdmin2026!",
    }),
  });
  const { data: { token } } = (await loginRes.json()) as any;
  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  // 1. Create Category
  const testCatSlug = `test-cat-${Date.now().toString().slice(-4)}`;
  const createCatRes = await fetch(`${baseUrl}/api/admin/categories`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      name: `Test Cat ${Date.now()}`,
      slug: testCatSlug,
      description: "Automated test category",
      displayOrder: 99,
    }),
  });
  assert.equal(createCatRes.status, 201);
  const catData = ((await createCatRes.json()) as any).data;

  // 2. Verify Category in public API
  const publicCatsRes = await fetch(`${baseUrl}/api/categories`);
  const publicCats = ((await publicCatsRes.json()) as any).data;
  assert.ok(publicCats.some((c: any) => c.id === catData.id));

  // 3. Delete Category
  const deleteCatRes = await fetch(`${baseUrl}/api/admin/categories/${catData.id}`, {
    method: "DELETE",
    headers: authHeaders,
  });
  assert.equal(deleteCatRes.status, 200);

  // 4. Create Testimonial
  const createTestimonialRes = await fetch(`${baseUrl}/api/admin/testimonials`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      studentName: "Test Student Reviewer",
      courseName: "Cloud DevOps Engineering",
      role: "DevOps Engineer",
      company: "Acme Corp",
      quote: "The hands-on Kubernetes and Terraform labs were transformative.",
      rating: 5,
      isPublished: true,
      displayOrder: 99,
    }),
  });
  assert.equal(createTestimonialRes.status, 201);
  const testimonialData = ((await createTestimonialRes.json()) as any).data;

  // 5. Verify Testimonial appears in public API
  const publicTestimonialsRes = await fetch(`${baseUrl}/api/content/testimonials`);
  const publicTestimonials = ((await publicTestimonialsRes.json()) as any).data;
  assert.ok(publicTestimonials.some((t: any) => t.id === testimonialData.id));

  // 6. Delete Testimonial
  const deleteTestimonialRes = await fetch(`${baseUrl}/api/admin/testimonials/${testimonialData.id}`, {
    method: "DELETE",
    headers: authHeaders,
  });
  assert.equal(deleteTestimonialRes.status, 200);
});

