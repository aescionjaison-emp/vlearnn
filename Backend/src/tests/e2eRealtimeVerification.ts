import assert from "node:assert/strict";
import http from "node:http";
import { firestoreService } from "../services/firestoreService";

const API_BASE = "http://localhost:5000/api";

function sseSubscriber(url: string, token?: string) {
  const eventsReceived: Array<{ event: string; data: any }> = [];
  let req: http.ClientRequest | null = null;
  let isClosed = false;

  const promise = new Promise<void>((resolve, reject) => {
    const fullUrl = new URL(url);
    if (token) fullUrl.searchParams.set("token", token);

    req = http.get(fullUrl.toString(), (res) => {
      if (res.statusCode !== 200) {
        return reject(new Error(`SSE connection failed with status: ${res.statusCode}`));
      }

      let buffer = "";
      res.on("data", (chunk) => {
        buffer += chunk.toString();
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const block of lines) {
          if (!block.trim() || block.startsWith(":")) continue; // Skip pings/comments
          let eventName = "message";
          let dataStr = "";

          for (const line of block.split("\n")) {
            if (line.startsWith("event: ")) {
              eventName = line.slice(7).trim();
            } else if (line.startsWith("data: ")) {
              dataStr = line.slice(6).trim();
            }
          }

          try {
            const data = JSON.parse(dataStr);
            eventsReceived.push({ event: eventName, data });
          } catch {
            eventsReceived.push({ event: eventName, data: dataStr });
          }
        }
      });

      res.on("end", () => {
        isClosed = true;
      });

      resolve();
    });

    req.on("error", (err) => {
      if (!isClosed) reject(err);
    });
  });

  return {
    ready: promise,
    getEvents: () => [...eventsReceived],
    clearEvents: () => {
      eventsReceived.length = 0;
    },
    waitForEvent: async (expectedEvent: string, timeoutMs = 4000) => {
      const start = Date.now();
      while (Date.now() - start < timeoutMs) {
        const found = eventsReceived.find((e) => e.event === expectedEvent);
        if (found) return found;
        await new Promise((r) => setTimeout(r, 50));
      }
      throw new Error(`Timed out waiting for SSE event: ${expectedEvent}`);
    },
    close: () => {
      isClosed = true;
      if (req) req.destroy();
    },
  };
}

