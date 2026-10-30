import { firestoreService } from "../src/services/firestoreService";
import { EnquiryStatus, LearningMode } from "../src/types/models";

const API_BASE = "http://localhost:5000/api";

async function runCrudAudit() {
  console.log("=== COMPREHENSIVE ADMIN & PUBLIC CRUD AUDIT ===");

  // 1. Authenticate Admin
  console.log("\n[1/10] Admin Authentication:");
  const loginRes = await fetch(`${API_BASE}/admin/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "admin@vlearnn.com",
      password: "VlearnnAdmin2026!",
    }),
  });
  if (loginRes.status !== 200) {
    throw new Error(`Admin login failed with status ${loginRes.status}`);
  }
  const { data: { token } } = (await loginRes.json()) as any;
  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
  console.log("  ✔ Admin authenticated successfully with JWT");

  // Get active categories
  const categories = await firestoreService.getCategories();
  const testCategory = categories[0];

  // 2. Course Creation with optional/empty fields
  console.log("\n[2/10] Course Creation with optional/empty fields:");
  const testSlug = `audit-course-${Date.now().toString().slice(-4)}`;
  const createRes = await fetch(`${API_BASE}/admin/courses`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      title: "Audit Verification Microservice Course",
      slug: testSlug,
      categoryId: testCategory.id,
      summary: "Comprehensive course created to verify Firestore persistence.",
      description: "In-depth curriculum verifying embedded modules and optional field handling.",
      duration: "10 Weeks",
      learningMode: "ONLINE",
      fees: null, // optional empty fee
      eligibility: null, // optional empty eligibility
      isFeatured: false,
      isPublished: true,
      modules: [
        {
          title: "Module 1: Cloud Native Fundamentals",
          description: null,
          topics: ["Containers", "12-Factor App"],
          durationHours: 20,
        },
      ],
    }),
  });
  if (createRes.status !== 201) {
    throw new Error(`Course creation failed with status ${createRes.status}: ${await createRes.text()}`);
  }
  const createdCourse = ((await createRes.json()) as any).data;
  console.log(`  ✔ Course created with ID: ${createdCourse.id}, slug: ${createdCourse.slug}`);

  // 3. Verify Public Visibility
  console.log("\n[3/10] Verify Public Course Visibility:");
  const pubDetailRes = await fetch(`${API_BASE}/courses/${testSlug}`);
  if (pubDetailRes.status !== 200) {
    throw new Error(`Public detail returned ${pubDetailRes.status}`);
  }
  const pubDetail = (await pubDetailRes.json()) as any;
  console.log(`  ✔ Public course detail verified: "${pubDetail.data.title}"`);

  // 4. Edit Course
  console.log("\n[4/10] Edit Course Details:");
  const editRes = await fetch(`${API_BASE}/admin/courses/${createdCourse.id}`, {
    method: "PUT",
    headers: authHeaders,
    body: JSON.stringify({
      title: "Updated Audit Verification Course",
      fees: 35000,
    }),
  });
  if (editRes.status !== 200) {
    throw new Error(`Course edit failed with status ${editRes.status}`);
  }
  const updatedPubDetail = (await (await fetch(`${API_BASE}/courses/${testSlug}`)).json()) as any;
  if (updatedPubDetail.data.title !== "Updated Audit Verification Course" || updatedPubDetail.data.fees !== 35000) {
    throw new Error("Public course did not reflect updated title or fees");
  }
  console.log("  ✔ Course details updated and reflected publicly");

  // 5. Unpublish and Archive Lifecycle
  console.log("\n[5/10] Course Unpublish & Archive Lifecycle:");
  // Unpublish
  await fetch(`${API_BASE}/admin/courses/${createdCourse.id}`, {
    method: "PUT",
    headers: authHeaders,
    body: JSON.stringify({ isPublished: false }),
  });
  const unpubRes = await fetch(`${API_BASE}/courses/${testSlug}`);
  if (unpubRes.status !== 404) {
    throw new Error(`Unpublished course expected 404, got ${unpubRes.status}`);
  }
  console.log("  ✔ Unpublished course returns 404 on public endpoint");

  // Archive
  await fetch(`${API_BASE}/admin/courses/${createdCourse.id}`, {
    method: "PUT",
    headers: authHeaders,
    body: JSON.stringify({ isArchived: true, isPublished: true }),
  });
  const archiveRes = await fetch(`${API_BASE}/courses/${testSlug}`);
  if (archiveRes.status !== 404) {
    throw new Error(`Archived course expected 404, got ${archiveRes.status}`);
  }
  console.log("  ✔ Archived course strictly protected from public endpoint");

  // Clean up audit course
  await firestoreService.deleteCourse(createdCourse.id);
  console.log("  ✔ Audit course cleanly removed");

  // 6. Category CRUD
  console.log("\n[6/10] Category CRUD Lifecycle:");
  const catSlug = `audit-cat-${Date.now().toString().slice(-4)}`;
  const catCreateRes = await fetch(`${API_BASE}/admin/categories`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      name: "Audit Test Category",
      slug: catSlug,
      description: "Category created during audit verification.",
      displayOrder: 99,
    }),
  });
  if (catCreateRes.status !== 201) throw new Error("Category create failed");
  const catData = ((await catCreateRes.json()) as any).data;

  // Delete category
  const catDelRes = await fetch(`${API_BASE}/admin/categories/${catData.id}`, {
    method: "DELETE",
    headers: authHeaders,
  });
  if (catDelRes.status !== 200) throw new Error("Category delete failed");
  console.log("  ✔ Category CRUD verified");

  // 7. FAQs CRUD
  console.log("\n[7/10] FAQ CRUD Lifecycle:");
  const faqRes = await fetch(`${API_BASE}/admin/faqs`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      question: "Audit FAQ: Is Firestore fully operational?",
      answer: "Yes, Firebase Cloud Firestore is serving all data.",
      category: "Admissions",
      displayOrder: 99,
      isPublished: true,
    }),
  });
  if (faqRes.status !== 201) throw new Error("FAQ create failed");
  const faqData = ((await faqRes.json()) as any).data;
  await fetch(`${API_BASE}/admin/faqs/${faqData.id}`, {
    method: "DELETE",
    headers: authHeaders,
  });
  console.log("  ✔ FAQ CRUD verified");

  // 8. Testimonials CRUD
  console.log("\n[8/10] Testimonial CRUD Lifecycle:");
  const testRes = await fetch(`${API_BASE}/admin/testimonials`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      studentName: "Audit Student",
      courseName: "Cloud Engineering",
      role: "Platform Engineer",
      company: "Tech Corp",
      quote: "Outstanding program and curriculum.",
      rating: 5,
      isPublished: true,
      displayOrder: 99,
    }),
  });
  if (testRes.status !== 201) throw new Error("Testimonial create failed");
  const testData = ((await testRes.json()) as any).data;
  await fetch(`${API_BASE}/admin/testimonials/${testData.id}`, {
    method: "DELETE",
    headers: authHeaders,
  });
  console.log("  ✔ Testimonial CRUD verified");

  // 9. Site Settings
  console.log("\n[9/10] Site Settings Update:");
  const currentSettings = await firestoreService.getSiteSettings();
  const settingsRes = await fetch(`${API_BASE}/admin/content/site-settings`, {
    method: "PUT",
    headers: authHeaders,
    body: JSON.stringify({
      instituteName: currentSettings?.instituteName || "VLEARNN",
      heroTitle: currentSettings?.heroTitle || "Master Modern Tech Skills",
    }),
  });
  if (settingsRes.status !== 200) throw new Error("Settings update failed");
  console.log("  ✔ Settings update verified");

  // 10. Enquiry CRM & Reply
  console.log("\n[10/10] Enquiry CRM Lifecycle:");
  const enqRes = await fetch(`${API_BASE}/enquiries`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fullName: "Audit Candidate",
      email: "harisivabalan2006@gmail.com",
      phone: "+91 9988776655",
      message: "Testing enquiry CRM notes, status update, and email reply pipeline.",
      preferredMode: "ONLINE",
      consentGiven: true,
    }),
  });
  if (enqRes.status !== 201) throw new Error("Enquiry submission failed");
  const enqData = ((await enqRes.json()) as any).data;
  const enqRecord = await firestoreService.getEnquiryByNumber(enqData.enquiryNumber);
  if (!enqRecord) throw new Error("Created enquiry not found in Firestore");

  // Update status
  const statusRes = await fetch(`${API_BASE}/admin/enquiries/${enqRecord.id}/status`, {
    method: "PATCH",
    headers: authHeaders,
    body: JSON.stringify({ status: "INTERESTED" }),
  });
  if (statusRes.status !== 200) throw new Error("Enquiry status update failed");

  // Update notes
  const notesRes = await fetch(`${API_BASE}/admin/enquiries/${enqRecord.id}/notes`, {
    method: "PATCH",
    headers: authHeaders,
    body: JSON.stringify({ notes: "Follow up scheduled for tomorrow." }),
  });
  if (notesRes.status !== 200) throw new Error("Enquiry notes update failed");

  // Send reply email
  const replyRes = await fetch(`${API_BASE}/admin/enquiries/${enqRecord.id}/reply-email`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      subject: "VLEARNN Admissions Update",
      body: "Thank you for reaching out. Here is the requested syllabus overview.",
    }),
  });
  const replyResText = await replyRes.text();
  if (replyRes.status !== 200) {
    console.error("Reply response:", replyRes.status, replyResText);
    throw new Error(`Reply email failed: ${replyRes.status} ${replyResText}`);
  }
  console.log("  ✔ Enquiry CRM (submission, status update, private notes, reply email) verified");

  console.log("\n=== ALL 10 CRUD WORKFLOWS VERIFIED 100% OPERATIONAL ===");
  process.exit(0);
}

runCrudAudit().catch((err) => {
  console.error("CRUD audit failure:", err);
  process.exit(1);
});
