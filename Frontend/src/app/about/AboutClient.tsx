"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { SiteSettings, FacultyProfile } from "@/types";
import { fetchSiteSettings } from "@/lib/api";
import { usePublicRealtime } from "@/lib/usePublicRealtime";

interface AboutClientProps {
  initialSettings: SiteSettings | null;
  faculty: FacultyProfile[];
}

export function AboutClient({ initialSettings, faculty }: AboutClientProps) {
  const [settings, setSettings] = useState<SiteSettings | null>(initialSettings);

  usePublicRealtime(
    async (event) => {
      if (event === "site_content_updated" || event === "public_settings_updated") {
        try {
          const freshSettings = await fetchSiteSettings();
          if (freshSettings) setSettings(freshSettings);
        } catch (err) {
          console.warn("Failed to refresh about settings in real time:", err);
        }
      }
    },
    ["site_content_updated", "public_settings_updated"]
  );

  return (
    <div className="space-y-16 sm:space-y-24 pb-24 font-sans bg-white">
      {/* Institutional Editorial Header */}
      <section className="bg-[#F7F8FA] border-b border-[#E5E7EB] pt-14 pb-16 sm:pt-20 sm:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-[#2463A6]">
            <span>Institutional Overview</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#17324D] max-w-4xl leading-tight">
            Engineering Education Built on Production Realities
          </h1>
          <p className="text-base sm:text-lg text-[#60656D] leading-relaxed max-w-3xl font-normal">
            {settings?.tagLine || "Practical IT & Technical Training Institute"} — founded to replace passive classroom lectures with production-grade engineering practice and direct mentorship.
          </p>
        </div>
      </section>

      {/* Narrative Section: Origin & Problem Solved */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#2463A6] block">
                The VLEARNN Foundation
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#17324D] tracking-tight leading-snug">
                Why we established a new standard in technical training.
              </h2>
            </div>

            <div className="space-y-4 text-sm sm:text-base text-[#60656D] leading-relaxed">
              <p>
                {settings?.aboutStory ||
                  "VLEARNN was established by software architects and educational researchers who observed a persistent disconnect in engineering hiring: graduates possess diplomas and syntax familiarity, but struggle when confronted with production codebases, distributed systems, and real deployment failures."}
              </p>
              <p>
                Generic training centers rely on simplified slideshows and obsolete multiple-choice quizzes. At VLEARNN, we reversed the curriculum model: students write code from their first hour, run automated test suites, use Git branching strategies, and troubleshoot live infrastructure.
              </p>
              <p>
                Our objective is not short-term exam coaching. Our objective is engineering competence that withstands rigorous corporate technical evaluation.
              </p>
            </div>

            {/* Core Values Strip */}
            <div className="pt-4 border-t border-[#E5E7EB] grid grid-cols-2 gap-4 text-xs">
              <div>
                <strong className="block text-[#17324D] font-bold">100% Practical Labs</strong>
                <span className="text-[#60656D]">Hands-on development in every single session</span>
              </div>
              <div>
                <strong className="block text-[#17324D] font-bold">Industry Mentors</strong>
                <span className="text-[#60656D]">Guided by practicing senior developers</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="border border-[#E5E7EB] overflow-hidden">
              <Image
                src="/images/hero-students-campus.jpg"
                alt="Students working inside VLEARNN computer lab"
                width={800}
                height={550}
                className="w-full h-auto object-cover grayscale contrast-125 hover:grayscale-0 transition-all duration-500"
              />
              <div className="p-4 bg-[#F7F8FA] border-t border-[#E5E7EB] text-xs text-[#60656D]">
                <strong className="text-[#17324D]">Bangalore Campus Lab:</strong> High-performance dual-screen workstation environments dedicated to full-time engineering cohorts.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Institutional Governance (Clean Dividers, No Generic Cards) */}
      <section className="bg-[#F7F8FA] border-y border-[#E5E7EB] py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
            <div className="space-y-4">
              <span className="text-xs font-mono font-bold text-[#2463A6] uppercase tracking-wider block">
                [ 01 // MANDATE ]
              </span>
              <h3 className="text-2xl font-bold text-[#17324D]">Our Institutional Mission</h3>
              <p className="text-sm sm:text-base text-[#60656D] leading-relaxed">
                {settings?.mission ||
                  "To deliver rigorous, accessible, and employment-aligned technical training that equips aspiring developers and career transitioners with genuine problem-solving capabilities."}
              </p>
            </div>

            <div className="space-y-4">
              <span className="text-xs font-mono font-bold text-[#2463A6] uppercase tracking-wider block">
                [ 02 // OUTLOOK ]
              </span>
              <h3 className="text-2xl font-bold text-[#17324D]">Our Long-Term Vision</h3>
              <p className="text-sm sm:text-base text-[#60656D] leading-relaxed">
                {settings?.vision ||
                  "To be India's benchmark technical institute recognized by software enterprises for graduating disciplined developers who create immediate value from their very first day."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pedagogical Methodology */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="space-y-2 border-b border-[#E5E7EB] pb-6">
          <span className="text-xs font-bold uppercase tracking-wider text-[#2463A6] block">
            Pedagogy & Standards
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#17324D] tracking-tight">
            Four Pillars of VLEARNN Instruction
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-3">
            <span className="font-mono text-sm font-bold text-[#2463A6] block">01.</span>
            <h4 className="text-base font-bold text-[#17324D]">Architecture Before Code</h4>
            <p className="text-xs text-[#60656D] leading-relaxed">
              We teach students how systems interact—HTTP lifecycles, database transactions, concurrency, and caching—before introducing framework shortcuts.
            </p>
          </div>

          <div className="space-y-3">
            <span className="font-mono text-sm font-bold text-[#2463A6] block">02.</span>
            <h4 className="text-base font-bold text-[#17324D]">Production Environments</h4>
            <p className="text-xs text-[#60656D] leading-relaxed">
              Students deploy code to Linux servers, configure reverse proxies, manage secrets safely, and set up Docker containers from week three.
            </p>
          </div>

          <div className="space-y-3">
            <span className="font-mono text-sm font-bold text-[#2463A6] block">03.</span>
            <h4 className="text-base font-bold text-[#17324D]">Rigorous Code Reviews</h4>
            <p className="text-xs text-[#60656D] leading-relaxed">
              Mentors provide line-by-line feedback on every submitted PR, focusing on cyclomatic complexity, naming conventions, and security best practices.
            </p>
          </div>

          <div className="space-y-3">
            <span className="font-mono text-sm font-bold text-[#2463A6] block">04.</span>
            <h4 className="text-base font-bold text-[#17324D]">Verified Portfolio</h4>
            <p className="text-xs text-[#60656D] leading-relaxed">
              Graduation requires presenting an end-to-end full stack platform to an external panel of software architects for technical defense.
            </p>
          </div>
        </div>
      </section>

      {/* Faculty & Mentors Section */}
      {faculty && faculty.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 border-t border-[#E5E7EB] pt-16">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#2463A6] block">
              Teaching Faculty
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#17324D] tracking-tight">
              Instructors with Verifiable Engineering Experience
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {faculty.map((f) => (
              <div key={f.id} className="border border-[#E5E7EB] p-6 space-y-4 bg-white">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-[#17324D] text-white flex items-center justify-center font-bold text-lg flex-shrink-0">
                    {f.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-[#17324D] text-base">{f.name}</h3>
                    <p className="text-xs text-[#2463A6] font-semibold">{f.title}</p>
                    {f.yearsExperience && (
                      <span className="text-[11px] text-[#60656D] block">
                        {f.yearsExperience}+ Years Engineering
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-xs text-[#60656D] leading-relaxed">{f.bio}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Call to Action Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#17324D] text-white p-8 sm:p-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="space-y-2 max-w-xl">
            <h3 className="text-2xl font-bold text-white tracking-tight">
              Ready to begin your engineering transition?
            </h3>
            <p className="text-xs sm:text-sm text-[#EBF3FA]/80 leading-relaxed">
              Schedule an advisory session with our academic team or visit our Bangalore campus to observe a live practical lab session.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
            <Link
              href="/contact"
              className="w-full sm:w-auto text-center px-6 py-3 bg-[#2463A6] hover:bg-[#1B4B80] text-white font-semibold text-xs transition-colors"
            >
              Contact Admissions
            </Link>
            <Link
              href="/courses"
              className="w-full sm:w-auto text-center px-6 py-3 border border-white/40 hover:bg-white/10 text-white font-semibold text-xs transition-colors"
            >
              View Active Courses
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
