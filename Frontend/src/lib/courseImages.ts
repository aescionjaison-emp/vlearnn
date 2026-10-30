export interface TechBadge {
  name: string;
  color: string;
}

export interface AcademicCourseCardMeta {
  orderNumber: string;
  title: string;
  summary: string;
  duration: string;
  bgClass: string;
  imageSrc: string;
  imageAlt: string;
  curveType: "organic-1" | "organic-2" | "angled" | "asymmetric" | "wave" | "curved-blush";
  techStack: TechBadge[];
  categoryFilterKey: string;
  categoryName: string;
}

export function getCoursePresentation(
  slug?: string,
  index: number = 0,
  defaultTitle?: string,
  defaultSummary?: string,
  defaultDuration?: string
): AcademicCourseCardMeta {
  const normalized = (slug || "").toLowerCase();

  // 01 — Full Stack Web Development (Warm ivory #F8F5EE)
  if (
    normalized.includes("full-stack") ||
    normalized.includes("fullstack") ||
    normalized.includes("web")
  ) {
    return {
      orderNumber: "01",
      title: "Full Stack Web Development",
      summary: "Build modern web applications with real-world projects.",
      duration: defaultDuration || "4 Months",
      bgClass: "bg-[#F8F5EE]",
      imageSrc: "/images/academic-fullstack.jpg",
      imageAlt: "Modern developer workstation with code editor interface",
      curveType: "organic-1",
      techStack: [
        { name: "React", color: "#61DAFB" },
        { name: "Next.js", color: "#000000" },
        { name: "Node.js", color: "#68A063" },
        { name: "MongoDB", color: "#47A248" },
      ],
      categoryFilterKey: "web",
      categoryName: "Web Development",
    };
  }

  // 02 — Data Analytics & Business Intelligence (Soft blue #F1F5FB)
  if (
    normalized.includes("analytic") ||
    normalized.includes("data") ||
    normalized.includes("sql")
  ) {
    return {
      orderNumber: "02",
      title: "Data Analytics & Business Intelligence",
      summary: "Turn data into meaningful insights and solutions.",
      duration: defaultDuration || "4 Months",
      bgClass: "bg-[#F1F5FB]",
      imageSrc: "/images/academic-data-analytics.jpg",
      imageAlt: "Business intelligence dashboard charts and analytics on monitor",
      curveType: "organic-2",
      techStack: [
        { name: "Python", color: "#3776AB" },
        { name: "SQL", color: "#00758F" },
        { name: "Power BI", color: "#F2C811" },
        { name: "Tableau", color: "#E97627" },
      ],
      categoryFilterKey: "data",
      categoryName: "Data & Analytics",
    };
  }

  // 03 — Cloud & DevOps Engineering (Warm neutral #F8F5EE, Angled Boundary)
  if (
    normalized.includes("devops") ||
    normalized.includes("cloud") ||
    normalized.includes("kubernetes") ||
    normalized.includes("terraform")
  ) {
    return {
      orderNumber: "03",
      title: "Cloud & DevOps Engineering",
      summary: "Build and deploy scalable cloud infrastructure.",
      duration: defaultDuration || "4 Months",
      bgClass: "bg-[#F8F5EE]",
      imageSrc: "/images/academic-cloud-devops.jpg",
      imageAlt: "Server infrastructure and cloud architecture deployment monitoring",
      curveType: "angled",
      techStack: [
        { name: "AWS", color: "#FF9900" },
        { name: "Docker", color: "#2496ED" },
        { name: "Kubernetes", color: "#326CE5" },
        { name: "Terraform", color: "#844FBA" },
      ],
      categoryFilterKey: "cloud",
      categoryName: "Cloud & DevOps",
    };
  }

  // 04 — Cybersecurity & Ethical Hacking (Subtle cool-tinted #F3F6FA)
  if (
    normalized.includes("cyber") ||
    normalized.includes("security") ||
    normalized.includes("soc") ||
    normalized.includes("hack")
  ) {
    return {
      orderNumber: "04",
      title: "Cybersecurity & Ethical Hacking",
      summary: "Learn to identify and prevent cyber threats.",
      duration: defaultDuration || "4 Months",
      bgClass: "bg-[#F3F6FA]",
      imageSrc: "/images/academic-cybersecurity.jpg",
      imageAlt: "Cybersecurity terminal with network threat map and digital padlock",
      curveType: "asymmetric",
      techStack: [
        { name: "Linux", color: "#FCC624" },
        { name: "Wireshark", color: "#1679A7" },
        { name: "Kali", color: "#557C94" },
        { name: "Metasploit", color: "#E03C11" },
      ],
      categoryFilterKey: "cyber",
      categoryName: "Cybersecurity",
    };
  }

  // 05 — AI & Machine Learning (Soft neutral #F8F5EE)
  if (
    normalized.includes("ai") ||
    normalized.includes("llm") ||
    normalized.includes("rag") ||
    normalized.includes("machine")
  ) {
    return {
      orderNumber: "05",
      title: "AI & Machine Learning",
      summary: "Build intelligent solutions using real datasets.",
      duration: defaultDuration || "4 Months",
      bgClass: "bg-[#F8F5EE]",
      imageSrc: "/images/academic-ai-ml.jpg",
      imageAlt: "AI microchip processor with glowing neural network brain",
      curveType: "wave",
      techStack: [
        { name: "Python", color: "#3776AB" },
        { name: "TensorFlow", color: "#FF6F00" },
        { name: "scikit-learn", color: "#F7931E" },
        { name: "OpenAI", color: "#10A37F" },
      ],
      categoryFilterKey: "ai",
      categoryName: "AI & Machine Learning",
    };
  }

  // 06 — UI/UX Design & Product Development (Subtle warm blush #FBF4F1)
  if (
    normalized.includes("design") ||
    normalized.includes("ui") ||
    normalized.includes("ux") ||
    normalized.includes("product") ||
    normalized.includes("python")
  ) {
    return {
      orderNumber: "06",
      title: "UI/UX Design & Product Development",
      summary: "Design user-centric products for the digital world.",
      duration: defaultDuration || "4 Months",
      bgClass: "bg-[#FBF4F1]",
      imageSrc: "/images/academic-uiux.jpg",
      imageAlt: "Design workstation with mobile app wireframes and colour swatches",
      curveType: "curved-blush",
      techStack: [
        { name: "Figma", color: "#F24E1E" },
        { name: "Xd", color: "#FF61F6" },
        { name: "Framer", color: "#0055FF" },
        { name: "Sketch", color: "#F7B500" },
      ],
      categoryFilterKey: "design",
      categoryName: "Design & Product",
    };
  }

  // Fallback
  const padIndex = (index + 1).toString().padStart(2, "0");
  return {
    orderNumber: padIndex,
    title: defaultTitle || "Advanced Technology Track",
    summary: defaultSummary || "Gain hands-on experience and build practical engineering skills.",
    duration: defaultDuration || "4 Months",
    bgClass: "bg-[#F8F5EE]",
    imageSrc: "/images/academic-hero-workstation.jpg",
    imageAlt: "Technology workstation setup",
    curveType: "organic-1",
    techStack: [
      { name: "Engineering", color: "#2463A6" },
      { name: "Architecture", color: "#C79543" },
      { name: "Capstone", color: "#68A063" },
    ],
    categoryFilterKey: "other",
    categoryName: "Specialized Track",
  };
}

export function getCourseImage(slug?: string) {
  const p = getCoursePresentation(slug);
  return {
    src: p.imageSrc,
    alt: p.imageAlt,
    category: p.categoryName,
    badge: p.orderNumber,
  };
}

export function getCourseShowcaseMeta(slug?: string, defaultTitle?: string, defaultSummary?: string) {
  const p = getCoursePresentation(slug, 0, defaultTitle, defaultSummary);
  return {
    src: p.imageSrc,
    alt: p.imageAlt,
    category: p.categoryName,
    badge: p.orderNumber,
    shortTitle: p.title,
    headline: p.summary,
    techTags: p.techStack.map((t) => t.name),
    trackType: "Academic Track",
  };
}
