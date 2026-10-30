import fs from "fs";
import path from "path";
import { getDb } from "../src/config/firebase";

const db = getDb();

async function auditBackupParity() {
  console.log("=== PRE-MIGRATION BACKUP vs FIRESTORE COMPREHENSIVE AUDIT ===");

  const backupPath = path.resolve(
    __dirname,
    "../backups/postgres-backup-2026-10-29T09-03-55-493Z.json"
  );
  const backup = JSON.parse(fs.readFileSync(backupPath, "utf8"));

  // 1. Admin Users
  console.log("\n1. Admin Users:");
  console.log(`  Backup count: ${backup.data.adminUsers.length}`);
  let adminMatches = true;
  for (const bu of backup.data.adminUsers) {
    const doc = await db.collection("admin_users").doc(bu.id).get();
    if (!doc.exists) {
      adminMatches = false;
      console.error(`  MISSING Admin: ${bu.id}`);
    } else {
      const fd = doc.data()!;
      if (
        fd.email !== bu.email.toLowerCase().trim() ||
        fd.passwordHash !== bu.passwordHash ||
        fd.role !== bu.role
      ) {
        adminMatches = false;
        console.error(`  MISMATCH in Admin: ${bu.id}`);
      }
    }
  }
  console.log(`  Admin Users Parity: ${adminMatches ? "100% MATCH" : "FAILED"}`);

  // 2. Course Categories
  console.log("\n2. Course Categories:");
  console.log(`  Backup count: ${backup.data.categories.length}`);
  let catMatches = true;
  for (const bc of backup.data.categories) {
    const doc = await db.collection("course_categories").doc(bc.id).get();
    if (!doc.exists) {
      catMatches = false;
      console.error(`  MISSING Category: ${bc.id}`);
    } else {
      const fd = doc.data()!;
      if (
        fd.slug !== bc.slug ||
        fd.name !== bc.name ||
        fd.displayOrder !== bc.displayOrder
      ) {
        catMatches = false;
        console.error(`  MISMATCH in Category: ${bc.id}`);
      }
    }
  }
  console.log(`  Course Categories Parity: ${catMatches ? "100% MATCH" : "FAILED"}`);

  // 3. Courses & Syllabus Modules
  console.log("\n3. Courses & Modules:");
  console.log(`  Backup count: ${backup.data.courses.length}`);
  let courseMatches = true;
  for (const bcourse of backup.data.courses) {
    const doc = await db.collection("courses").doc(bcourse.id).get();
    if (!doc.exists) {
      courseMatches = false;
      console.error(`  MISSING Course: ${bcourse.id}`);
    } else {
      const fd = doc.data()!;
      if (
        fd.slug !== bcourse.slug ||
        fd.categoryId !== bcourse.categoryId ||
        fd.isPublished !== bcourse.isPublished ||
        fd.isArchived !== bcourse.isArchived
      ) {
        courseMatches = false;
        console.error(`  MISMATCH in Course: ${bcourse.slug}`);
      }
      if (fd.modules?.length !== bcourse.modules?.length) {
        courseMatches = false;
        console.error(`  MISMATCH in modules length for ${bcourse.slug}`);
      } else {
        for (let i = 0; i < bcourse.modules.length; i++) {
          const bm = bcourse.modules[i];
          const fm = fd.modules[i];
          if (
            fm.title !== bm.title ||
            fm.orderIndex !== bm.orderIndex ||
            fm.durationHours !== bm.durationHours
          ) {
            courseMatches = false;
            console.error(`  MISMATCH in module ${i} for ${bcourse.slug}`);
          }
        }
      }
    }
  }
  console.log(`  Courses & Modules Parity: ${courseMatches ? "100% MATCH" : "FAILED"}`);

  // 4. Site Settings
  console.log("\n4. Site Settings:");
  let settingsMatch = true;
  for (const bs of backup.data.siteSettings) {
    const doc = await db.collection("site_settings").doc(bs.id).get();
    if (!doc.exists) {
      settingsMatch = false;
    } else {
      const fd = doc.data()!;
      if (
        fd.instituteName !== bs.instituteName ||
        fd.phone !== bs.phone ||
        fd.whatsappNumber !== bs.whatsappNumber
      ) {
        settingsMatch = false;
      }
    }
  }
  console.log(`  Site Settings Parity: ${settingsMatch ? "100% MATCH" : "FAILED"}`);

  // 5. FAQs, Testimonials, Faculty
  console.log("\n5. Content (FAQs, Testimonials, Faculty):");
  let contentMatch = true;
  for (const bf of backup.data.faqs) {
    const doc = await db.collection("faqs").doc(bf.id).get();
    if (!doc.exists) contentMatch = false;
  }
  for (const bt of backup.data.testimonials) {
    const doc = await db.collection("testimonials").doc(bt.id).get();
    if (!doc.exists) contentMatch = false;
  }
  for (const bfac of backup.data.facultyProfiles) {
    const doc = await db.collection("faculty_profiles").doc(bfac.id).get();
    if (!doc.exists) contentMatch = false;
  }
  console.log(`  Content Parity: ${contentMatch ? "100% MATCH" : "FAILED"}`);

  // 6. Enquiries
  console.log("\n6. Enquiries:");
  console.log(`  Backup count: ${backup.data.enquiries.length}`);
  let enquiryMatch = true;
  for (const be of backup.data.enquiries) {
    const doc = await db.collection("enquiries").doc(be.id).get();
    if (!doc.exists) {
      enquiryMatch = false;
      console.error(`  MISSING Enquiry: ${be.id} (${be.enquiryNumber})`);
    } else {
      const fd = doc.data()!;
      if (
        fd.enquiryNumber !== be.enquiryNumber ||
        fd.status !== be.status ||
        fd.email !== be.email ||
        fd.courseId !== be.courseId
      ) {
        enquiryMatch = false;
        console.error(`  MISMATCH in Enquiry: ${be.enquiryNumber}`);
      }
    }
  }
  console.log(`  Enquiries Parity: ${enquiryMatch ? "100% MATCH" : "FAILED"}`);

  console.log("\n=== PRE-MIGRATION BACKUP AUDIT COMPLETE ===");
  process.exit(0);
}

auditBackupParity().catch((err) => {
  console.error(err);
  process.exit(1);
});