async function runVerification() {
  console.log("=== VLEARNN REAL-TIME PUBLISHING & E2E VERIFICATION ===");

  // 1. Authenticate Admin Session
  console.log("[1/14] Authenticating Admin Session...");
  const loginRes = await fetch(`${API_BASE}/admin/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "admin@vlearnn.com",
      password: "VlearnnAdmin2026!",
    }),
  });
  assert.equal(loginRes.status, 200, "Admin login must succeed");
  const loginJson = (await loginRes.json()) as any;
  const adminToken = loginJson.data.token;
  const adminHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${adminToken}`,
  };
  console.log("  ✔ Admin authenticated as SUPER_ADMIN");

  // 2. Establish Public Visitor Session (Subscribes to Public SSE Stream)
  console.log("[2/14] Connecting Public Visitor SSE Session to /api/events/stream...");
  const publicSubscriber = sseSubscriber(`${API_BASE}/events/stream`);
  await publicSubscriber.ready;
  // Wait for initial connection event
  await new Promise((r) => setTimeout(r, 200));
  console.log("  ✔ Public Visitor SSE session connected and active");

  // 3. Establish Admin SSE Subscriber to verify isolation
  const adminSubscriber = sseSubscriber(`${API_BASE}/admin/events/stream`, adminToken);
  await adminSubscriber.ready;
  await new Promise((r) => setTimeout(r, 200));
  console.log("  ✔ Admin SSE session connected");

  // 4. Verify Anonymous Client cannot access Admin SSE stream
  console.log("[3/14] Testing Security: Anonymous client cannot connect to Admin SSE Stream...");
  const anonRes = await fetch(`${API_BASE}/admin/events/stream`);
  assert.equal(anonRes.status, 401, "Admin SSE stream must reject anonymous access");
  console.log("  ✔ Anonymous client rejected with HTTP 401");

  // Get a category for creating courses
  const categoriesRes = await fetch(`${API_BASE}/categories`);
  const categoriesJson = (await categoriesRes.json()) as any;
  const defaultCategory = categoriesJson.data[0];

  const uniqueSuffix = Date.now().toString().slice(-5);
  const testSlug = `e2e-live-course-${uniqueSuffix}`;

  // 5. Create Draft Course: Must remain hidden publicly
  console.log("[4/14] Creating Draft Course (isPublished: false)...");
  publicSubscriber.clearEvents();
  const createDraftRes = await fetch(`${API_BASE}/admin/courses`, {
    method: "POST",
    headers: adminHeaders,
    body: JSON.stringify({
      title: `E2E Live Draft Course ${uniqueSuffix}`,
      slug: testSlug,
      summary: "Draft course summary for testing real-time publishing workflow.",
      description: "Detailed description for draft course testing with long content for verification.",
      categoryId: defaultCategory.id,
      duration: "12 Weeks",
      learningMode: "HYBRID",
      fees: 45000,
      isFeatured: false,
      isPublished: false, // DRAFT
      modules: [
        {
          title: "Module 1: Foundations",
          description: "Core principles",
          topics: ["Architecture", "CLI"],
          durationHours: 20,
        },
      ],
    }),
  });
  assert.equal(createDraftRes.status, 201, "Draft course creation must return 201");
  const createdCourse = ((await createDraftRes.json()) as any).data;
  const courseId = createdCourse.id;

  // Verify NOT visible in public courses listing
  const pubCoursesAfterDraft = await (await fetch(`${API_BASE}/courses`)).json() as any;
  assert.ok(
    !pubCoursesAfterDraft.data.some((c: any) => c.id === courseId),
    "Draft course must NOT appear in public courses listing"
  );

  // Verify slug route returns 404 for draft
  const draftSlugRes = await fetch(`${API_BASE}/courses/${testSlug}`);
  assert.equal(draftSlugRes.status, 404, "Draft course slug must return 404 publicly");
  console.log("  ✔ Draft course is strictly hidden from public listings and slug returns 404");

  // 6. Publish Course: Public visitor session must receive courses_updated without refreshing
  console.log("[5/14] Publishing Course (isPublished: true)...");
  publicSubscriber.clearEvents();
  const publishRes = await fetch(`${API_BASE}/admin/courses/${courseId}`, {
    method: "PUT",
    headers: adminHeaders,
    body: JSON.stringify({ isPublished: true }),
  });
  assert.equal(publishRes.status, 200, "Publish update must return 200");

  // Await real-time event on public visitor session
  const publishEvent = await publicSubscriber.waitForEvent("courses_updated");
  assert.ok(publishEvent, "Public visitor must receive courses_updated event");
  assert.equal(publishEvent.data.courseId, courseId);
  console.log("  ✔ Public visitor SSE received live 'courses_updated' event:", publishEvent.data);

  // Visitor immediately refetches public courses
  const pubCoursesAfterPublish = await (await fetch(`${API_BASE}/courses`)).json() as any;
  assert.ok(
    pubCoursesAfterPublish.data.some((c: any) => c.id === courseId),
    "Published course must now appear in public courses listing"
  );

  // Visitor fetches course detail page
  const pubSlugRes = await fetch(`${API_BASE}/courses/${testSlug}`);
  assert.equal(pubSlugRes.status, 200, "Published course slug must now return 200");
  const pubSlugData = ((await pubSlugRes.json()) as any).data;
  assert.equal(pubSlugData.title, `E2E Live Draft Course ${uniqueSuffix}`);
  console.log("  ✔ Course is now live on public website and detail page returns 200");

  // 7. Edit Published Course: Details update automatically
  console.log("[6/14] Editing Published Course Details...");
  publicSubscriber.clearEvents();
  const updatedTitle = `E2E Edited Masterclass ${uniqueSuffix}`;
  const updatedSummary = "This summary has been updated live from the admin dashboard.";
  const editRes = await fetch(`${API_BASE}/admin/courses/${courseId}`, {
    method: "PUT",
    headers: adminHeaders,
    body: JSON.stringify({
      title: updatedTitle,
      summary: updatedSummary,
    }),
  });
  assert.equal(editRes.status, 200);

  await publicSubscriber.waitForEvent("courses_updated");
  const pubDetailAfterEdit = await (await fetch(`${API_BASE}/courses/${testSlug}`)).json() as any;
  assert.equal(pubDetailAfterEdit.data.title, updatedTitle);
  assert.equal(pubDetailAfterEdit.data.summary, updatedSummary);
  console.log("  ✔ Live course detail successfully updated without manual reload");

  // 8. Unpublish Course: Disappears from listings and slug returns 404
  console.log("[7/14] Unpublishing Course (isPublished: false)...");
  publicSubscriber.clearEvents();
  const unpublishRes = await fetch(`${API_BASE}/admin/courses/${courseId}`, {
    method: "PUT",
    headers: adminHeaders,
    body: JSON.stringify({ isPublished: false }),
  });
  assert.equal(unpublishRes.status, 200);

  await publicSubscriber.waitForEvent("courses_updated");
  const pubCoursesAfterUnpublish = await (await fetch(`${API_BASE}/courses`)).json() as any;
  assert.ok(
    !pubCoursesAfterUnpublish.data.some((c: any) => c.id === courseId),
    "Unpublished course must disappear from public listings"
  );
  const unpubSlugRes = await fetch(`${API_BASE}/courses/${testSlug}`);
  assert.equal(unpubSlugRes.status, 404, "Unpublished course slug must return 404");
  console.log("  ✔ Unpublished course removed from public listings and slug returns 404");

  // 9. Category Management & Real-Time Sync
  console.log("[8/14] Creating Category and testing public update...");
  publicSubscriber.clearEvents();
  const catSlug = `cat-live-${uniqueSuffix}`;
  const createCatRes = await fetch(`${API_BASE}/admin/categories`, {
    method: "POST",
    headers: adminHeaders,
    body: JSON.stringify({
      name: `Realtime Category ${uniqueSuffix}`,
      slug: catSlug,
      description: "Category created to test real-time public updates",
      displayOrder: 99,
    }),
  });
  assert.equal(createCatRes.status, 201);
  const createdCat = ((await createCatRes.json()) as any).data;

  const catEvent = await publicSubscriber.waitForEvent("categories_updated");
  assert.equal(catEvent.data.action, "CREATE");

  const pubCats = await (await fetch(`${API_BASE}/categories`)).json() as any;
  assert.ok(pubCats.data.some((c: any) => c.id === createdCat.id));
  console.log("  ✔ Category created and broadcasted 'categories_updated' to public visitor");

  // Delete category
  publicSubscriber.clearEvents();
  const deleteCatRes = await fetch(`${API_BASE}/admin/categories/${createdCat.id}`, {
    method: "DELETE",
    headers: adminHeaders,
  });
  assert.equal(deleteCatRes.status, 200);
  await publicSubscriber.waitForEvent("categories_updated");
  console.log("  ✔ Category deleted and broadcasted update to public visitor");

  // 10. FAQs Management & Real-Time Sync
  console.log("[9/14] Creating FAQ and testing public update...");
  publicSubscriber.clearEvents();
  const createFaqRes = await fetch(`${API_BASE}/admin/faqs`, {
    method: "POST",
    headers: adminHeaders,
    body: JSON.stringify({
      question: `Are live cohorts recorded for revision? (${uniqueSuffix})`,
      answer: "Yes, all interactive laboratory walkthroughs and architectural discussions are recorded in 4K.",
      category: "Admissions",
      displayOrder: 1,
      isPublished: true,
    }),
  });
  assert.equal(createFaqRes.status, 201);
  const createdFaq = ((await createFaqRes.json()) as any).data;

  await publicSubscriber.waitForEvent("faqs_updated");
  const pubFaqs = await (await fetch(`${API_BASE}/content/faqs`)).json() as any;
  assert.ok(pubFaqs.data.some((f: any) => f.id === createdFaq.id));
  console.log("  ✔ FAQ created and broadcasted 'faqs_updated' to public visitor");

  // Clean up FAQ
  await fetch(`${API_BASE}/admin/faqs/${createdFaq.id}`, {
    method: "DELETE",
    headers: adminHeaders,
  });

  // 11. Testimonials Management & Real-Time Sync
  console.log("[10/14] Creating Testimonial and testing public update...");
  publicSubscriber.clearEvents();
  const createTestimonialRes = await fetch(`${API_BASE}/admin/testimonials`, {
    method: "POST",
    headers: adminHeaders,
    body: JSON.stringify({
      studentName: `Student ${uniqueSuffix}`,
      courseName: "Applied Artificial Intelligence",
      role: "Staff AI Engineer",
      company: "Apex Tech",
      quote: "The deep dive into vector embeddings and transformer attention was world-class.",
      rating: 5,
      isPublished: true,
      displayOrder: 1,
    }),
  });
  assert.equal(createTestimonialRes.status, 201);
  const createdTestimonial = ((await createTestimonialRes.json()) as any).data;

  await publicSubscriber.waitForEvent("testimonials_updated");
  const pubTestimonials = await (await fetch(`${API_BASE}/content/testimonials`)).json() as any;
  assert.ok(pubTestimonials.data.some((t: any) => t.id === createdTestimonial.id));
  console.log("  ✔ Testimonial created and broadcasted 'testimonials_updated' to public visitor");

  // Clean up Testimonial
  await fetch(`${API_BASE}/admin/testimonials/${createdTestimonial.id}`, {
    method: "DELETE",
    headers: adminHeaders,
  });

  // 12. Site Content & Contact/WhatsApp Settings
  console.log("[11/14] Updating Site Content & Public Contact/WhatsApp Settings...");
  publicSubscriber.clearEvents();
  const testHeadline = `Master Production IT Engineering (${uniqueSuffix})`;
  const testWhatsApp = "919988776655";
  const testPhone = "+91 99887 76655";
  const testEmail = "admissions.live@vlearnn.com";

  const settingsRes = await fetch(`${API_BASE}/admin/content/site-settings`, {
    method: "PUT",
    headers: adminHeaders,
    body: JSON.stringify({
      heroTitle: testHeadline,
      phone: testPhone,
      email: testEmail,
      whatsappNumber: testWhatsApp,
    }),
  });
  assert.equal(settingsRes.status, 200);

  await publicSubscriber.waitForEvent("site_content_updated");
  await publicSubscriber.waitForEvent("public_settings_updated");

  const pubSettings = await (await fetch(`${API_BASE}/content/site-settings`)).json() as any;
  assert.equal(pubSettings.data.heroTitle, testHeadline);
  assert.equal(pubSettings.data.whatsappNumber, testWhatsApp);
  assert.equal(pubSettings.data.phone, testPhone);
  assert.equal(pubSettings.data.email, testEmail);
  console.log("  ✔ Site settings and WhatsApp phone updated and verified publicly");

  // 13. Privacy & Security: Public client NEVER receives private student enquiry data
  console.log("[12/14] Verifying Public SSE stream NEVER receives private enquiry data...");
  publicSubscriber.clearEvents();
  adminSubscriber.clearEvents();

  const newEnquiryRes = await fetch(`${API_BASE}/enquiries`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fullName: "Confidential Student",
      email: "confidential.student@example.com",
      phone: "9876543210",
      countryCode: "+91",
      message: "This is a private enquiry message that must never leak publicly.",
      consentGiven: true,
    }),
  });
  assert.equal(newEnquiryRes.status, 201);
  const enquiryJson = (await newEnquiryRes.json()) as any;
  const enquiryNumber = enquiryJson.data.enquiryNumber;

  // Admin subscriber MUST receive new_enquiry
  const adminEnquiryEvent = await adminSubscriber.waitForEvent("new_enquiry");
  assert.ok(adminEnquiryEvent, "Admin dashboard must receive new_enquiry event");
  assert.equal(adminEnquiryEvent.data.enquiryNumber, enquiryNumber);

  // Give short window to confirm public subscriber received ZERO enquiry events
  await new Promise((r) => setTimeout(r, 400));
  const publicEvents = publicSubscriber.getEvents();
  const leakedEnquiry = publicEvents.find(
    (e) => e.event === "new_enquiry" || JSON.stringify(e).includes("confidential")
  );
  assert.equal(leakedEnquiry, undefined, "Public visitor stream MUST NEVER receive enquiry events");
  console.log("  ✔ Security verified: Admin received 'new_enquiry', public visitor received ZERO private data");

  // Clean up enquiry
  const enqToDelete = await firestoreService.getEnquiryByNumber(enquiryNumber);
  if (enqToDelete) {
    const { getDb } = await import("../config/firebase");
    await getDb().collection("enquiries").doc(enqToDelete.id).delete();
  }

  // 14. Failed Database Operations MUST NOT broadcast successful events
  console.log("[13/14] Verifying failed database operations do NOT broadcast events...");
  publicSubscriber.clearEvents();
  const failRes = await fetch(`${API_BASE}/admin/courses`, {
    method: "POST",
    headers: adminHeaders,
    body: JSON.stringify({
      title: "Bad Course",
      slug: "invalid", // duplicate or missing required fields
    }),
  });
  assert.ok(failRes.status >= 400, "Invalid payload must be rejected");
  await new Promise((r) => setTimeout(r, 400));
  assert.equal(
    publicSubscriber.getEvents().length,
    0,
    "No event should be broadcast when database operation fails"
  );
  console.log("  ✔ Verified: Rejected request emitted ZERO broadcast events");

  // Clean up test course from database
  await firestoreService.deleteCourse(courseId);

  // Reset site settings to standard default values
  await fetch(`${API_BASE}/admin/content/site-settings`, {
    method: "PUT",
    headers: adminHeaders,
    body: JSON.stringify({
      heroTitle: "Master Real-World IT Engineering with Industry Practitioners",
      phone: "+91 98765 43210",
      email: "admissions@vlearnn.com",
      whatsappNumber: "+919876543210",
    }),
  });

  // Close SSE connections
  publicSubscriber.close();
  adminSubscriber.close();

  console.log("[14/14] ALL 14/14 REAL-TIME PUBLISHING & SYNCHRONIZATION SCENARIOS VERIFIED SUCCESSFULLY!");
}

runVerification()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error("Verification failed:", err);
    process.exit(1);
  });

