"use client";

import React, { useState } from "react";
import { Course, SiteSettings } from "@/types";
import { ContactFormClient } from "./ContactFormClient";
import { Mail, Phone, MessageSquare, Clock, Building } from "lucide-react";
import { fetchPublishedCourses, fetchSiteSettings } from "@/lib/api";
import { usePublicRealtime } from "@/lib/usePublicRealtime";

interface ContactPageClientProps {
  initialCourses: Course[];
  initialSettings: SiteSettings | null;
  preselectedCourseSlug: string;
  matchedCourseTitle: string | null;
}

export function ContactPageClient({
  initialCourses,
  initialSettings,
  preselectedCourseSlug,
  matchedCourseTitle,
}: ContactPageClientProps) {
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [settings, setSettings] = useState<SiteSettings | null>(initialSettings);

  usePublicRealtime(
    async (event) => {
      try {
        if (event === "public_settings_updated" || event === "site_content_updated") {
          const freshSettings = await fetchSiteSettings();
          if (freshSettings) setSettings(freshSettings);
        }
        if (event === "courses_updated") {
          const freshCourses = await fetchPublishedCourses();
          setCourses(freshCourses);
        }
      } catch (err) {
        console.warn("Contact page real-time sync error:", err);
      }
    },
    ["public_settings_updated", "site_content_updated", "courses_updated"]
  );

  const rawWhatsApp = settings?.whatsappNumber || "919876543210";
  const cleanWhatsApp = rawWhatsApp.replace(/\D/g, "");
  const waUrl = `https://wa.me/${cleanWhatsApp}?text=${encodeURIComponent(
    matchedCourseTitle
      ? `Hello VLEARNN Admissions! I would like to inquire about the ${matchedCourseTitle} program.`
      : "Hello VLEARNN Admissions! I would like to inquire about your upcoming technical training programs."
  )}`;

  return (
    <div className="space-y-14 pb-24 font-sans bg-white">
      {/* Corporate Editorial Header */}
      <section className="bg-[#F7F8FA] border-b border-[#E5E7EB] pt-14 pb-14 sm:pt-20 sm:pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-[#2463A6]">
            <span>Admissions & Inquiries</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#17324D] max-w-4xl leading-tight">
            Connect with Academic Admissions
          </h1>
          <p className="text-base sm:text-lg text-[#60656D] leading-relaxed max-w-3xl font-normal">
            Whether you require detailed syllabus breakdowns, prerequisite evaluations, fee schedules, or corporate team training options, our academic counselors respond within one business day.
          </p>
        </div>
      </section>

      {/* Main Split Layout */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Rebuilt Professional Form */}
          <div className="lg:col-span-8">
            <div className="border border-[#E5E7EB] p-4 sm:p-8 lg:p-10 bg-white">
              <div className="border-b border-[#E5E7EB] pb-5 mb-8">
                <span className="text-xs font-bold uppercase tracking-wider text-[#2463A6] block">
                  Candidate Submission Form
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-[#17324D] mt-1">
                  Submit an Official Course Inquiry
                </h2>
                <p className="text-xs sm:text-sm text-[#60656D] mt-1">
                  All fields are securely transmitted to the VLEARNN admissions coordination desk.
                </p>
              </div>

              <ContactFormClient
                courses={courses}
                preselectedCourseSlug={preselectedCourseSlug}
                matchedCourseTitle={matchedCourseTitle}
              />
            </div>
          </div>

          {/* Right Column: Campus & Communications Information */}
          <div className="lg:col-span-4 space-y-8">
            <div className="border border-[#E5E7EB] bg-[#F7F8FA] p-4 sm:p-6 lg:p-8 space-y-6">
              <h3 className="text-base font-bold text-[#17324D] border-b border-[#E5E7EB] pb-3">
                Campus Location & Operations
              </h3>

              <div className="space-y-5 text-xs sm:text-sm text-[#60656D]">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 font-bold text-[#17324D]">
                    <Building className="w-4 h-4 text-[#2463A6]" />
                    <span>Bangalore Technology Campus</span>
                  </div>
                  <p className="leading-relaxed pl-6">
                    {settings?.address ||
                      "VLEARNN Tech Campus, Innovation Square, Tech Corridor, Bangalore 560103, India"}
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 font-bold text-[#17324D]">
                    <Mail className="w-4 h-4 text-[#2463A6]" />
                    <span>Admissions Office Email</span>
                  </div>
                  <p className="pl-6">
                    <a
                      href={`mailto:${settings?.email || "admissions@vlearnn.com"}`}
                      className="text-[#2463A6] hover:underline font-medium"
                    >
                      {settings?.email || "admissions@vlearnn.com"}
                    </a>
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 font-bold text-[#17324D]">
                    <Phone className="w-4 h-4 text-[#2463A6]" />
                    <span>Direct Telephone Support</span>
                  </div>
                  <p className="pl-6">
                    <a
                      href={`tel:${settings?.phone || "+91 98765 43210"}`}
                      className="text-[#17324D] hover:text-[#2463A6] font-medium"
                    >
                      {settings?.phone || "+91 98765 43210"}
                    </a>
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 font-bold text-[#17324D]">
                    <Clock className="w-4 h-4 text-[#2463A6]" />
                    <span>Admissions Office Hours</span>
                  </div>
                  <p className="pl-6 text-xs">
                    Monday to Saturday: 9:00 AM – 7:00 PM IST<br />
                    Sunday: By prior scheduled appointment
                  </p>
                </div>
              </div>

              {/* Instant WhatsApp Channel */}
              <div className="pt-4 border-t border-[#E5E7EB]">
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full text-center py-3 px-4 bg-[#17324D] hover:bg-[#2463A6] text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-4 h-4 text-emerald-400" />
                  <span>Chat with Admissions on WhatsApp</span>
                </a>
              </div>
            </div>

            {/* Visit Advisory Note */}
            <div className="border border-[#E5E7EB] p-5 text-xs text-[#60656D] space-y-2">
              <span className="font-bold text-[#17324D] block uppercase tracking-wider text-[11px]">
                Visiting Campus in Person?
              </span>
              <p className="leading-relaxed">
                Walk-in prospective students are welcome during regular office hours. To sit in on a live laboratory session, please submit an enquiry at least 24 hours prior to confirm lab seating availability.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
