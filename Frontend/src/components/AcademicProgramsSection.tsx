"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Play,
  X,
  Folder,
  Users,
  BarChart2,
  FileText,
} from "lucide-react";
import { Course } from "@/types";
import { getCoursePresentation } from "@/lib/courseImages";

interface AcademicProgramsSectionProps {
  courses: Course[];
  initialCategory?: string;
  isCoursePage?: boolean;
}

export function AcademicProgramsSection({
  courses,
  initialCategory = "ALL",
  isCoursePage = false,
}: AcademicProgramsSectionProps) {
  const [activeCategorySlug, setActiveCategorySlug] = useState<string>(initialCategory);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const categoryTrackRef = useRef<HTMLDivElement>(null);

  const scrollCategoryTrack = (direction: "left" | "right") => {
    if (!categoryTrackRef.current) return;
    const scrollAmount = 240;
    categoryTrackRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  const categoryFilters = [
    { key: "ALL", label: "All Programs", count: courses.length },
    {
      key: "web",
      label: "Web Development",
      count: courses.filter((c) => getCoursePresentation(c.slug).categoryFilterKey === "web").length || 1,
    },
    {
      key: "data",
      label: "Data & Analytics",
      count: courses.filter((c) => getCoursePresentation(c.slug).categoryFilterKey === "data").length || 1,
    },
    {
      key: "cloud",
      label: "Cloud & DevOps",
      count: courses.filter((c) => getCoursePresentation(c.slug).categoryFilterKey === "cloud").length || 1,
    },
    {
      key: "cyber",
      label: "Cybersecurity",
      count: courses.filter((c) => getCoursePresentation(c.slug).categoryFilterKey === "cyber").length || 1,
    },
    {
      key: "ai",
      label: "AI & Machine Learning",
      count: courses.filter((c) => getCoursePresentation(c.slug).categoryFilterKey === "ai").length || 1,
    },
    {
      key: "design",
      label: "Design & Product",
      count: courses.filter((c) => getCoursePresentation(c.slug).categoryFilterKey === "design").length || 1,
    },
  ];

  const displayedCourses = (
    activeCategorySlug === "ALL"
      ? courses
      : courses.filter((c) => {
          const pres = getCoursePresentation(c.slug);
          return (
            pres.categoryFilterKey === activeCategorySlug ||
            c.category?.slug === activeCategorySlug
          );
        })
  )
    .slice()
    .sort((a, b) => {
      const orderA = getCoursePresentation(a.slug).orderNumber;
      const orderB = getCoursePresentation(b.slug).orderNumber;
      return orderA.localeCompare(orderB);
    });

  return (
    <section className="py-12 sm:py-16 lg:py-20 border-b border-[#E2E6EB] bg-white font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-12">
        {/* 1. SECTION INTRODUCTION AND HERO AREA */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center">
          {/* Left Column: Eyebrow, Heading, Description, Actions */}
          <div className="lg:col-span-5 space-y-5">
            {/* Eyebrow Label with Champagne Gold Accent Line */}
            <div className="flex items-center gap-3">
              <span className="w-8 h-0.5 bg-[#C79543] rounded-full inline-block" />
              <span className="text-[11px] font-bold text-[#10264A] tracking-[0.2em] uppercase">
                ACADEMIC PROGRAMS
              </span>
            </div>

            {/* Main Heading */}
            <h2 className="text-3xl sm:text-4xl lg:text-[40px] xl:text-[44px] font-bold tracking-tight text-[#10264A] leading-[1.12]">
              Explore Industry-Relevant Programs
            </h2>

            {/* Supporting Text */}
            <p className="text-sm sm:text-base text-[#687586] leading-relaxed max-w-lg font-normal">
              Choose from our carefully designed programs to gain hands-on experience and build a successful career in technology.
            </p>

            {/* Action Buttons */}
            <div className="pt-1 flex flex-wrap items-center gap-4">
              <Link
                href={isCoursePage ? "/contact" : "/courses"}
                className="inline-flex items-center gap-2 bg-[#10264A] hover:bg-[#2463A6] text-white text-xs sm:text-sm font-semibold px-6 py-3.5 rounded-xl transition-all shadow-sm"
              >
                <span>{isCoursePage ? "Enquire Now" : "View All Programs"}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <button
                type="button"
                onClick={() => setIsVideoModalOpen(true)}
                className="inline-flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-[#10264A] hover:text-[#2463A6] transition-colors group cursor-pointer"
              >
                <span className="w-9 h-9 rounded-full border border-[#E2E6EB] bg-white flex items-center justify-center text-[#10264A] group-hover:border-[#2463A6] group-hover:text-[#2463A6] transition-all shadow-xs">
                  <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                </span>
                <span>Watch Program Overview</span>
              </button>
            </div>
          </div>

          {/* Right Column: Unified Workstation Photography Composition (NO PEOPLE) */}
          <div className="lg:col-span-7 relative w-full aspect-[16/10] sm:aspect-[998/398] rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg shadow-slate-900/5 border border-[#E2E6EB]/60 bg-[#FAF9F6]">
            <Image
              src="/images/academic-hero-workstation.jpg"
              alt="Modern developer workstation with code editor, keyboard, monitor, and development tools"
              fill
              className="object-cover object-center"
              sizes="(max-width: 1024px) 100vw, 58vw"
              priority
            />
          </div>
        </div>

        {/* 2. CATEGORY NAVIGATION */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 pb-2">
          {/* Filter Pills Track */}
          <div
            ref={categoryTrackRef}
            className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none flex-1 max-w-full touch-pan-x"
          >
            {categoryFilters.map((cat) => {
              const isActive = activeCategorySlug === cat.key;
              return (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => setActiveCategorySlug(cat.key)}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 whitespace-nowrap cursor-pointer ${
                    isActive
                      ? "bg-[#10264A] text-white shadow-xs"
                      : "bg-white text-[#687586] hover:text-[#10264A] border border-[#E2E6EB] hover:border-[#10264A]"
                  }`}
                >
                  {cat.label} ({cat.count})
                </button>
              );
            })}
          </div>

          {/* Right Controls: Arrow Navigation and View All Link */}
          <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-auto">
            <button
              type="button"
              onClick={() => scrollCategoryTrack("left")}
              aria-label="Scroll categories left"
              className="w-7 h-7 rounded-full border border-[#E2E6EB] bg-white hover:bg-slate-50 text-[#10264A] flex items-center justify-center transition-colors shadow-2xs cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => scrollCategoryTrack("right")}
              aria-label="Scroll categories right"
              className="w-7 h-7 rounded-full border border-[#E2E6EB] bg-white hover:bg-slate-50 text-[#10264A] flex items-center justify-center transition-colors shadow-2xs cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            {!isCoursePage ? (
              <Link
                href="/courses"
                className="text-xs sm:text-[13px] font-bold text-[#10264A] hover:text-[#2463A6] transition-colors inline-flex items-center gap-1 ml-1 whitespace-nowrap"
              >
                <span>View All Programs</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <span className="text-xs font-semibold text-[#687586] ml-2">
                Showing {displayedCourses.length} Programs
              </span>
            )}
          </div>
        </div>

        {/* 3. COURSE CARDS (EXACT EDITORIAL 6-CARD GRID) */}
        {displayedCourses.length === 0 ? (
          <div className="py-16 text-center text-sm text-[#687586] bg-[#FAF9F6] rounded-2xl border border-[#E2E6EB]">
            <span>No courses found in this category. </span>
            <button
              type="button"
              onClick={() => setActiveCategorySlug("ALL")}
              className="text-[#2463A6] font-semibold underline ml-1 cursor-pointer"
            >
              View all courses
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
            {displayedCourses.map((course, index) => {
              const pres = getCoursePresentation(
                course.slug,
                index,
                course.title,
                course.summary,
                course.duration
              );

              return (
                <Link
                  key={course.id}
                  href={`/courses/${course.slug}`}
                  className={`group relative flex flex-col justify-between rounded-2xl overflow-hidden min-h-[420px] sm:min-h-[430px] lg:min-h-[400px] ${pres.bgClass} border border-[#E2E6EB] shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300`}
                >
                  {/* Right-Side Integrated Photograph (NO PEOPLE) */}
                  <div className="absolute inset-y-0 right-0 w-[45%] sm:w-[48%] overflow-hidden pointer-events-none">
                    <Image
                      src={pres.imageSrc}
                      alt={pres.imageAlt}
                      fill
                      className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />

                    {/* Card-Specific Mask Treatments */}
                    {pres.curveType === "organic-1" && (
                      <svg
                        className="absolute inset-y-0 left-0 h-full w-14 sm:w-18 text-[#F8F5EE] fill-current pointer-events-none"
                        viewBox="0 0 100 100"
                        preserveAspectRatio="none"
                        aria-hidden="true"
                      >
                        <path d="M0,0 L65,0 C20,30 75,70 15,100 L0,100 Z" />
                      </svg>
                    )}

                    {pres.curveType === "organic-2" && (
                      <svg
                        className="absolute inset-y-0 left-0 h-full w-16 sm:w-20 text-[#F1F5FB] fill-current pointer-events-none"
                        viewBox="0 0 100 100"
                        preserveAspectRatio="none"
                        aria-hidden="true"
                      >
                        <path d="M0,0 L60,0 C15,35 70,65 10,100 L0,100 Z" />
                      </svg>
                    )}

                    {pres.curveType === "angled" && (
                      <>
                        <svg
                          className="absolute inset-y-0 left-0 h-full w-12 sm:w-16 text-[#F8F5EE] fill-current pointer-events-none"
                          viewBox="0 0 100 100"
                          preserveAspectRatio="none"
                          aria-hidden="true"
                        >
                          <path d="M0,0 L100,0 L0,100 Z" />
                        </svg>
                        {/* Distinctive Champagne Gold Diagonal Slash */}
                        <div className="absolute top-8 left-2 w-1 h-14 bg-[#C79543] -rotate-12 rounded-full pointer-events-none z-10" />
                      </>
                    )}

                    {pres.curveType === "asymmetric" && (
                      <svg
                        className="absolute inset-y-0 left-0 h-full w-14 sm:w-18 text-[#F3F6FA] fill-current pointer-events-none"
                        viewBox="0 0 100 100"
                        preserveAspectRatio="none"
                        aria-hidden="true"
                      >
                        <path d="M0,0 L75,0 C30,25 65,75 20,100 L0,100 Z" />
                      </svg>
                    )}

                    {pres.curveType === "wave" && (
                      <svg
                        className="absolute inset-y-0 left-0 h-full w-14 sm:w-20 text-[#F8F5EE] fill-current pointer-events-none"
                        viewBox="0 0 100 100"
                        preserveAspectRatio="none"
                        aria-hidden="true"
                      >
                        <path d="M0,0 L50,0 C10,30 80,70 15,100 L0,100 Z" />
                      </svg>
                    )}

                    {pres.curveType === "curved-blush" && (
                      <svg
                        className="absolute inset-y-0 left-0 h-full w-14 sm:w-20 text-[#FBF4F1] fill-current pointer-events-none"
                        viewBox="0 0 100 100"
                        preserveAspectRatio="none"
                        aria-hidden="true"
                      >
                        <path d="M0,0 L65,0 C20,30 75,65 15,100 L0,100 Z" />
                      </svg>
                    )}
                  </div>

                  {/* Left-Side Content Area */}
                  <div className="relative z-10 p-5 sm:p-7 flex flex-col justify-between h-full max-w-[58%]">
                    {/* Top: Order Number and Title */}
                    <div>
                      {/* Course Number with Gold Accent */}
                      <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
                        <span className="w-5 h-0.5 bg-[#C79543] rounded-full inline-block" />
                        <span className="text-xs font-bold text-[#10264A] tracking-wider uppercase font-mono">
                          {pres.orderNumber}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-base sm:text-lg lg:text-[21px] font-bold text-[#10264A] group-hover:text-[#2463A6] transition-colors leading-[1.25] tracking-tight">
                        {pres.title}
                      </h3>

                      {/* Summary */}
                      <p className="text-xs sm:text-[13px] text-[#687586] leading-relaxed font-normal mt-1.5 sm:mt-2 line-clamp-2 sm:line-clamp-none">
                        {pres.summary}
                      </p>

                      {/* Tech Stack Chips */}
                      <div className="flex flex-wrap items-center gap-x-2.5 sm:gap-x-3.5 gap-y-1 sm:gap-y-1.5 pt-2 sm:pt-3">
                        {pres.techStack.map((tech) => (
                          <span
                            key={tech.name}
                            className="inline-flex items-center gap-1.5 text-[#10264A] text-[11px] sm:text-[12px] font-semibold"
                          >
                            <span
                              className="w-2 h-2 rounded-full flex-shrink-0"
                              style={{ backgroundColor: tech.color }}
                            />
                            <span>{tech.name}</span>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Bottom Action: [○ →] View Program */}
                    <div className="pt-4 sm:pt-5 flex items-center gap-2 sm:gap-2.5">
                      <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white text-[#10264A] border border-[#E2E6EB] group-hover:bg-[#10264A] group-hover:text-white group-hover:border-[#10264A] transition-all duration-300 flex items-center justify-center shadow-2xs">
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                      <span className="text-xs sm:text-[13px] font-semibold text-[#10264A] group-hover:text-[#2463A6] transition-colors">
                        View Program
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* 4. BOTTOM LEARNING BENEFITS STRIP */}
        <div className="rounded-2xl sm:rounded-3xl border border-[#E2E6EB] bg-[#F8FAFC] p-4 sm:p-5 lg:px-8 lg:py-5 shadow-xs flex flex-col lg:flex-row items-center justify-between gap-5 sm:gap-6">
          {/* 4 Items in horizontal row on desktop */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 flex-1 w-full lg:w-auto items-center">
            {/* Item 1 */}
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-[#EAF2FB] text-[#2463A6] flex items-center justify-center flex-shrink-0 shadow-2xs">
                <Folder className="w-4 h-4" />
              </span>
              <div className="min-w-0">
                <span className="text-xs sm:text-[13px] font-bold text-[#10264A] block leading-snug">
                  Project-Based Learning
                </span>
                <span className="text-[11px] text-[#687586] block leading-snug">
                  Build real solutions
                </span>
              </div>
            </div>

            {/* Item 2 */}
            <div className="flex items-center gap-3 lg:border-l lg:border-[#E2E6EB] lg:pl-6">
              <span className="w-10 h-10 rounded-xl bg-[#EAF2FB] text-[#2463A6] flex items-center justify-center flex-shrink-0 shadow-2xs">
                <Users className="w-4 h-4" />
              </span>
              <div className="min-w-0">
                <span className="text-xs sm:text-[13px] font-bold text-[#10264A] block leading-snug">
                  Industry-Experienced Faculty
                </span>
                <span className="text-[11px] text-[#687586] block leading-snug">
                  Learn from professionals
                </span>
              </div>
            </div>

            {/* Item 3 */}
            <div className="flex items-center gap-3 lg:border-l lg:border-[#E2E6EB] lg:pl-6">
              <span className="w-10 h-10 rounded-xl bg-[#EAF2FB] text-[#2463A6] flex items-center justify-center flex-shrink-0 shadow-2xs">
                <BarChart2 className="w-4 h-4" />
              </span>
              <div className="min-w-0">
                <span className="text-xs sm:text-[13px] font-bold text-[#10264A] block leading-snug">
                  Career-Focused Curriculum
                </span>
                <span className="text-[11px] text-[#687586] block leading-snug">
                  Designed for industry needs
                </span>
              </div>
            </div>

            {/* Item 4 */}
            <div className="flex items-center gap-3 lg:border-l lg:border-[#E2E6EB] lg:pl-6">
              <span className="w-10 h-10 rounded-xl bg-[#EAF2FB] text-[#2463A6] flex items-center justify-center flex-shrink-0 shadow-2xs">
                <FileText className="w-4 h-4" />
              </span>
              <div className="min-w-0">
                <span className="text-xs sm:text-[13px] font-bold text-[#10264A] block leading-snug">
                  Practical Assessments
                </span>
                <span className="text-[11px] text-[#687586] block leading-snug">
                  Case studies & live projects
                </span>
              </div>
            </div>
          </div>

          {/* CTA Button on Right */}
          <Link
            href={isCoursePage ? "/contact" : "/courses"}
            className="inline-flex items-center gap-2 bg-[#10264A] hover:bg-[#2463A6] text-white text-xs sm:text-sm font-semibold px-6 py-3.5 rounded-xl transition-all shadow-sm flex-shrink-0 self-stretch sm:self-auto justify-center"
          >
            <span>{isCoursePage ? "Enquire for Batch" : "Explore All Programs"}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Video Overview Modal */}
      {isVideoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/20">
            <div className="flex items-center justify-between p-4 bg-zinc-900 border-b border-zinc-800 text-white">
              <span className="text-sm font-semibold">VLEARNN Academic Overview</span>
              <button
                type="button"
                onClick={() => setIsVideoModalOpen(false)}
                className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-300 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="relative aspect-video w-full bg-black flex items-center justify-center">
              <div className="text-center p-8 space-y-4">
                <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto text-white">
                  <Play className="w-8 h-8 fill-current ml-1" />
                </div>
                <h4 className="text-lg font-bold text-white">VLEARNN Academic Programs Tour</h4>
                <p className="text-xs text-zinc-400 max-w-md mx-auto">
                  Watch our faculty lead explain our hands-on engineering methodology, production-grade lab environment, and live project mentoring.
                </p>
                <div className="pt-2">
                  <Link
                    href="/contact"
                    onClick={() => setIsVideoModalOpen(false)}
                    className="inline-flex items-center gap-2 bg-[#2463A6] hover:bg-[#1E5289] text-white text-xs font-semibold px-5 py-2.5 rounded-lg transition-colors"
                  >
                    <span>Schedule an In-Person Campus Tour</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
