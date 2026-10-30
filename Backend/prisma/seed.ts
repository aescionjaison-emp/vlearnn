import { PrismaClient, Role, LearningMode, EnquiryStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting VLEARNN database seeding...");

  // 1. Seed Site Settings
  await prisma.siteSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
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
      whatsappNumber: "919876543210",
      facebookUrl: "https://facebook.com/vlearnn",
      linkedinUrl: "https://linkedin.com/company/vlearnn",
      twitterUrl: "https://twitter.com/vlearnn",
      githubUrl: "https://github.com/vlearnn",
    },
  });

  // 2. Seed Admin User
  const passwordHash = await bcrypt.hash("VlearnnAdmin2026!", 10);
  const adminUser = await prisma.adminUser.upsert({
    where: { email: "admin@vlearnn.com" },
    update: {
      // Do not overwrite existing passwordHash or name to protect updated credentials
      role: Role.SUPER_ADMIN,
    },
    create: {
      email: "admin@vlearnn.com",
      passwordHash,
      name: "VLEARNN Master Administrator",
      role: Role.SUPER_ADMIN,
    },
  });
  console.log(`Admin account provisioned/verified: ${adminUser.email}`);

  // 3. Seed Course Categories
  const categoriesData = [
    {
      name: "Artificial Intelligence & ML",
      slug: "artificial-intelligence",
      description:
        "Deep learning, natural language processing, vector databases, transformer architectures, and production LLM engineering.",
      displayOrder: 1,
    },
    {
      name: "Full Stack Web Engineering",
      slug: "full-stack-development",
      description:
        "Production TypeScript, Next.js, Node.js microservices, relational databases, caching, and clean architecture.",
      displayOrder: 2,
    },
    {
      name: "Cloud & DevOps Engineering",
      slug: "cloud-devops",
      description:
        "Kubernetes orchestration, Terraform infrastructure-as-code, CI/CD automated pipelines, and cloud reliability.",
      displayOrder: 3,
    },
    {
      name: "Data Analytics & Engineering",
      slug: "data-analytics",
      description:
        "Modern analytics engineering, SQL mastery, Python data wrangling, dbt modeling, and enterprise business intelligence.",
      displayOrder: 4,
    },
    {
      name: "Cybersecurity & InfoSec",
      slug: "cybersecurity",
      description:
        "Defensive security architecture, penetration testing, security operations, vulnerability assessment, and threat hunting.",
      displayOrder: 5,
    },
    {
      name: "Python & Automation Systems",
      slug: "python-automation",
      description:
        "Idiomatic Python programming, asynchronous processing, system utilities, web scraping, and API integrations.",
      displayOrder: 6,
    },
  ];

  const categoryMap = new Map<string, string>();
  for (const cat of categoriesData) {
    const record = await prisma.courseCategory.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: cat,
    });
    categoryMap.set(cat.slug, record.id);
  }

  // 4. Seed Courses
  const coursesData = [
    {
      title: "Applied Artificial Intelligence & Large Language Models",
      slug: "artificial-intelligence",
      summary:
        "Learn core machine learning paradigms, fine-tuning modern transformer models, implementing Retrieval-Augmented Generation (RAG), and deploying scalable AI inference APIs.",
      description:
        "This intensive program guides engineers from foundational machine learning mathematics to deploying production-ready AI systems. You will implement embedding pipelines with pgvector, fine-tune open-weights models like Llama 3, build robust multi-agent orchestration frameworks, and measure model hallucinations with evaluation benchmarks. Every cohort builds an end-to-end proprietary knowledge base search and agentic reasoning workflow.",
      categoryId: categoryMap.get("artificial-intelligence")!,
      duration: "16 Weeks (120 Hours)",
      learningMode: LearningMode.HYBRID,
      fees: 48000,
      isFeatured: true,
      isPublished: true,
      isArchived: false,
      eligibility:
        "Prior programming proficiency in Python or another modern language. Comfort with high school mathematics (vectors, derivatives, probability) recommended.",
      displayOrder: 1,
      modules: [
        {
          title: "Module 1: Foundations of Machine Learning & Vector Math",
          description:
            "Supervised learning algorithms, loss functions, gradient descent, feature normalization, and vector representations.",
          topics: [
            "Mathematical foundations: Linear algebra, calculus & probability",
            "Supervised vs Unsupervised learning paradigms",
            "Regression, Classification, and Model Evaluation Metrics",
            "Vector embeddings, distance metrics, and similarity search",
          ],
          durationHours: 30,
        },
        {
          title: "Module 2: Deep Learning & Modern Transformer Architectures",
          description:
            "Neural networks, backpropagation, attention mechanisms, self-attention, and the transformer encoder-decoder blueprint.",
          topics: [
            "Multi-layer perceptrons and gradient backpropagation in PyTorch",
            "Attention Is All You Need: Deconstructing self-attention & multi-head attention",
            "Tokenization, positional encodings, and context windows",
            "Pre-trained language models: BERT, GPT, and modern decoder-only architectures",
          ],
          durationHours: 30,
        },
        {
          title: "Module 3: Retrieval-Augmented Generation (RAG) & Vector Databases",
          description:
            "Designing enterprise-grade knowledge retrieval architectures with chunking strategies and semantic reranking.",
          topics: [
            "Document parsing, chunking strategies, and metadata indexing",
            "PostgreSQL pgvector, Pinecone, and hybrid BM25 + dense search",
            "Context injection, query transformation, and cross-encoder re-ranking",
            "Mitigating hallucinations and building automated RAG evaluation (Ragas)",
          ],
          durationHours: 30,
        },
        {
          title: "Module 4: Production LLM Deployment, Fine-Tuning & Multi-Agent Systems",
          description:
            "LoRA parameter-efficient fine-tuning, streaming inference servers, structured outputs, and autonomous agent orchestration.",
          topics: [
            "Parameter-Efficient Fine-Tuning (PEFT/LoRA) using Hugging Face",
            "High-throughput inference with vLLM, Ollama, and FastAPI streaming",
            "Tool-use, function calling, and LangGraph multi-agent systems",
            "Production observability, prompt telemetry, and safety guardrails",
          ],
          durationHours: 30,
        },
      ],
    },
    {
      title: "Full Stack Web Engineering with Next.js & Node.js",
      slug: "full-stack-development",
      summary:
        "Architect and build robust, high-performance web applications using TypeScript, Next.js App Router, Express REST APIs, PostgreSQL, Prisma, and Redis caching.",
      description:
        "Designed for developers seeking full architectural mastery from database design to edge-rendered user interfaces. This course eschews superficial tutorials in favor of production realities: connection pooling, zero-downtime database migrations, atomic transactions, session and JWT authorization patterns, automated end-to-end testing, and performance profiling under load.",
      categoryId: categoryMap.get("full-stack-development")!,
      duration: "18 Weeks (140 Hours)",
      learningMode: LearningMode.HYBRID,
      fees: 42000,
      isFeatured: true,
      isPublished: true,
      isArchived: false,
      eligibility:
        "Basic familiarity with HTML, CSS, and general programming fundamentals. Beginners with analytical problem-solving aptitude are encouraged.",
      displayOrder: 2,
      modules: [
        {
          title: "Module 1: Advanced TypeScript & Modern JavaScript Internals",
          description:
            "Mastering the type system, runtime vs compile-time guarantees, asynchronous event loops, and clean code paradigms.",
          topics: [
            "Advanced TypeScript: Generics, utility types, conditional types, and schema validation with Zod",
            "V8 engine internals, event loop mechanics, microtasks, and memory management",
            "Modern ESNext patterns: Async generators, iterators, and modules",
            "Clean Architecture principles and Domain-Driven Design concepts",
          ],
          durationHours: 35,
        },
        {
          title: "Module 2: Server Architecture with Express & Prisma ORM",
          description:
            "Designing scalable RESTful APIs, relational data modeling, migrations, and robust error hierarchies.",
          topics: [
            "RESTful API design conventions, middleware pipelines, and structured logging",
            "PostgreSQL relational modeling, indexing strategies, foreign keys, and transactions",
            "Prisma ORM schema design, migrations, and query performance tuning",
            "Authentication: Secure password hashing, JWTs, HTTP-only refresh cookies, and RBAC",
          ],
          durationHours: 35,
        },
        {
          title: "Module 3: Next.js App Router & Server-Side Rendering",
          description:
            "Harnessing React Server Components, streaming SSR, parallel routes, and modern Tailwind CSS UI architecture.",
          topics: [
            "React 18/19 mental models: Server Components vs Client Components",
            "Next.js App Router: Dynamic routing, route handlers, layouts, and error boundaries",
            "Server Actions, optimistic updates, and form state management",
            "Design systems with Tailwind CSS, accessible shadcn/ui primitives, and responsiveness",
          ],
          durationHours: 35,
        },
        {
          title: "Module 4: Performance, Caching, Testing & Production Deployment",
          description:
            "Redis caching layers, rate limiting, unit and integration testing, and CI/CD deployment pipelines.",
          topics: [
            "In-memory caching with Redis: Cache invalidation strategies and pub/sub",
            "Security hardening: Helmet, CORS, CSRF defenses, and rate limiting",
            "Automated testing: Unit tests with Vitest, integration tests with Playwright",
            "Docker containerization, environment management, and cloud deployments",
          ],
          durationHours: 35,
        },
      ],
    },
    {
      title: "Cloud Infrastructure, Kubernetes & DevOps Engineering",
      slug: "cloud-devops",
      summary:
        "Automate, containerize, and operate resilient cloud infrastructures using Docker, Kubernetes, Terraform IaC, GitHub Actions, and AWS cloud services.",
      description:
        "Modern software engineering requires continuous delivery and operational resilience. In this course, you will build and provision reproducible cloud environments from code, manage multi-node Kubernetes clusters, deploy ingress controllers, configure automated CI/CD pipelines, and monitor distributed applications with Prometheus and Grafana.",
      categoryId: categoryMap.get("cloud-devops")!,
      duration: "14 Weeks (100 Hours)",
      learningMode: LearningMode.ONLINE,
      fees: 38000,
      isFeatured: true,
      isPublished: true,
      isArchived: false,
      eligibility:
        "Basic familiarity with Linux shell commands and basic web networking principles (TCP/IP, DNS, ports).",
      displayOrder: 3,
      modules: [
        {
          title: "Module 1: Linux Systems & Containerization with Docker",
          description: "Linux systems administration, process isolation, namespaces, and multi-stage Docker builds.",
          topics: [
            "Linux systems: Bash scripting, systemd, permissions, and network troubleshooting",
            "Docker internals: Namespaces, cgroups, layered filesystem, and image optimization",
            "Docker Compose for multi-container development environments",
            "Container security, rootless containers, and vulnerability scanning with Trivy",
          ],
          durationHours: 25,
        },
        {
          title: "Module 2: Kubernetes Orchestration & Cluster Management",
          description: "Deploying and managing production workloads on Kubernetes.",
          topics: [
            "Kubernetes architecture: Control plane, kubelet, etcd, and worker nodes",
            "Pods, Deployments, ReplicaSets, StatefulSets, and DaemonSets",
            "Services, Ingress controllers, TLS cert-manager, and internal DNS",
            "ConfigMaps, Secrets, persistent volumes, and Helm package management",
          ],
          durationHours: 25,
        },
        {
          title: "Module 3: Infrastructure as Code (IaC) with Terraform & AWS",
          description: "Provisioning reproducible enterprise cloud infrastructure on AWS.",
          topics: [
            "AWS Core Services: VPC, Subnets, Internet Gateways, EC2, S3, and IAM roles",
            "Terraform fundamentals: Providers, resources, state locking, and modularization",
            "Managing remote state with S3 and DynamoDB backend",
            "Zero-downtime rolling updates and disaster recovery planning",
          ],
          durationHours: 25,
        },
        {
          title: "Module 4: CI/CD Pipelines & Cloud Observability",
          description: "Automated continuous delivery and distributed systems monitoring.",
          topics: [
            "GitHub Actions: Matrix builds, secret management, and artifact caching",
            "GitOps workflows with ArgoCD on Kubernetes",
            "Metrics and logging with Prometheus, Grafana, and Loki",
            "Incident response, synthetic monitoring, and SLA/SLO tracking",
          ],
          durationHours: 25,
        },
      ],
    },
    {
      title: "Data Analytics & Modern Analytics Engineering",
      slug: "data-analytics",
      summary:
        "Transform messy organizational data into decision-making assets using Advanced SQL, Python data analysis, dbt transformations, and interactive executive dashboards.",
      description:
        "Step beyond standard spreadsheet reporting into professional data analytics. This program covers dimensional data modeling (Kimball methodology), advanced SQL analytical window functions, data wrangling with Python Pandas and DuckDB, automated dbt transformation DAGs, and crafting persuasive, human-centered business intelligence dashboards.",
      categoryId: categoryMap.get("data-analytics")!,
      duration: "12 Weeks (90 Hours)",
      learningMode: LearningMode.ONLINE,
      fees: 34000,
      isFeatured: true,
      isPublished: true,
      isArchived: false,
      eligibility:
        "Comfortable with spreadsheets and numerical analysis. No prior programming background strictly required.",
      displayOrder: 4,
      modules: [
        {
          title: "Module 1: Advanced Relational SQL for Analytical Queries",
          description: "Complex querying, CTEs, window functions, and query optimization.",
          topics: [
            "Complex Joins, Subqueries, and Common Table Expressions (CTEs)",
            "Window functions: ROW_NUMBER, RANK, DENSE_RANK, LEAD, LAG, and rolling aggregations",
            "Performance indexing, EXPLAIN ANALYZE, and execution plans",
            "Data normalization and Star/Snowflake dimensional schemas",
          ],
          durationHours: 22,
        },
        {
          title: "Module 2: Python for Data Analysis & Statistical Modeling",
          description: "Data manipulation with Pandas, NumPy, and statistical hypothesis testing.",
          topics: [
            "NumPy array operations and vectorized calculations",
            "Pandas: DataFrames, missing value imputation, multi-indexing, and reshaping",
            "Exploratory Data Analysis (EDA) and distribution testing",
            "Data visualization with Seaborn, Matplotlib, and Plotly",
          ],
          durationHours: 23,
        },
        {
          title: "Module 3: Analytics Engineering with dbt & Cloud Data Warehouses",
          description: "Building production data pipelines with dbt (data build tool).",
          topics: [
            "Modern Data Stack overview: Snowflake, BigQuery, and DuckDB",
            "dbt fundamentals: Models, sources, seeds, and Jinja templating",
            "Testing data quality, freshness tests, and documentation generation",
            "Incremental data models and orchestration with scheduling tools",
          ],
          durationHours: 22,
        },
        {
          title: "Module 4: Business Intelligence & Executive Storytelling",
          description: "Translating data insights into executive action.",
          topics: [
            "Dashboard UX design principles: Visual hierarchy and cognitive load reduction",
            "Building interactive dashboards in Power BI and Tableau",
            "Cohort analysis, retention curves, and churn analysis",
            "Executive presentation strategies and data storytelling",
          ],
          durationHours: 23,
        },
      ],
    },
    {
      title: "Cybersecurity Defense, SOC Operations & Ethical Hacking",
      slug: "cybersecurity",
      summary:
        "Defend enterprise IT perimeters, conduct vulnerability assessments, monitor SIEM security alerts, and execute controlled ethical penetration testing.",
      description:
        "A practical, laboratory-driven curriculum focusing on defensive engineering and blue team operations. Students analyze live network traffic, configure firewall policies, investigate attack simulations in a sandboxed security operations center (SOC), and master vulnerability scanning tools.",
      categoryId: categoryMap.get("cybersecurity")!,
      duration: "14 Weeks (100 Hours)",
      learningMode: LearningMode.HYBRID,
      fees: 40000,
      isFeatured: false,
      isPublished: true,
      isArchived: false,
      eligibility:
        "Fundamental knowledge of operating systems (Windows and Linux) and networking protocols (TCP, UDP, DNS, TLS).",
      displayOrder: 5,
      modules: [
        {
          title: "Module 1: Network Protocols, Packet Analysis & Threat Landscapes",
          description: "Deep dive into network packets, OSI layers, and attack vectors.",
          topics: [
            "Packet capture and dissection with Wireshark and tcpdump",
            "TCP/IP handshakes, ARP poisoning, and DNS spoofing analysis",
            "Common vulnerability enumeration: MITRE ATT&CK and OWASP Top 10",
            "Hardening network devices, VLANs, and firewall rule configurations",
          ],
          durationHours: 25,
        },
        {
          title: "Module 2: Vulnerability Assessment & Defensive Architecture",
          description: "Scanning, hardening, and establishing zero-trust access controls.",
          topics: [
            "Vulnerability scanning with Nessus and OpenVAS",
            "Operating system hardening benchmarks (CIS benchmarks)",
            "Identity and Access Management (IAM), MFA, and Zero Trust models",
            "Endpoint Detection and Response (EDR) agents and telemetry",
          ],
          durationHours: 25,
        },
        {
          title: "Module 3: Security Operations Center (SOC) & SIEM Analysis",
          description: "Investigating alerts, log correlation, and incident response playbooks.",
          topics: [
            "Log ingestion and search using Splunk and ELK stack",
            "Writing detection rules for brute force, lateral movement, and data exfiltration",
            "Incident response lifecycle (NIST / SANS frameworks)",
            "Memory analysis, digital forensics, and chain of custody preservation",
          ],
          durationHours: 25,
        },
        {
          title: "Module 4: Ethical Penetration Testing & Web Application Security",
          description: "Hands-on controlled penetration testing methodologies.",
          topics: [
            "Reconnaissance, port scanning, and service enumeration with Nmap",
            "Exploiting web vulnerabilities: SQLi, XSS, CSRF, and SSRF in controlled labs",
            "Privilege escalation techniques on Linux and Windows",
            "Remediation reporting and communicating technical risk to stakeholders",
          ],
          durationHours: 25,
        },
      ],
    },
    {
      title: "Python for Systems Automation, APIs & Scripting",
      slug: "python-automation",
      summary:
        "Master modern Python 3, object-oriented software design, asynchronous concurrency, robust API development with FastAPI, and automated system scripts.",
      description:
        "Engineered for developers, IT administrators, and career-changers who want a rock-solid Python programming foundation. You will write idiomatic, performant Python code, interact with external REST APIs, automate file and database workflows, and package your own CLI tools.",
      categoryId: categoryMap.get("python-automation")!,
      duration: "10 Weeks (75 Hours)",
      learningMode: LearningMode.IN_PERSON,
      fees: 28000,
      isFeatured: false,
      isPublished: true,
      isArchived: false,
      eligibility:
        "Beginners with strong curiosity and problem-solving drive. No prior programming needed.",
      displayOrder: 6,
      modules: [
        {
          title: "Module 1: Core Python Syntax, Data Structures & Logic",
          description: "Building strong fundamentals with data structures and procedural logic.",
          topics: [
            "Python data types, immutability, lists, dictionaries, sets, and tuples",
            "Flow control, list comprehensions, and generator expressions",
            "Functions, scope, closures, and first-class functions",
            "File I/O operations, JSON/CSV parsing, and exception handling",
          ],
          durationHours: 20,
        },
        {
          title: "Module 2: Object-Oriented Design & Clean Code Practices",
          description: "Writing maintainable, modular, and testable code.",
          topics: [
            "Classes, instances, inheritance, and encapsulation",
            "Dunder methods (magic methods) and operator overloading",
            "Type hinting with mypy and static analysis with ruff",
            "Unit testing with pytest, fixtures, and mocking",
          ],
          durationHours: 20,
        },
        {
          title: "Module 3: Asynchronous Programming & REST API Development",
          description: "Building fast web services with FastAPI and async/await.",
          topics: [
            "Asyncio fundamentals: Event loop, coroutines, and tasks",
            "FastAPI framework: Route handlers, request validation with Pydantic",
            "Database integration with SQLAlchemy 2.0 and SQLite/PostgreSQL",
            "Authentication, token verification, and Swagger OpenAPI documentation",
          ],
          durationHours: 20,
        },
        {
          title: "Module 4: Practical Systems Automation & CLI Utilities",
          description: "Automating operational workflows and external services.",
          topics: [
            "Automated web scraping with BeautifulSoup and Playwright",
            "Automating email dispatches, scheduled cron tasks, and report generators",
            "Building command-line utilities with Click and Typer",
            "Virtual environments, poetry dependency management, and packaging",
          ],
          durationHours: 15,
        },
      ],
    },
    {
      title: "Advanced Distributed Systems Architecture (Internal Preview)",
      slug: "advanced-systems-architecture",
      summary:
        "High-throughput event-driven microservices, consensus protocols, and fault-tolerant system design. Unpublished internal curriculum preview.",
      description:
        "An advanced course for senior engineers currently in curriculum review. Not yet open for public student enrolments.",
      categoryId: categoryMap.get("full-stack-development")!,
      duration: "12 Weeks (80 Hours)",
      learningMode: LearningMode.HYBRID,
      fees: 55000,
      isFeatured: false,
      isPublished: false, // Intentionally unpublished for testing unpublished route protection!
      isArchived: false,
      eligibility: "Senior developers with minimum 3 years of production backend experience.",
      displayOrder: 7,
      modules: [
        {
          title: "Module 1: Distributed Consensus & Raft",
          description: "Understanding consensus, quorum, and partition tolerance.",
          topics: ["CAP theorem in practice", "Raft consensus mechanics", "Vector clocks"],
          durationHours: 20,
        },
      ],
    },
  ];

  for (const courseData of coursesData) {
    const { modules, ...courseFields } = courseData;

    const course = await prisma.course.upsert({
      where: { slug: courseFields.slug },
      update: courseFields,
      create: courseFields,
    });

    // Delete existing modules and re-insert to maintain clean ordering
    await prisma.courseModule.deleteMany({ where: { courseId: course.id } });

    for (let i = 0; i < modules.length; i++) {
      const mod = modules[i];
      await prisma.courseModule.create({
        data: {
          courseId: course.id,
          title: mod.title,
          description: mod.description,
          topics: mod.topics,
          durationHours: mod.durationHours,
          orderIndex: i + 1,
        },
      });
    }
  }

  // 5. Seed FAQs
  const faqsData = [
    {
      question: "How are VLEARNN programs different from online video courses?",
      answer:
        "Unlike self-paced recorded tutorials with single-digit completion rates, VLEARNN operates on a rigorous cohort-based model. You learn directly from practicing industry engineers, submit weekly code projects that receive thorough line-by-line pull request reviews, and collaborate in pair-programming labs.",
      category: "Admissions & Methodology",
      displayOrder: 1,
    },
    {
      question: "What are the prerequisite requirements for enrolling in courses?",
      answer:
        "Prerequisites depend on the specific program. Foundational courses like Python and Data Analytics require zero prior coding experience. Advanced programs like Applied AI and Cloud DevOps assume familiarity with basic programming fundamentals. We offer free preparatory bridge modules before cohort kickoffs.",
      category: "Prerequisites",
      displayOrder: 2,
    },
    {
      question: "Can I take classes while working full-time?",
      answer:
        "Yes. Our cohorts are specifically scheduled for working professionals and university students. Classroom and live interactive sessions are held on weekend mornings and weekday evenings. All live sessions are recorded and indexed for revision.",
      category: "Schedule & Mode",
      displayOrder: 3,
    },
    {
      question: "What does the 1-on-1 career mentoring support include?",
      answer:
        "Mentorship includes technical portfolio auditing, resume restructuring tailored to ATS screening, system design mock interviews, behavioral prep, and direct interview referrals to our hiring network.",
      category: "Career Support",
      displayOrder: 4,
    },
    {
      question: "Are certificates recognized by technology employers?",
      answer:
        "Upon graduating and passing all capstone project defenses, students receive a verified VLEARNN Certificate of Technical Competence with a cryptographic verification hash. More importantly, hiring managers value the verifiable GitHub repositories and deployed live projects built during the program.",
      category: "Certifications",
      displayOrder: 5,
    },
    {
      question: "What is the fee payment structure and refund policy?",
      answer:
        "Fees can be paid upfront with an early-bird discount or structured across flexible zero-cost monthly installments. We offer a 100% money-back guarantee within the first 7 days if you find the curriculum or teaching standard does not meet expectations.",
      category: "Fees & Payment",
      displayOrder: 6,
    },
  ];

  // 5. Seed FAQs (Idempotent: matches by question without deleting existing records)
  for (const faq of faqsData) {
    const existing = await prisma.fAQ.findFirst({ where: { question: faq.question } });
    if (existing) {
      await prisma.fAQ.update({ where: { id: existing.id }, data: faq });
    } else {
      await prisma.fAQ.create({ data: faq });
    }
  }

  // 6. Seed Faculty Profiles (Idempotent: matches by name without deleting existing records)
  const facultyData = [
    {
      name: "Dr. Arvind Sundaram",
      title: "Lead AI & Distributed Systems Faculty",
      bio: "Former Principal Architect with 14+ years of experience leading machine learning infrastructure teams at tier-1 enterprise tech firms.",
      expertise: ["Large Language Models", "PyTorch", "High-Throughput Distributed Systems", "Vector Databases"],
      yearsExperience: 14,
      displayOrder: 1,
    },
    {
      name: "Meera Krishnan",
      title: "Head of Web & Systems Engineering",
      bio: "Full stack engineering leader specializing in TypeScript, Next.js architecture, and large-scale cloud microservices. Active open-source contributor.",
      expertise: ["Next.js", "TypeScript", "PostgreSQL Architecture", "Clean Architecture", "Node.js"],
      yearsExperience: 11,
      displayOrder: 2,
    },
    {
      name: "Rohan Varma",
      title: "Principal Cloud & SRE Mentor",
      bio: "Certified Kubernetes Administrator (CKA) and AWS Solutions Architect who has scaled multi-region infrastructures serving millions of daily active users.",
      expertise: ["Kubernetes", "Terraform", "AWS Cloud", "Docker", "CI/CD Automation", "Prometheus"],
      yearsExperience: 12,
      displayOrder: 3,
    },
    {
      name: "Pooja Deshmukh",
      title: "Staff Data & Analytics Architect",
      bio: "Analytics engineering specialist who has built enterprise data platforms with dbt, Snowflake, and Python for fintech and logistics companies.",
      expertise: ["dbt", "Advanced SQL", "Snowflake", "Python Pandas", "Power BI", "Data Modeling"],
      yearsExperience: 10,
      displayOrder: 4,
    },
  ];

  for (const fac of facultyData) {
    const existing = await prisma.facultyProfile.findFirst({ where: { name: fac.name } });
    if (existing) {
      await prisma.facultyProfile.update({ where: { id: existing.id }, data: fac });
    } else {
      await prisma.facultyProfile.create({ data: fac });
    }
  }

  // 7. Seed Authentic Student Testimonials (Idempotent: matches by studentName + courseName)
  const testimonialsData = [
    {
      studentName: "Aditya Nair",
      courseName: "Applied Artificial Intelligence & Large Language Models",
      role: "AI Engineer",
      company: "Cognitive Solutions",
      quote:
        "The RAG module and vector database labs gave me the exact architecture models I needed. Instead of toy examples, we built production-grade evaluation pipelines. That capstone project directly secured my transition into AI engineering.",
      rating: 5,
      displayOrder: 1,
    },
    {
      studentName: "Sneha Mukherjee",
      courseName: "Full Stack Web Engineering with Next.js & Node.js",
      role: "Software Development Engineer",
      company: "Novacorp Labs",
      quote:
        "I was tired of surface-level tutorials that never explained database connection pools, transactions, or production cache strategies. VLEARNN’s code reviews pushed my TypeScript and backend standards to a senior level.",
      rating: 5,
      displayOrder: 2,
    },
    {
      studentName: "Karthik Rajan",
      courseName: "Cloud Infrastructure, Kubernetes & DevOps Engineering",
      role: "DevOps Engineer",
      company: "CloudScale Systems",
      quote:
        "Writing production Terraform modules and managing multi-node Kubernetes deployments with live ingress gave me true operational confidence. The mentors are practicing engineers who share real war stories.",
      rating: 5,
      displayOrder: 3,
    },
  ];

  for (const test of testimonialsData) {
    const existing = await prisma.testimonial.findFirst({
      where: { studentName: test.studentName, courseName: test.courseName },
    });
    if (existing) {
      await prisma.testimonial.update({ where: { id: existing.id }, data: test });
    } else {
      await prisma.testimonial.create({ data: test });
    }
  }

  // 8. Seed Sample Enquiries to verify Admin CRM & metrics
  const aiCourse = await prisma.course.findUnique({ where: { slug: "artificial-intelligence" } });
  const fsCourse = await prisma.course.findUnique({ where: { slug: "full-stack-development" } });
  const cloudCourse = await prisma.course.findUnique({ where: { slug: "cloud-devops" } });

  const enquiriesData = [
    {
      enquiryNumber: "VL-ENQ-2026-1001",
      fullName: "Vikram Malhotra",
      email: "vikram.m@example.com",
      countryCode: "+91",
      phone: "9876501234",
      courseId: aiCourse?.id,
      learningMode: LearningMode.HYBRID,
      message:
        "I am working as a Python developer with 2 years of experience. I want to transition to applied AI and LLM application development. Can you share the upcoming weekend batch schedule?",
      status: EnquiryStatus.NEW,
      notes: "High intent applicant. Has solid Python basics. Needs details for November batch.",
      consentGiven: true,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    },
    {
      enquiryNumber: "VL-ENQ-2026-1002",
      fullName: "Ananya Sen",
      email: "ananya.sen@example.com",
      countryCode: "+91",
      phone: "9812345678",
      courseId: fsCourse?.id,
      learningMode: LearningMode.HYBRID,
      message:
        "Interested in the Full Stack Web Engineering program. Are EMI installment options available for the course fee?",
      status: EnquiryStatus.CONTACTED,
      notes: "Contacted via phone. Shared EMI installment brochure and syllabus PDF. Awaiting response.",
      followUpDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      consentGiven: true,
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    },
    {
      enquiryNumber: "VL-ENQ-2026-1003",
      fullName: "Rajesh Kulkarni",
      email: "rajesh.k@example.com",
      countryCode: "+91",
      phone: "9765432109",
      courseId: cloudCourse?.id,
      learningMode: LearningMode.ONLINE,
      message:
        "Looking to upskill my team in Kubernetes and Terraform. Do you offer corporate training options or cohort enrollment for 4 engineers?",
      status: EnquiryStatus.INTERESTED,
      notes: "Corporate lead. 4 prospective students. Scheduled video consultation for Friday 4 PM.",
      followUpDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      consentGiven: true,
      createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000), // 2 days ago
    },
  ];

  for (const enq of enquiriesData) {
    await prisma.enquiry.upsert({
      where: { enquiryNumber: enq.enquiryNumber },
      update: enq,
      create: enq,
    });
  }

  console.log("Database seeded successfully with courses, categories, settings, FAQs, faculty, and CRM enquiries!");
}

main()
  .catch((e) => {
    console.error("Error during database seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

