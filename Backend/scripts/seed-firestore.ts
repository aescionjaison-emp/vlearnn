import path from "path";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { getDb } from "../src/config/firebase";
import { Role, LearningMode } from "../src/types/models";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

async function seedFirestore() {
  console.log("=========================================");
  console.log("   VLEARNN — Seed Firebase Firestore     ");
  console.log("=========================================");

  const db = getDb();

  // 1. Seed Site Settings
  await db.collection("site_settings").doc("default").set(
    {
      id: "default",
      instituteName: "VLEARNN",
      tagLine: "Practical IT & Advanced Technical Training",
      heroTitle: "Master Real-World IT Engineering with Industry Practitioners",
      heroSubtitle:
        "Rigorous, cohort-based technical training in Artificial Intelligence, Full Stack Web Architecture, Cloud DevOps, and Data Systems. Build production applications, not toy projects.",
      aboutStory:
        "VLEARNN was established to address a persistent gap in modern IT education: traditional courses focus on surface-level syntax, while modern technology teams demand architecture comprehension, system resilience, and production-tested competence. Our curriculum is engineered directly by active senior staff engineers and engineering managers.",
      mission:
        "To provide disciplined, hands-on technical education that empowers students and career-changers to design, develop, and operate high-standard software systems.",
      vision:
        "To become the benchmark institute for practical IT engineering education, recognized by engineering organizations for producing capable, day-one productive technologists.",
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
    },
    { merge: true }
  );
  console.log("✔ Site settings seeded.");

  // 2. Seed Admin User
  const adminSnap = await db
    .collection("admin_users")
    .where("email", "==", "admin@vlearnn.com")
    .limit(1)
    .get();

  if (adminSnap.empty) {
    const passwordHash = await bcrypt.hash("VlearnnAdmin2026!", 10);
    const adminDoc = db.collection("admin_users").doc();
    await adminDoc.set({
      id: adminDoc.id,
      email: "admin@vlearnn.com",
      passwordHash,
      name: "VLEARNN Master Administrator",
      role: Role.SUPER_ADMIN,
      lastLoginAt: null,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    console.log("✔ Admin account created: admin@vlearnn.com");
  } else {
    console.log("✔ Admin account already exists.");
  }

  // 3. Seed Categories
  const categories = [
    {
      name: "Artificial Intelligence & ML",
      slug: "artificial-intelligence",
      description: "Deep learning, NLP, vector databases, and production LLM engineering.",
      displayOrder: 1,
    },
    {
      name: "Full Stack Web Engineering",
      slug: "full-stack-development",
      description: "Production TypeScript, Next.js, Node.js microservices, caching, and clean architecture.",
      displayOrder: 2,
    },
    {
      name: "Cloud & DevOps Engineering",
      slug: "cloud-devops",
      description: "Kubernetes orchestration, Terraform infrastructure-as-code, and automated CI/CD.",
      displayOrder: 3,
    },
    {
      name: "Data Analytics & Engineering",
      slug: "data-analytics",
      description: "Modern analytics engineering, SQL mastery, Python data wrangling, and dbt.",
      displayOrder: 4,
    },
    {
      name: "Cybersecurity & InfoSec",
      slug: "cybersecurity",
      description: "Defensive security architecture, penetration testing, and security operations.",
      displayOrder: 5,
    },
    {
      name: "Python & Automation Systems",
      slug: "python-automation",
      description: "Idiomatic Python programming, asynchronous processing, and API integrations.",
      displayOrder: 6,
    },
  ];

  for (const cat of categories) {
    const existing = await db
      .collection("course_categories")
      .where("slug", "==", cat.slug)
      .limit(1)
      .get();

    if (existing.empty) {
      const doc = db.collection("course_categories").doc();
      await doc.set({
        id: doc.id,
        ...cat,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  }
  console.log(`✔ Categories seeded.`);

  console.log("=========================================");
  console.log("✔ Firestore seeding complete!");
}

seedFirestore().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});

