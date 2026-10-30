"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Play } from "lucide-react";
import { Course, CourseCategory, SiteSettings, Testimonial } from "@/types";
import {
  fetchPublishedCourses,
  fetchCategories,
  fetchSiteSettings,
  fetchTestimonials,
} from "@/lib/api";
import { usePublicRealtime } from "@/lib/usePublicRealtime";
import { TechnologyStrip } from "@/components/TechnologyStrip";
import { AcademicProgramsSection } from "@/components/AcademicProgramsSection";

interface HomePageClientProps {
  initialSettings: SiteSettings | null;
  initialFeaturedCourses: Course[];
  initialCategories: CourseCategory[];
  initialTestimonials: Testimonial[];
}

export function HomePageClient({
  initialSettings,
  initialFeaturedCourses,
  initialCategories,
  initialTestimonials,
}: HomePageClientProps) {
  const [settings, setSettings] = useState<SiteSettings | null>(initialSettings);
  const [featuredCourses, setFeaturedCourses] = useState<Course[]>(initialFeaturedCourses);
  const [categories, setCategories] = useState<CourseCategory[]>(initialCategories);
  const [testimonials, setTestimonials] = useState<Testimonial[]>(initialTestimonials);

  // Preserve real-time live SSE updates
  usePublicRealtime(async (event) => {
    try {
      if (event === "site_content_updated" || event === "public_settings_updated") {
        const freshSettings = await fetchSiteSettings();
        if (freshSettings) setSettings(freshSettings);
      }
      if (event === "courses_updated") {
        const [freshCourses, freshCats] = await Promise.all([
          fetchPublishedCourses({ featured: true }),
          fetchCategories(),
        ]);
        setFeaturedCourses(freshCourses);
        setCategories(freshCats);
      }
      if (event === "categories_updated") {
        const freshCats = await fetchCategories();
        setCategories(freshCats);
      }
      if (event === "testimonials_updated") {
        const freshTestimonials = await fetchTestimonials();
        setTestimonials(freshTestimonials);
      }
    } catch (err) {
      console.warn("Live real-time refresh caught an error:", err);
    }
  });

  return (
    <div className="font-sans bg-white text-[#1C1C1C]">
      {/* ============================================================== */}
      {/* 1. HERO SECTION (FULL SCREEN CINEMATIC LAYOUT)                 */}
      {/* ============================================================== */}
      <section className="relative w-full overflow-hidden bg-[#FAF9F6] border-b border-[#E5E7EB] min-h-[calc(100vh-92px)] lg:h-[calc(100vh-92px)] flex items-stretch">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 items-stretch h-full">
          {/* Left Dominant Editorial Content */}
          <div className="lg:col-span-6 xl:col-span-6 z-10 py-10 sm:py-12 lg:py-8 xl:py-12 pl-6 sm:pl-12 lg:pl-14 xl:pl-20 2xl:pl-32 pr-6 lg:pr-8 xl:pr-12 flex flex-col justify-center space-y-4 sm:space-y-5 xl:space-y-6">
            {/* Eyebrow */}
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-4 bg-[#C59A56] rounded-full inline-block" />
              <span className="text-[11px] sm:text-xs font-bold text-[#667085] tracking-[0.2em] uppercase">
                SKILLS &nbsp;|&nbsp; PROJECTS &nbsp;|&nbsp; CAREER GROWTH
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-[46px] xl:text-[54px] 2xl:text-[62px] font-bold tracking-tight text-[#111D35] leading-[1.08] text-balance">
              Learn Today.<br />
              Build Tomorrow.
            </h1>

            {/* Description */}
            <p className="text-sm sm:text-base lg:text-lg text-[#667085] leading-relaxed max-w-xl font-normal">
              Industry-relevant technology training with real-world projects, expert guidance, and hands-on learning.
            </p>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3 sm:gap-4">
              <Link
                href="/courses"
                className="inline-flex items-center gap-2 bg-[#2463A6] hover:bg-[#1E5289] text-white text-xs sm:text-sm font-semibold px-6 py-3 rounded-lg transition-colors shadow-sm"
              >
                <span>Explore Courses</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/about"
                className="inline-flex items-center gap-2 bg-white hover:bg-[#F7F8FA] text-[#111D35] text-xs sm:text-sm font-semibold px-5 py-3 rounded-lg border border-[#E5E7EB] hover:border-[#111D35] transition-colors shadow-xs"
              >
                <span className="w-5 h-5 rounded-full bg-[#EBF3FA] flex items-center justify-center">
                  <Play className="w-2.5 h-2.5 text-[#2463A6] fill-[#2463A6] ml-0.5" />
                </span>
                <span>Watch Video</span>
              </Link>
            </div>

            {/* Three Metric Pillars (Divided by thin lines) */}
            <div className="pt-4 border-t border-[#E5E7EB] grid grid-cols-3 divide-x divide-[#E5E7EB] text-left max-w-lg">
              <div className="pr-2 sm:pr-4">
                <span className="text-xl sm:text-3xl font-bold text-[#111D35] block leading-none mb-1">
                  500+
                </span>
                <span className="text-[10px] sm:text-xs text-[#667085] font-medium leading-tight block">Students Trained</span>
              </div>
              <div className="px-2 sm:px-4">
                <span className="text-xl sm:text-3xl font-bold text-[#111D35] block leading-none mb-1">
                  20+
                </span>
                <span className="text-[10px] sm:text-xs text-[#667085] font-medium leading-tight block">Hands-on Courses</span>
              </div>
              <div className="pl-2 sm:pl-4">
                <span className="text-xl sm:text-3xl font-bold text-[#111D35] block leading-none mb-1">
                  95%
                </span>
                <span className="text-[10px] sm:text-xs text-[#667085] font-medium leading-tight block">Career Support</span>
              </div>
            </div>

            {/* Social Proof Row with 3 Student Avatars */}
            <div className="pt-1 flex items-center gap-3">
              <div className="flex -space-x-2">
                <div className="relative w-8 h-8 rounded-full border-2 border-white overflow-hidden shadow-xs">
                  <Image src="/images/avatar-1.jpg" alt="Student" fill className="object-cover" />
                </div>
                <div className="relative w-8 h-8 rounded-full border-2 border-white overflow-hidden shadow-xs">
                  <Image src="/images/avatar-2.jpg" alt="Student" fill className="object-cover" />
                </div>
                <div className="relative w-8 h-8 rounded-full border-2 border-white overflow-hidden shadow-xs">
                  <Image src="/images/avatar-3.jpg" alt="Student" fill className="object-cover" />
                </div>
              </div>
              <div className="text-xs text-[#667085] leading-tight font-medium">
                <span>Real learning experiences.</span><br />
                <span>Real career transitions.</span>
              </div>
            </div>
          </div>

          {/* Right Large Edge-to-Edge Educational Photography with Organic Curved Transition */}
          <div className="lg:col-span-6 xl:col-span-6 relative w-full h-[360px] sm:h-[460px] lg:h-auto lg:min-h-full overflow-hidden">
            {/* Image Container that bleeds 100% to the right and bottom edges */}
            <div className="absolute inset-0 w-full h-full overflow-hidden">
              <Image
                src="/images/hero-student-laptop.jpg"
                alt="VLEARNN software engineering student focused on laptop in modern tech campus"
                fill
                priority
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover object-[60%_center] lg:object-center"
              />

              {/* Organic Curved SVG Mask on Desktop (Transitioning white canvas into photo) */}
              <svg
                className="absolute inset-y-0 left-0 h-full w-24 sm:w-32 lg:w-40 xl:w-48 text-[#FAF9F6] fill-current pointer-events-none hidden lg:block"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <path d="M0,0 L65,0 C30,35 85,65 15,100 L0,100 Z" />
              </svg>

              {/* Floating Handwritten Script Callout */}
              <div className="absolute top-8 left-8 lg:left-16 xl:left-20 hidden sm:block pointer-events-none">
                <div className="bg-white/70 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-white/50 shadow-xs transform -rotate-3">
                  <span className="font-serif italic text-[#111D35] text-xs sm:text-sm font-semibold block leading-tight">
                    From Learning<br />to Real<br />Opportunities ↗
                  </span>
                </div>
              </div>

              {/* Floating Information Panel (Lower Right of Hero) */}
              <div className="absolute bottom-4 sm:bottom-8 left-4 right-4 sm:left-auto sm:right-8 lg:right-10 xl:right-14 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-white/80 p-3 sm:p-4 flex items-center gap-3 sm:gap-4 max-w-sm sm:max-w-md">
                {/* Thumbnail */}
                <div className="w-12 h-10 sm:w-14 sm:h-12 relative rounded-lg overflow-hidden flex-shrink-0 border border-[#E5E7EB]">
                  <Image
                    src="/images/floating-card-thumb.jpg"
                    alt="Instructor collaborating with students"
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Center Text with Gold Accent Line */}
                <div className="min-w-0 flex-1">
                  <span className="font-bold text-xs sm:text-sm text-[#111D35] block leading-snug">
                    Practical learning.<br />
                    Real-world projects.
                  </span>
                  <span className="w-8 h-0.5 bg-[#C59A56] block mt-1 rounded-full" />
                </div>

                {/* Vertical Divider */}
                <div className="w-px h-8 sm:h-10 bg-[#E5E7EB] flex-shrink-0" />

                {/* Right Description */}
                <div className="text-[10px] sm:text-[11px] text-[#667085] leading-tight max-w-[120px] sm:max-w-[135px] flex-shrink-0 font-normal">
                  Expert-led training with industry-relevant curriculum.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 2. TECHNOLOGY STRIP (FULL WIDTH RECREATION MATCHING REFERENCE) */}
      {/* ============================================================== */}
      <TechnologyStrip />

      {/* ============================================================== */}
      {/* 3. ABOUT VLEARNN (EDITORIAL RECREATION MATCHING REFERENCE)     */}
      {/* ============================================================== */}
      <section className="py-14 sm:py-20 lg:py-28 bg-[#FAF9F6] border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">
            {/* Left Dominant Architectural Environment Photograph */}
            <div className="lg:col-span-6 relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-slate-900/10 border border-[#E5E7EB] bg-white group">
                <Image
                  src="/images/about-learning-campus.jpg"
                  alt="A Learning Environment Built for Your Future - VLEARNN Campus"
                  width={900}
                  height={600}
                  className="w-full h-auto object-cover aspect-[4/3] group-hover:scale-[1.02] transition-transform duration-700 ease-out"
                  loading="eager"
                />
              </div>
            </div>

            {/* Right Editorial Typography */}
            <div className="lg:col-span-6 space-y-6">
              {/* Eyebrow */}
              <div className="flex items-center gap-2">
                <span className="w-1 h-3.5 bg-[#C59A56] rounded-full inline-block" />
                <span className="text-[11px] font-bold text-[#667085] tracking-[0.2em] uppercase">
                  ABOUT VLEARNN
                </span>
              </div>

              {/* Headline */}
              <h2 className="text-2xl sm:text-4xl lg:text-[46px] font-bold tracking-tight text-[#111D35] leading-[1.12]">
                A Learning Environment<br />Built for Your Future
              </h2>

              {/* Description */}
              <p className="text-base sm:text-lg text-[#667085] leading-relaxed font-normal max-w-xl">
                VLEARNN is a technology training institute focused on practical learning, real-time projects, and career-oriented skills. We bridge the gap between academic knowledge and industry requirements with hands-on training and expert guidance.
              </p>

              {/* Action Button */}
              <div className="pt-2">
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 bg-white hover:bg-[#F7F8FA] text-[#111D35] text-sm font-semibold px-6 py-3.5 rounded-lg border border-[#E5E7EB] hover:border-[#111D35] transition-all shadow-sm"
                >
                  <span>Know More About Us</span>
                  <ArrowRight className="w-4 h-4 text-[#2463A6]" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 3. ACADEMIC PROGRAMS (EXACT REFERENCE RECREATION)              */}
      {/* ============================================================== */}
      <AcademicProgramsSection courses={featuredCourses} />

      {/* ============================================================== */}
      {/* 4. PRACTICAL TRAINING METHODOLOGY (CONTINUOUS LINEAR FLOW)     */}
      {/* ============================================================== */}
      <section className="py-14 sm:py-20 lg:py-28 border-b border-[#E5E7EB] bg-[#F7F8FA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16">
          <div className="max-w-3xl space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#2463A6] block">
              Teaching Methodology
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1C1C1C]">
              A Rigorous, Five-Stage Engineering Framework
            </h2>
            <p className="text-xs sm:text-sm text-[#60656D] leading-relaxed">
              Every course follows an intentional progression from core systems fundamentals to deployable architecture.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 sm:gap-8">
            {[
              {
                step: "01",
                title: "Core Fundamentals",
                desc: "Data structures, algorithms, runtime complexity, and foundational language concepts.",
              },
              {
                step: "02",
                title: "Modern Frameworks",
                desc: "Full stack architectures, asynchronous runtimes, relational schemas, and APIs.",
              },
              {
                step: "03",
                title: "Applied Projects",
                desc: "Real multi-tier applications constructed from specifications with live edge cases.",
              },
              {
                step: "04",
                title: "Code Reviews & PRs",
                desc: "Peer review cycles, automated linters, unit tests, and production code standards.",
              },
              {
                step: "05",
                title: "Career & Interviews",
                desc: "Technical systems walkthroughs, live coding rounds, and direct hiring partner exposure.",
              },
            ].map((st) => (
              <div key={st.step} className="space-y-3 border-t-2 border-[#2463A6] pt-4">
                <span className="font-mono text-xs font-bold text-[#2463A6]">STAGE {st.step}</span>
                <h3 className="text-base font-bold text-[#1C1C1C] leading-snug">{st.title}</h3>
                <p className="text-xs text-[#60656D] leading-relaxed">{st.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 5. TECHNOLOGIES & DOMAINS (STRUCTURED CAPABILITY MATRIX)       */}
      {/* ============================================================== */}
      <section className="py-14 sm:py-20 lg:py-28 border-b border-[#E5E7EB] bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-12">
          <div className="max-w-3xl space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#2463A6] block">
              Curriculum Stack
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1C1C1C]">
              Technologies & Applied Skills
            </h2>
            <p className="text-xs sm:text-sm text-[#60656D]">
              Our modules focus strictly on industry-standard engineering stacks utilized by top technical teams.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="p-6 rounded bg-[#F7F8FA] border border-[#E5E7EB] space-y-3">
              <span className="text-xs font-bold text-[#2463A6] uppercase tracking-wider block">
                Frontend & UI Systems
              </span>
              <p className="text-xs text-[#60656D] leading-relaxed">
                Component architecture, state managers, server rendering, accessibility, and bundle optimization.
              </p>
              <div className="flex flex-wrap gap-1.5 pt-2">
                {["TypeScript", "React", "Next.js", "Tailwind CSS", "Web Vitals"].map((t) => (
                  <span key={t} className="px-2 py-0.5 rounded bg-white text-[#1C1C1C] border border-[#E5E7EB] text-[11px] font-medium font-mono">
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-6 rounded bg-[#F7F8FA] border border-[#E5E7EB] space-y-3">
              <span className="text-xs font-bold text-[#2463A6] uppercase tracking-wider block">
                Backend & Services
              </span>
              <p className="text-xs text-[#60656D] leading-relaxed">
                RESTful and GraphQL service architectures, microservice isolation, JWT auth, and concurrency.
              </p>
              <div className="flex flex-wrap gap-1.5 pt-2">
                {["Node.js", "Express", "Python", "REST", "GraphQL", "JWT"].map((t) => (
                  <span key={t} className="px-2 py-0.5 rounded bg-white text-[#1C1C1C] border border-[#E5E7EB] text-[11px] font-medium font-mono">
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-6 rounded bg-[#F7F8FA] border border-[#E5E7EB] space-y-3">
              <span className="text-xs font-bold text-[#2463A6] uppercase tracking-wider block">
                Cloud & Orchestration
              </span>
              <p className="text-xs text-[#60656D] leading-relaxed">
                Container management, automated build pipelines, virtualized networking, and cloud storage.
              </p>
              <div className="flex flex-wrap gap-1.5 pt-2">
                {["Docker", "Kubernetes", "AWS", "CI/CD", "Linux", "Nginx"].map((t) => (
                  <span key={t} className="px-2 py-0.5 rounded bg-white text-[#1C1C1C] border border-[#E5E7EB] text-[11px] font-medium font-mono">
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-6 rounded bg-[#F7F8FA] border border-[#E5E7EB] space-y-3">
              <span className="text-xs font-bold text-[#2463A6] uppercase tracking-wider block">
                Databases & Machine Learning
              </span>
              <p className="text-xs text-[#60656D] leading-relaxed">
                Relational schema design, ACID transactions, document stores, and applied ML APIs.
              </p>
              <div className="flex flex-wrap gap-1.5 pt-2">
                {["PostgreSQL", "MongoDB", "Redis", "Pandas", "Scikit-Learn", "FastAPI"].map((t) => (
                  <span key={t} className="px-2 py-0.5 rounded bg-white text-[#1C1C1C] border border-[#E5E7EB] text-[11px] font-medium font-mono">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 6. WHY VLEARNN (TWO-COLUMN INSTITUTIONAL COMPARISON)           */}
      {/* ============================================================== */}
      <section className="py-14 sm:py-20 lg:py-28 border-b border-[#E5E7EB] bg-[#F7F8FA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            <div className="lg:col-span-5 space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#2463A6] block">
                Educational Excellence
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1C1C1C] leading-snug">
                Why Engineering Teams Trust VLEARNN Graduates
              </h2>
              <p className="text-xs sm:text-sm text-[#60656D] leading-relaxed">
                We measure our success not by the number of enrolled students, but by their ability to contribute to production software codebases on day one of employment.
              </p>

              <div className="pt-2">
                <Link
                  href="/about"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2463A6] hover:text-[#1E5289]"
                >
                  <span>Learn about our academic governance</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="p-5 sm:p-6 rounded bg-white border border-[#E5E7EB] shadow-sm space-y-2">
                <span className="text-xs font-mono font-bold text-[#2463A6]">01</span>
                <h4 className="text-sm font-bold text-[#1C1C1C]">Dedicated Lab Sessions</h4>
                <p className="text-xs text-[#60656D] leading-relaxed">
                  Students write code in real terminal environments, Git repositories, and local development machines.
                </p>
              </div>

              <div className="p-5 sm:p-6 rounded bg-white border border-[#E5E7EB] shadow-sm space-y-2">
                <span className="text-xs font-mono font-bold text-[#2463A6]">02</span>
                <h4 className="text-sm font-bold text-[#1C1C1C]">Continuous Mentorship</h4>
                <p className="text-xs text-[#60656D] leading-relaxed">
                  Direct code feedback from instructors who understand enterprise architectural patterns and common pitfalls.
                </p>
              </div>

              <div className="p-5 sm:p-6 rounded bg-white border border-[#E5E7EB] shadow-sm space-y-2">
                <span className="text-xs font-mono font-bold text-[#2463A6]">03</span>
                <h4 className="text-sm font-bold text-[#1C1C1C]">Full Stack Autonomy</h4>
                <p className="text-xs text-[#60656D] leading-relaxed">
                  Learn how to take a feature from requirement analysis and database migration to production deployment.
                </p>
              </div>

              <div className="p-5 sm:p-6 rounded bg-white border border-[#E5E7EB] shadow-sm space-y-2">
                <span className="text-xs font-mono font-bold text-[#2463A6]">04</span>
                <h4 className="text-sm font-bold text-[#1C1C1C]">Structured Career Advisory</h4>
                <p className="text-xs text-[#60656D] leading-relaxed">
                  Mock technical evaluations, resume audits, and direct introductions to engineering hiring teams.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 7. STUDENT TESTIMONIALS (CLEAN PULL-QUOTES FROM FIRESTORE)      */}
      {/* ============================================================== */}
      {testimonials.length > 0 && (
        <section className="py-14 sm:py-20 lg:py-28 border-b border-[#E5E7EB] bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-12">
            <div className="max-w-3xl space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#2463A6] block">
                Learner Outcomes
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1C1C1C]">
                Verified Graduate Experiences
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {testimonials.map((t) => (
                <div
                  key={t.id}
                  className="p-6 sm:p-8 rounded bg-[#F7F8FA] border border-[#E5E7EB] flex flex-col justify-between space-y-6"
                >
                  <blockquote className="text-xs sm:text-sm text-[#1C1C1C] leading-relaxed italic">
                    "{t.quote}"
                  </blockquote>

                  <div className="pt-4 border-t border-[#E5E7EB]">
                    <span className="text-sm font-bold text-[#1C1C1C] block">{t.studentName}</span>
                    <span className="text-xs text-[#60656D] block">
                      {t.role} • {t.company}
                    </span>
                    <span className="text-[11px] font-semibold text-[#2463A6] block mt-1">
                      {t.courseName}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============================================================== */}
      {/* 8. ADMISSIONS CONSULTATION & ENQUIRY CTA BANNER                 */}
      {/* ============================================================== */}
      <section className="py-12 sm:py-16 lg:py-24 bg-[#F1F6FB] border-t border-[#E2E6EB] text-[#10264A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 sm:gap-8 bg-white p-6 sm:p-10 lg:p-12 rounded-2xl sm:rounded-3xl border border-[#E2E6EB] shadow-xs">
            <div className="max-w-2xl space-y-2.5 sm:space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#2463A6] block">
                Upcoming Cohort Enrolment
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#10264A] leading-tight">
                Plan Your Engineering Transition Today.
              </h2>
              <p className="text-xs sm:text-base text-[#475569] leading-relaxed font-normal">
                Speak directly with an academic counsellor to assess your technical background, review batch timings, and select the optimal program.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto flex-shrink-0">
              <Link
                href="/contact"
                className="text-center bg-[#10264A] hover:bg-[#2463A6] text-white font-semibold px-6 py-3.5 rounded-xl text-xs sm:text-sm transition-all shadow-sm whitespace-nowrap"
              >
                Schedule Admissions Call
              </Link>
              <Link
                href="/courses"
                className="text-center bg-white hover:bg-[#F8FAFC] text-[#10264A] font-semibold px-6 py-3.5 rounded-xl text-xs sm:text-sm border border-[#CBD5E1] hover:border-[#10264A] transition-colors shadow-2xs whitespace-nowrap"
              >
                Browse Catalog
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
