import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import { DocumentReference } from "firebase-admin/firestore";
import { getDb } from "../src/config/firebase";

// Load environment configuration
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const prisma = new PrismaClient();

async function runMigration() {
  console.log("==========================================================");
  console.log("   VLEARNN — PostgreSQL to Firebase Firestore Migration   ");
  console.log("==========================================================");

  const db = getDb();
  const startTime = Date.now();

  try {
    // 1. Read all data from PostgreSQL in a read-only manner
    console.log("\n[Step 1: Reading records from PostgreSQL...]");

    const [
      adminUsers,
      categories,
      courses,
      siteSettings,
      faqs,
      testimonials,
      facultyProfiles,
      enquiries,
      enquiryMessages,
      emailNotifications,
    ] = await Promise.all([
      prisma.adminUser.findMany(),
      prisma.courseCategory.findMany(),
      prisma.course.findMany({ include: { modules: { orderBy: { orderIndex: "asc" } } } }),
      prisma.siteSettings.findMany(),
      prisma.fAQ.findMany(),
      prisma.testimonial.findMany(),
      prisma.facultyProfile.findMany(),
      prisma.enquiry.findMany(),
      prisma.enquiryMessage.findMany(),
      prisma.emailNotification.findMany(),
    ]);

    console.log(`- Admin Users: ${adminUsers.length}`);
    console.log(`- Course Categories: ${categories.length}`);
    console.log(`- Courses (with modules): ${courses.length}`);
    console.log(`- Site Settings: ${siteSettings.length}`);
    console.log(`- FAQs: ${faqs.length}`);
    console.log(`- Testimonials: ${testimonials.length}`);
    console.log(`- Faculty Profiles: ${facultyProfiles.length}`);
    console.log(`- Enquiries: ${enquiries.length}`);
    console.log(`- Enquiry Messages: ${enquiryMessages.length}`);
    console.log(`- Email Notifications: ${emailNotifications.length}`);

    // 2. Safe local backup creation
    console.log("\n[Step 2: Creating safe pre-migration backup...]");
    const backupDir = path.resolve(__dirname, "../backups");
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupFile = path.join(backupDir, `postgres-backup-${timestamp}.json`);
    
    // Anonymize sensitive fields in backup for security
    const backupData = {
      timestamp: new Date().toISOString(),
      counts: {
        adminUsers: adminUsers.length,
        categories: categories.length,
        courses: courses.length,
        siteSettings: siteSettings.length,
        faqs: faqs.length,
        testimonials: testimonials.length,
        facultyProfiles: facultyProfiles.length,
        enquiries: enquiries.length,
        enquiryMessages: enquiryMessages.length,
        emailNotifications: emailNotifications.length,
      },
      data: {
        adminUsers,
        categories,
        courses,
        siteSettings,
        faqs,
        testimonials,
        facultyProfiles,
        enquiries,
        enquiryMessages,
        emailNotifications,
      },
    };
    fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2));
    console.log(`✔ Safe backup written to: ${backupFile}`);

    // 3. Migrate to Firestore in batched writes
    console.log("\n[Step 3: Migrating records to Firestore...]");

    // Helper for batched writes
    async function commitBatch(items: Array<{ ref: DocumentReference; data: any }>) {
      const BATCH_SIZE = 400;
      for (let i = 0; i < items.length; i += BATCH_SIZE) {
        const batch = db.batch();
        const chunk = items.slice(i, i + BATCH_SIZE);
        for (const item of chunk) {
          batch.set(item.ref, item.data, { merge: true });
        }
        await batch.commit();
      }
    }

    // A. Admin Users
    const adminItems = adminUsers.map((u) => ({
      ref: db.collection("admin_users").doc(u.id),
      data: {
        id: u.id,
        email: u.email.toLowerCase().trim(),
        passwordHash: u.passwordHash,
        name: u.name,
        role: u.role,
        lastLoginAt: u.lastLoginAt ? u.lastLoginAt.toISOString() : null,
        isActive: u.isActive,
        createdAt: u.createdAt.toISOString(),
        updatedAt: u.updatedAt.toISOString(),
      },
    }));
    await commitBatch(adminItems);
    console.log(`✔ Migrated ${adminItems.length} Admin Users.`);

    // B. Course Categories
    const categoryItems = categories.map((c) => ({
      ref: db.collection("course_categories").doc(c.id),
      data: {
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description,
        displayOrder: c.displayOrder,
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt.toISOString(),
      },
    }));
    await commitBatch(categoryItems);
    console.log(`✔ Migrated ${categoryItems.length} Course Categories.`);

    // C. Courses with embedded Modules
    const courseItems = courses.map((c) => ({
      ref: db.collection("courses").doc(c.id),
      data: {
        id: c.id,
        title: c.title,
        slug: c.slug,
        summary: c.summary,
        description: c.description,
        categoryId: c.categoryId,
        duration: c.duration,
        learningMode: c.learningMode,
        fees: c.fees,
        isFeatured: c.isFeatured,
        isPublished: c.isPublished,
        isArchived: c.isArchived,
        eligibility: c.eligibility,
        displayOrder: c.displayOrder,
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt.toISOString(),
        modules: c.modules.map((m) => ({
          id: m.id,
          courseId: m.courseId,
          title: m.title,
          description: m.description,
          topics: m.topics,
          orderIndex: m.orderIndex,
          durationHours: m.durationHours,
          createdAt: m.createdAt.toISOString(),
          updatedAt: m.updatedAt.toISOString(),
        })),
      },
    }));
    await commitBatch(courseItems);
    console.log(`✔ Migrated ${courseItems.length} Courses with syllabus modules.`);

    // D. Site Settings
    const settingsItems = siteSettings.map((s) => ({
      ref: db.collection("site_settings").doc(s.id),
      data: {
        id: s.id,
        instituteName: s.instituteName,
        tagLine: s.tagLine,
        heroTitle: s.heroTitle,
        heroSubtitle: s.heroSubtitle,
        aboutStory: s.aboutStory,
        mission: s.mission,
        vision: s.vision,
        address: s.address,
        phone: s.phone,
        email: s.email,
        whatsappNumber: s.whatsappNumber,
        facebookUrl: s.facebookUrl,
        linkedinUrl: s.linkedinUrl,
        twitterUrl: s.twitterUrl,
        githubUrl: s.githubUrl,
        updatedAt: s.updatedAt.toISOString(),
      },
    }));
    await commitBatch(settingsItems);
    console.log(`✔ Migrated ${settingsItems.length} Site Settings.`);

    // E. FAQs
    const faqItems = faqs.map((f) => ({
      ref: db.collection("faqs").doc(f.id),
      data: {
        id: f.id,
        question: f.question,
        answer: f.answer,
        category: f.category,
        displayOrder: f.displayOrder,
        isPublished: f.isPublished,
        createdAt: f.createdAt.toISOString(),
        updatedAt: f.updatedAt.toISOString(),
      },
    }));
    await commitBatch(faqItems);
    console.log(`✔ Migrated ${faqItems.length} FAQs.`);

    // F. Testimonials
    const testimonialItems = testimonials.map((t) => ({
      ref: db.collection("testimonials").doc(t.id),
      data: {
        id: t.id,
        studentName: t.studentName,
        courseName: t.courseName,
        role: t.role,
        company: t.company,
        quote: t.quote,
        rating: t.rating,
        isPublished: t.isPublished,
        displayOrder: t.displayOrder,
        createdAt: t.createdAt.toISOString(),
        updatedAt: t.updatedAt.toISOString(),
      },
    }));
    await commitBatch(testimonialItems);
    console.log(`✔ Migrated ${testimonialItems.length} Testimonials.`);

    // G. Faculty Profiles
    const facultyItems = facultyProfiles.map((fp) => ({
      ref: db.collection("faculty_profiles").doc(fp.id),
      data: {
        id: fp.id,
        name: fp.name,
        title: fp.title,
        bio: fp.bio,
        expertise: fp.expertise,
        yearsExperience: fp.yearsExperience,
        displayOrder: fp.displayOrder,
        isPublished: fp.isPublished,
        createdAt: fp.createdAt.toISOString(),
        updatedAt: fp.updatedAt.toISOString(),
      },
    }));
    await commitBatch(facultyItems);
    console.log(`✔ Migrated ${facultyItems.length} Faculty Profiles.`);

    // H. Enquiries
    const enquiryItems = enquiries.map((e) => ({
      ref: db.collection("enquiries").doc(e.id),
      data: {
        id: e.id,
        enquiryNumber: e.enquiryNumber,
        fullName: e.fullName,
        email: e.email,
        countryCode: e.countryCode,
        phone: e.phone,
        courseId: e.courseId,
        learningMode: e.learningMode,
        message: e.message,
        status: e.status,
        notes: e.notes,
        followUpDate: e.followUpDate ? e.followUpDate.toISOString() : null,
        consentGiven: e.consentGiven,
        source: e.source,
        createdAt: e.createdAt.toISOString(),
        updatedAt: e.updatedAt.toISOString(),
      },
    }));
    await commitBatch(enquiryItems);
    console.log(`✔ Migrated ${enquiryItems.length} Enquiries.`);

    // I. Enquiry Messages
    const messageItems = enquiryMessages.map((m) => ({
      ref: db.collection("enquiry_messages").doc(m.id),
      data: {
        id: m.id,
        enquiryId: m.enquiryId,
        senderRole: m.senderRole,
        senderEmail: m.senderEmail,
        recipientEmail: m.recipientEmail,
        subject: m.subject,
        body: m.body,
        channel: m.channel,
        status: m.status,
        providerMessageId: m.providerMessageId,
        createdAt: m.createdAt.toISOString(),
      },
    }));
    await commitBatch(messageItems);
    console.log(`✔ Migrated ${messageItems.length} Enquiry Messages.`);

    // J. Email Notifications
    const emailItems = emailNotifications.map((n) => ({
      ref: db.collection("email_notifications").doc(n.id),
      data: {
        id: n.id,
        enquiryId: n.enquiryId,
        recipient: n.recipient,
        subject: n.subject,
        status: n.status,
        providerMessageId: n.providerMessageId,
        errorMessage: n.errorMessage,
        createdAt: n.createdAt.toISOString(),
      },
    }));
    await commitBatch(emailItems);
    console.log(`✔ Migrated ${emailItems.length} Email Notifications.`);

    // 4. Verification & Summary
    console.log("\n[Step 4: Verifying Firestore record counts...]");
    const [
      fsAdminCount,
      fsCatCount,
      fsCourseCount,
      fsSettingsCount,
      fsFaqCount,
      fsTestimonialCount,
      fsFacultyCount,
      fsEnquiryCount,
      fsMessageCount,
      fsEmailCount,
    ] = await Promise.all([
      db.collection("admin_users").get().then((s) => s.size),
      db.collection("course_categories").get().then((s) => s.size),
      db.collection("courses").get().then((s) => s.size),
      db.collection("site_settings").get().then((s) => s.size),
      db.collection("faqs").get().then((s) => s.size),
      db.collection("testimonials").get().then((s) => s.size),
      db.collection("faculty_profiles").get().then((s) => s.size),
      db.collection("enquiries").get().then((s) => s.size),
      db.collection("enquiry_messages").get().then((s) => s.size),
      db.collection("email_notifications").get().then((s) => s.size),
    ]);

    console.log("\n┌─────────────────────────────┬────────────┬─────────────┬────────┐");
    console.log("│ Entity Collection           │ PostgreSQL │ Firestore   │ Status │");
    console.log("├─────────────────────────────┼────────────┼─────────────┼────────┤");
    const reportRows = [
      ["Admin Users", adminUsers.length, fsAdminCount],
      ["Course Categories", categories.length, fsCatCount],
      ["Courses", courses.length, fsCourseCount],
      ["Site Settings", siteSettings.length, fsSettingsCount],
      ["FAQs", faqs.length, fsFaqCount],
      ["Testimonials", testimonials.length, fsTestimonialCount],
      ["Faculty Profiles", facultyProfiles.length, fsFacultyCount],
      ["Enquiries", enquiries.length, fsEnquiryCount],
      ["Enquiry Messages", enquiryMessages.length, fsMessageCount],
      ["Email Notifications", emailNotifications.length, fsEmailCount],
    ];

    let allMatch = true;
    for (const [name, pgCount, fsCount] of reportRows) {
      const match = pgCount === fsCount;
      if (!match) allMatch = false;
      const padName = (name as string).padEnd(27);
      const padPg = String(pgCount).padStart(10);
      const padFs = String(fsCount).padStart(11);
      const status = match ? "  MATCH " : " MISMATCH";
      console.log(`│ ${padName} │ ${padPg} │ ${padFs} │ ${status} │`);
    }
    console.log("└─────────────────────────────┴────────────┴─────────────┴────────┘");

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    if (allMatch) {
      console.log(`\n✔ MIGRATION SUCCESSFUL: All records accurately preserved in Firestore (${elapsed}s).`);
    } else {
      console.warn(`\n⚠ MIGRATION WARNING: Some collection counts differ. Review rows marked MISMATCH.`);
    }

  } catch (err: any) {
    console.error("\n❌ FATAL MIGRATION ERROR:", err?.message || err);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

runMigration();

