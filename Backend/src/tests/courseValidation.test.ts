import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { createApp } from "../app";
import { firestoreService } from "../services/firestoreService";
import http from "http";

let server: http.Server;
let baseUrl: string;
let adminToken: string;
let testCategoryId: string;

before(async () => {
  const app = createApp();
  await new Promise<void>((resolve) => {
    server = app.listen(0, () => {
      const port = (server.address() as any).port;
      baseUrl = `http://localhost:${port}`;
      resolve();
    });
  });

  // Login as admin
  const loginRes = await fetch(`${baseUrl}/api/admin/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "admin@vlearnn.com",
      password: "VlearnnAdmin2026!",
    }),
  });
  assert.equal(loginRes.status, 200);
  const loginData = (await loginRes.json()) as any;
  adminToken = loginData.data.token;

  // Retrieve an active test category
  const categories = await firestoreService.getCategories();
  assert.ok(categories.length > 0, "Database must have at least one test category");
  testCategoryId = categories[0].id;
});

after(async () => {
  if (server) {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
});

test("Course Validation: rejects unauthorized requests without token", async () => {
  const res = await fetch(`${baseUrl}/api/admin/courses`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: "Unauthorized Test" }),
  });
  assert.equal(res.status, 401);
  const data = (await res.json()) as any;
  assert.equal(data.success, false);
});

test("Course Validation: rejects missing required fields with structured 400 error", async () => {
  const res = await fetch(`${baseUrl}/api/admin/courses`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({}),
  });
  assert.equal(res.status, 400);
  const data = (await res.json()) as any;
  assert.equal(data.success, false);
  assert.equal(data.error?.code, "VALIDATION_ERROR");
  assert.ok(data.error?.fields?.title, "Must identify missing title");
  assert.ok(data.error?.fields?.slug, "Must identify missing slug");
  assert.ok(data.error?.fields?.categoryId, "Must identify missing categoryId");
  assert.ok(data.error?.fields?.summary, "Must identify missing summary");
  assert.ok(data.error?.fields?.description, "Must identify missing description");
  assert.ok(data.error?.fields?.duration, "Must identify missing duration");
});

test("Course Validation: rejects invalid category UUID format", async () => {
  const res = await fetch(`${baseUrl}/api/admin/courses`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({
      title: "Test AI Engineering",
      slug: "test-ai-engineering-invalid-cat",
      categoryId: "not-a-valid-uuid",
      summary: "Comprehensive test program for enterprise engineers.",
      description: "Rigorous curriculum covering deep technical skills.",
      duration: "12 Weeks",
    }),
  });
  assert.equal(res.status, 400);
  const data = (await res.json()) as any;
  assert.equal(data.success, false);
  assert.ok(data.error?.fields?.categoryId);
});

test("Course Validation: rejects non-existent category UUID", async () => {
  const nonExistentId = "00000000-0000-0000-0000-000000000000";
  const res = await fetch(`${baseUrl}/api/admin/courses`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({
      title: "Non Existent Category Course",
      slug: "non-existent-cat-course",
      categoryId: nonExistentId,
      summary: "Comprehensive test program for enterprise engineers.",
      description: "Rigorous curriculum covering deep technical skills.",
      duration: "12 Weeks",
    }),
  });
  assert.equal(res.status, 400);
  const data = (await res.json()) as any;
  assert.equal(data.success, false);
  assert.ok(data.error?.fields?.categoryId);
});

test("Course Validation: rejects invalid learning mode enum", async () => {
  const res = await fetch(`${baseUrl}/api/admin/courses`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({
      title: "Invalid Learning Mode Course",
      slug: "invalid-learning-mode-course",
      categoryId: testCategoryId,
      learningMode: "SELF_PACED_RECORDINGS", // invalid enum value
      summary: "Comprehensive test program for enterprise engineers.",
      description: "Rigorous curriculum covering deep technical skills.",
      duration: "12 Weeks",
    }),
  });
  assert.equal(res.status, 400);
  const data = (await res.json()) as any;
  assert.equal(data.success, false);
  assert.ok(data.error?.fields?.learningMode);
});

test("Course Validation: rejects negative tuition fees", async () => {
  const res = await fetch(`${baseUrl}/api/admin/courses`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({
      title: "Negative Fees Course",
      slug: "negative-fees-course",
      categoryId: testCategoryId,
      fees: -5000,
      summary: "Comprehensive test program for enterprise engineers.",
      description: "Rigorous curriculum covering deep technical skills.",
      duration: "12 Weeks",
    }),
  });
  assert.equal(res.status, 400);
  const data = (await res.json()) as any;
  assert.equal(data.success, false);
  assert.ok(data.error?.fields?.fees);
});

test("Course Validation: accepts 0 fees for scholarship / free courses", async () => {
  const freeSlug = `free-scholarship-${Date.now().toString().slice(-4)}`;
  const res = await fetch(`${baseUrl}/api/admin/courses`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({
      title: "Free Open Source Workshop",
      slug: freeSlug,
      categoryId: testCategoryId,
      fees: 0,
      summary: "Community technical workshop with zero fees.",
      description: "Deep dive into open source tooling and practical workflows.",
      duration: "2 Weeks",
      modules: [],
    }),
  });
  assert.equal(res.status, 201);
  const data = (await res.json()) as any;
  assert.equal(data.success, true);
  assert.equal(data.data.fees, 0);

  // Clean up
  const freeCourse = await firestoreService.getCourseBySlug(freeSlug);
  if (freeCourse) await firestoreService.deleteCourse(freeCourse.id);
});

test("Course Validation: rejects duplicate URL slug with 409 Conflict", async () => {
  const testSlug = `conflict-slug-${Date.now().toString().slice(-4)}`;

  // Create first course
  const res1 = await fetch(`${baseUrl}/api/admin/courses`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({
      title: "First Course With Slug",
      slug: testSlug,
      categoryId: testCategoryId,
      summary: "First course summary for conflict test.",
      description: "First course description for conflict test verification.",
      duration: "8 Weeks",
    }),
  });
  assert.equal(res1.status, 201);
  const created1 = (await res1.json()) as any;

  // Try creating second course with exact same slug
  const res2 = await fetch(`${baseUrl}/api/admin/courses`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({
      title: "Second Course With Same Slug",
      slug: testSlug,
      categoryId: testCategoryId,
      summary: "Second course summary for conflict test.",
      description: "Second course description for conflict test verification.",
      duration: "10 Weeks",
    }),
  });
  assert.equal(res2.status, 409);
  const data2 = (await res2.json()) as any;
  assert.equal(data2.success, false);
  assert.equal(data2.error?.code, "CONFLICT");
  assert.ok(data2.error?.fields?.slug, "Must flag slug field error");

  // Clean up
  await firestoreService.deleteCourse(created1.data.id);
});

test("Course Validation: rejects invalid syllabus module (title too short)", async () => {
  const res = await fetch(`${baseUrl}/api/admin/courses`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({
      title: "Invalid Module Course",
      slug: "invalid-module-course",
      categoryId: testCategoryId,
      summary: "Comprehensive test program for enterprise engineers.",
      description: "Rigorous curriculum covering deep technical skills.",
      duration: "12 Weeks",
      modules: [
        {
          title: "X", // < 2 characters
          description: "Invalid title module",
          topics: ["Topic 1"],
        },
      ],
    }),
  });
  assert.equal(res.status, 400);
  const data = (await res.json()) as any;
  assert.equal(data.success, false);
  assert.ok(
    data.error?.fields?.["modules.0.title"],
    "Must identify error in module title"
  );
});

test("Course Persistence: atomically creates course with multiple syllabus modules", async () => {
  const testSlug = `atomic-course-${Date.now().toString().slice(-4)}`;

  const res = await fetch(`${baseUrl}/api/admin/courses`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({
      title: "Atomic Systems Architecture",
      slug: testSlug,
      categoryId: testCategoryId,
      summary: "Enterprise distributed systems cohort.",
      description: "Hands-on labs building scalable, fault-tolerant cloud systems.",
      duration: "16 Weeks",
      learningMode: "HYBRID",
      fees: 48000,
      isFeatured: true,
      isPublished: true,
      modules: [
        {
          title: "Module 1: Domain-Driven Design",
          description: "Bounded contexts and strategic design.",
          topics: ["Entities", "Value Objects", "Aggregates"],
          durationHours: 30,
        },
        {
          title: "Module 2: Event-Driven Architectures",
          description: "Kafka event logs and transactional outboxes.",
          topics: ["Kafka", "CQRS", "Idempotent Consumers"],
          durationHours: 40,
        },
      ],
    }),
  });

  assert.equal(res.status, 201);
  const data = (await res.json()) as any;
  assert.equal(data.success, true);
  assert.equal(data.data.modules.length, 2);
  assert.equal(data.data.modules[0].orderIndex, 1);
  assert.equal(data.data.modules[1].orderIndex, 2);

  // Verify in Firestore directly
  const savedCourse = await firestoreService.getCourseBySlug(testSlug);
  assert.ok(savedCourse, "Course must be persisted in Firestore");
  const fullCourse = await firestoreService.getCourseById(savedCourse.id);
  assert.equal(fullCourse?.modules.length, 2);

  // Clean up
  await firestoreService.deleteCourse(savedCourse.id);
});

test("Regression Reproduction: admin form submission with empty optional fields succeeds cleanly", async () => {
  const testSlug = `clean-form-${Date.now().toString().slice(-4)}`;

  // This replicates what the admin UI sends when fees is "", eligibility is "", and module description is empty
  const res = await fetch(`${baseUrl}/api/admin/courses`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({
      title: "Regression Verified Course",
      slug: testSlug,
      categoryId: testCategoryId,
      summary: "Valid summary for regression test verifying optional field normalization.",
      description: "Valid description satisfying minimum character length requirements.",
      duration: "14 Weeks (100 Hours)",
      learningMode: "HYBRID",
      fees: null, // empty fees converted to null
      eligibility: null, // empty eligibility converted to null
      isFeatured: false,
      isPublished: true,
      modules: [
        {
          title: "Module 1: Foundations",
          description: null, // empty description
          topics: ["Topic A", "Topic B"],
          durationHours: 25,
        },
      ],
    }),
  });

  assert.equal(res.status, 201);
  const data = (await res.json()) as any;
  assert.equal(data.success, true);
  assert.equal(data.data.fees, null);
  assert.equal(data.data.eligibility, null);

  // Verify public endpoint visibility
  const publicRes = await fetch(`${baseUrl}/api/courses/${testSlug}`);
  assert.equal(publicRes.status, 200);

  // Clean up
  await firestoreService.deleteCourse(data.data.id);
});

