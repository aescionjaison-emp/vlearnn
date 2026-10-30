"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Clock,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  AlertCircle,
  Award,
  Laptop,
  Check,
  Calendar,
} from "lucide-react";
import { Course } from "@/types";
import { fetchCourseBySlug } from "@/lib/api";
import { usePublicRealtime } from "@/lib/usePublicRealtime";

interface CourseDetailClientProps {
  initialCourse: Course;
  slug: string;
}

export function CourseDetailClient({ initialCourse, slug }: CourseDetailClientProps) {
  const [course, setCourse] = useState<Course | null>(initialCourse);
  const [isUnpublished, setIsUnpublished] = useState(false);

  // Live real-time updates for open course detail page
  usePublicRealtime(
    async (event) => {
      if (event === "courses_updated") {
        try {
          const freshCourse = await fetchCourseBySlug(slug);
          if (!freshCourse || !freshCourse.isPublished || freshCourse.isArchived) {
            setIsUnpublished(true);
          } else {
            setCourse(freshCourse);
            setIsUnpublished(false);
          }
        } catch {
          setIsUnpublished(true);
        }
      }
    },
    ["courses_updated"]
  );

  if (isUnpublished || !course) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center space-y-6 font-sans">
        <div className="p-10 bg-[#F7F8FA] border border-[#E5E7EB] space-y-4">
          <AlertCircle className="w-10 h-10 text-[#2463A6] mx-auto" />
          <h1 className="text-2xl font-bold text-[#17324D]">
            Program Curriculum Currently Unavailable
          </h1>
          <p className="text-sm text-[#60656D] max-w-md mx-auto">
            This training program is currently undergoing curriculum revision or has been archived by the academic department.
          </p>
          <div className="pt-2">
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#17324D] text-white font-semibold text-xs hover:bg-[#2463A6] transition-colors"
            >
              <span>Explore All Active Courses</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-14 pb-28 font-sans bg-white">
      {/* Editorial Header Section */}
      <section className="bg-[#F7F8FA] border-b border-[#E5E7EB] pt-12 pb-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center gap-2 text-xs text-[#60656D]">
            <Link href="/" className="hover:text-[#2463A6] transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/courses" className="hover:text-[#2463A6] transition-colors">
              Courses
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-[#17324D] font-semibold truncate">{course.title}</span>
          </nav>

          <div className="space-y-4 max-w-4xl">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-bold px-3 py-1 bg-[#EBF3FA] text-[#17324D] uppercase tracking-wider">
                {course.category?.name || "Professional"}
              </span>
              <span className="text-xs font-medium text-[#60656D] border border-[#E5E7EB] px-3 py-1 bg-white">
                Delivery Format: {course.learningMode}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#17324D] leading-tight">
              {course.title}
            </h1>

            <p className="text-base sm:text-lg text-[#60656D] leading-relaxed max-w-3xl font-normal">
              {course.summary}
            </p>
          </div>

          {/* Quick Specifications Strip */}
          <div className="pt-6 border-t border-[#E5E7EB] grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-4xl text-xs">
            <div className="space-y-1">
              <span className="text-[#60656D] font-medium block">Curriculum Duration</span>
              <div className="font-bold text-[#17324D] text-sm flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#2463A6]" />
                <span>{course.duration}</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[#60656D] font-medium block">Learning Format</span>
              <div className="font-bold text-[#17324D] text-sm flex items-center gap-1.5">
                <Laptop className="w-4 h-4 text-[#2463A6]" />
                <span>{course.learningMode}</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[#60656D] font-medium block">Total Tuition</span>
              <div className="font-bold text-[#17324D] text-sm">
                {course.fees ? `₹${course.fees.toLocaleString()}` : "Contact Admissions"}
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[#60656D] font-medium block">Next Cohort</span>
              <div className="font-bold text-[#2463A6] text-sm flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                <span>Enrolling Now</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Full Curriculum & Pedagogy */}
          <div className="lg:col-span-8 space-y-12">
            {/* Overview Statement */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-[#17324D] tracking-tight">
                Program Description & Scope
              </h2>
              <div className="text-sm sm:text-base text-[#60656D] leading-relaxed space-y-4 border-l-2 border-[#2463A6] pl-6 py-1">
                <p className="whitespace-pre-line">{course.description}</p>
              </div>
            </div>

            {/* Structured Module Breakdown (Syllabus) */}
            {course.modules && course.modules.length > 0 && (
              <div className="space-y-6">
                <div className="space-y-2 border-b border-[#E5E7EB] pb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#2463A6] block">
                    Detailed Syllabus
                  </span>
                  <h2 className="text-2xl font-bold text-[#17324D] tracking-tight">
                    Course Modules & Technical Outcomes
                  </h2>
                  <p className="text-xs sm:text-sm text-[#60656D]">
                    Each module combines architectural principles with mandatory code laboratories.
                  </p>
                </div>

                <div className="divide-y divide-[#E5E7EB] border-t border-b border-[#E5E7EB]">
                  {course.modules.map((mod, idx) => (
                    <div key={mod.id} className="py-6 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-[#2463A6]">
                          MODULE {String(idx + 1).padStart(2, "0")}
                        </span>
                        {mod.durationHours && (
                          <span className="text-xs text-[#60656D] font-medium bg-[#F7F8FA] px-2.5 py-1 border border-[#E5E7EB]">
                            {mod.durationHours} Hours Dedicated Practice
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg font-bold text-[#17324D]">{mod.title}</h3>

                      {mod.description && (
                        <p className="text-xs sm:text-sm text-[#60656D] leading-relaxed">
                          {mod.description}
                        </p>
                      )}

                      {mod.topics && mod.topics.length > 0 && (
                        <div className="pt-2">
                          <span className="text-[11px] font-bold text-[#17324D] uppercase tracking-wider block mb-2">
                            Skills & Competencies Covered:
                          </span>
                          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#1C1C1C]">
                            {mod.topics.map((t, topicIdx) => (
                              <li key={topicIdx} className="flex items-start gap-2">
                                <Check className="w-3.5 h-3.5 text-[#2463A6] flex-shrink-0 mt-0.5" />
                                <span>{t}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Prerequisites & Target Audience */}
            {course.eligibility && (
              <div className="bg-[#F7F8FA] border border-[#E5E7EB] p-6 sm:p-8 space-y-3">
                <div className="flex items-center gap-2 text-[#17324D] font-bold text-base">
                  <ShieldCheck className="w-5 h-5 text-[#2463A6]" />
                  <span>Prerequisites & Target Audience</span>
                </div>
                <p className="text-sm text-[#60656D] leading-relaxed">
                  {course.eligibility}
                </p>
              </div>
            )}

            {/* Capstone Project Guarantee */}
            <div className="border border-[#E5E7EB] p-6 sm:p-8 space-y-3">
              <h3 className="text-base font-bold text-[#17324D] flex items-center gap-2">
                <Award className="w-5 h-5 text-[#2463A6]" />
                <span>Production Portfolio Deliverable</span>
              </h3>
              <p className="text-sm text-[#60656D] leading-relaxed">
                Prior to course graduation, every participant deploys an end-to-end production application to cloud infrastructure, complete with automated CI/CD pipelines, automated testing, and comprehensive documentation for prospective employers.
              </p>
            </div>
          </div>

          {/* Right Column: Sticky Admissions Panel */}
          <div className="lg:col-span-4 sticky top-28 space-y-6">
            <div className="border border-[#E5E7EB] bg-[#F7F8FA] p-6 sm:p-7 space-y-5">
              <div className="space-y-1 border-b border-[#E5E7EB] pb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-[#2463A6] block">
                  Admissions Open
                </span>
                <h3 className="text-lg font-bold text-[#17324D]">
                  Enroll in this Track
                </h3>
                <p className="text-xs text-[#60656D] leading-relaxed">
                  Batches maintain a strict 15-student limit to ensure mentor oversight and weekly code reviews.
                </p>
              </div>

              <div className="space-y-3 text-xs text-[#60656D] divide-y divide-[#E5E7EB]">
                <div className="flex justify-between items-center pt-2">
                  <span>Batch Duration:</span>
                  <span className="font-semibold text-[#17324D]">{course.duration}</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span>Delivery Format:</span>
                  <span className="font-semibold text-[#17324D]">{course.learningMode}</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span>Mentorship:</span>
                  <span className="font-semibold text-[#17324D]">Senior Engineers</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span>Career Assistance:</span>
                  <span className="font-semibold text-[#17324D]">Resume + Mock Interviews</span>
                </div>
                {course.fees && (
                  <div className="flex justify-between items-center pt-3 text-sm">
                    <span className="text-[#17324D] font-bold">Total Course Fee:</span>
                    <span className="font-bold text-[#17324D]">
                      ₹{course.fees.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              <div className="pt-2 space-y-3">
                <Link
                  href={`/contact?course=${course.slug}`}
                  className="w-full text-center block bg-[#2463A6] hover:bg-[#1B4B80] text-white font-semibold py-3 px-4 text-xs tracking-wide transition-colors"
                >
                  Apply & Enquire for Batch
                </Link>

                <Link
                  href="/contact"
                  className="w-full text-center block bg-white hover:bg-white/80 border border-[#E5E7EB] text-[#17324D] font-semibold py-2.5 px-4 text-xs transition-colors"
                >
                  Speak with an Academic Advisor
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
