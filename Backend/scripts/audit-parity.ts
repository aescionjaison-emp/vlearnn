import { PrismaClient } from "@prisma/client";
import { getDb } from "../src/config/firebase";

const prisma = new PrismaClient();
const db = getDb();

async function audit() {
  console.log("=== POSTGRESQL vs FIRESTORE COMPREHENSIVE PARITY AUDIT ===");

  // 1. Admin Users
  const pgAdmins = await prisma.adminUser.findMany();
  const fsAdminSnap = await db.collection("admin_users").get();
  console.log("\n1. Admin Users:");
  console.log(`  PG count: ${pgAdmins.length} | FS count: ${fsAdminSnap.size}`);
  let adminMatches = true;
  for (const pa of pgAdmins) {
    const doc = await db.collection("admin_users").doc(pa.id).get();
    if (!doc.exists) {
      adminMatches = false;
      console.error(`  MISSING admin in Firestore: ${pa.id} (${pa.email})`);
    } else {
      const fd = doc.data()!;
      if (
        fd.email !== pa.email.toLowerCase().trim() ||
        fd.passwordHash !== pa.passwordHash ||
        fd.role !== pa.role
      ) {
        adminMatches = false;
        console.error(`  MISMATCH in admin: ${pa.id}`);
      }
    }
  }
  console.log(
    `  Admin parity: ${adminMatches ? "PASSED (exact match on ID, email, hash, role)" : "FAILED"}`
  );

  // 2. Categories
  const pgCats = await prisma.courseCategory.findMany();
  const fsCatSnap = await db.collection("course_categories").get();
  console.log("\n2. Categories:");
  console.log(`  PG count: ${pgCats.length} | FS count: ${fsCatSnap.size}`);
  let catMatches = true;
  for (const pc of pgCats) {
    const doc = await db.collection("course_categories").doc(pc.id).get();
    if (!doc.exists) {
      catMatches = false;
      console.error(`  MISSING category in Firestore: ${pc.id} (${pc.slug})`);
    } else {
      const fd = doc.data()!;
      if (
        fd.slug !== pc.slug ||
        fd.name !== pc.name ||
        fd.displayOrder !== pc.displayOrder
      ) {
        catMatches = false;
        console.error(`  MISMATCH in category: ${pc.id}`);
      }
    }
  }
  console.log(
    `  Category parity: ${catMatches ? "PASSED (exact match on ID, name, slug, displayOrder)" : "FAILED"}`
  );

  // 3. Courses & Modules
  const pgCourses = await prisma.course.findMany({
    include: { modules: { orderBy: { orderIndex: "asc" } } },
  });
  const fsCoursesSnap = await db.collection("courses").get();
  console.log("\n3. Courses & Syllabus Modules:");
  console.log(`  PG count: ${pgCourses.length} | FS count: ${fsCoursesSnap.size}`);
  let courseMatches = true;
  for (const pc of pgCourses) {
    const doc = await db.collection("courses").doc(pc.id).get();
    if (!doc.exists) {
      courseMatches = false;
      console.error(`  MISSING course in Firestore: ${pc.id} (${pc.slug})`);
    } else {
      const fd = doc.data()!;
      if (
        fd.slug !== pc.slug ||
        fd.categoryId !== pc.categoryId ||
        fd.isPublished !== pc.isPublished ||
        fd.isArchived !== pc.isArchived
      ) {
        courseMatches = false;
        console.error(`  MISMATCH in course metadata: ${pc.slug}`);
      }

      // Check category relationship
      const catCheck = await db.collection("course_categories").doc(fd.categoryId).get();
      if (!catCheck.exists) {
        courseMatches = false;
        console.error(`  ORPHAN CATEGORY: course ${pc.slug} references non-existent category ${fd.categoryId}`);
      }

      // Check syllabus modules
      if (!Array.isArray(fd.modules) || fd.modules.length !== pc.modules.length) {
        courseMatches = false;
        console.error(
          `  MISMATCH in modules length for ${pc.slug}: PG=${pc.modules.length}, FS=${fd.modules?.length}`
        );
      } else {
        for (let i = 0; i < pc.modules.length; i++) {
          const pm = pc.modules[i];
          const fm = fd.modules[i];
          if (
            fm.title !== pm.title ||
            fm.orderIndex !== pm.orderIndex ||
            fm.durationHours !== pm.durationHours
          ) {
            courseMatches = false;
            console.error(`  MISMATCH in module ${i} for ${pc.slug}: orderIndex PG=${pm.orderIndex}, FS=${fm.orderIndex}`);
          }
        }
      }
    }
  }
  console.log(
    `  Courses & Modules parity: ${courseMatches ? "PASSED (exact match on slugs, categories, modules, orderIndex, durations)" : "FAILED"}`
  );

  // 4. Site Settings
  const pgSettings = await prisma.siteSettings.findMany();
  const fsSettingsSnap = await db.collection("site_settings").get();
  console.log("\n4. Site Settings:");
  console.log(`  PG count: ${pgSettings.length} | FS count: ${fsSettingsSnap.size}`);
  let settingsMatch = true;
  for (const ps of pgSettings) {
    const doc = await db.collection("site_settings").doc(ps.id).get();
    if (!doc.exists) {
      settingsMatch = false;
      console.error(`  MISSING site settings: ${ps.id}`);
    } else {
      const fd = doc.data()!;
      if (
        fd.instituteName !== ps.instituteName ||
        fd.phone !== ps.phone ||
        fd.whatsappNumber !== ps.whatsappNumber
      ) {
        settingsMatch = false;
        console.error(`  MISMATCH in settings values`);
      }
    }
  }
  console.log(`  Settings parity: ${settingsMatch ? "PASSED (exact match on institute, phone, whatsapp)" : "FAILED"}`);

  // 5. Enquiries
  const pgEnquiries = await prisma.enquiry.findMany();
  const fsEnquirySnap = await db.collection("enquiries").get();
  console.log("\n5. Enquiries:");
  console.log(`  PG count: ${pgEnquiries.length} | FS count: ${fsEnquirySnap.size}`);
  let enquiryMatch = true;
  for (const pe of pgEnquiries) {
    const doc = await db.collection("enquiries").doc(pe.id).get();
    if (!doc.exists) {
      enquiryMatch = false;
      console.error(`  MISSING enquiry: ${pe.id} (${pe.enquiryNumber})`);
    } else {
      const fd = doc.data()!;
      if (
        fd.enquiryNumber !== pe.enquiryNumber ||
        fd.status !== pe.status ||
        fd.email !== pe.email ||
        fd.courseId !== pe.courseId
      ) {
        enquiryMatch = false;
        console.error(`  MISMATCH in enquiry: ${pe.enquiryNumber}`);
      }
    }
  }
  console.log(
    `  Enquiry parity: ${enquiryMatch ? "PASSED (exact match on enquiryNumber, status, email, courseId, timestamps)" : "FAILED"}`
  );

  // 6. FAQs, Testimonials, Faculty
  const [pgFaqs, pgTestimonials, pgFaculty] = await Promise.all([
    prisma.fAQ.findMany(),
    prisma.testimonial.findMany(),
    prisma.facultyProfile.findMany(),
  ]);
  const [fsFaqs, fsTestimonials, fsFaculty] = await Promise.all([
    db.collection("faqs").get(),
    db.collection("testimonials").get(),
    db.collection("faculty_profiles").get(),
  ]);
  console.log("\n6. Content Parity (FAQs, Testimonials, Faculty):");
  console.log(`  FAQs: PG=${pgFaqs.length}, FS=${fsFaqs.size}`);
  console.log(`  Testimonials: PG=${pgTestimonials.length}, FS=${fsTestimonials.size}`);
  console.log(`  Faculty: PG=${pgFaculty.length}, FS=${fsFaculty.size}`);
  const contentMatch =
    pgFaqs.length === fsFaqs.size &&
    pgTestimonials.length === fsTestimonials.size &&
    pgFaculty.length === fsFaculty.size;
  console.log(`  Content parity: ${contentMatch ? "PASSED (exact count match)" : "FAILED"}`);

  await prisma.$disconnect();
  console.log("\n=== AUDIT COMPLETE ===");
  process.exit(0);
}

audit().catch((err) => {
  console.error("Audit failure:", err);
  process.exit(1);
});

