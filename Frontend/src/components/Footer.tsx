"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mail, Phone, MapPin, MessageSquare, ArrowUpRight, ShieldCheck, CheckCircle } from "lucide-react";
import { usePublicSettings } from "@/lib/PublicSettingsContext";

export function Footer() {
  const pathname = usePathname();
  const settings = usePublicSettings();

  // Hide on admin dashboard pages
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const rawWhatsApp = settings?.whatsappNumber || "919876543210";
  const cleanWhatsApp = rawWhatsApp.replace(/\D/g, "");
  const whatsappUrl = `https://wa.me/${cleanWhatsApp}?text=${encodeURIComponent(
    "Hello VLEARNN Admissions! I would like to enquire about the upcoming technical training programs."
  )}`;

  return (
    <footer className="bg-[#F8FAFC] text-[#334155] font-sans border-t border-[#E2E8F0]">
      {/* Pre-Footer Institutional Commitment Strip */}
      <div className="border-b border-[#E2E8F0] bg-[#F1F6FB] py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-[#475569]">
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-lg bg-white border border-[#D0E0EF] shadow-2xs flex items-center justify-center text-[#1E5289] flex-shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="font-semibold text-[#0B192C] block">Production-Grade Training</span>
              <span className="text-[#475569]">Real GitHub repositories, code reviews, and CI/CD workflows.</span>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-lg bg-white border border-[#D0E0EF] shadow-2xs flex items-center justify-center text-[#1E5289] flex-shrink-0">
              <CheckCircle className="w-4 h-4" />
            </div>
            <div>
              <span className="font-semibold text-[#0B192C] block">Day-One Ready Curriculum</span>
              <span className="text-[#475569]">Updated continuously against active tech industry hiring standards.</span>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-lg bg-white border border-[#D0E0EF] shadow-2xs flex items-center justify-center text-[#1E5289] flex-shrink-0">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <span className="font-semibold text-[#0B192C] block">Direct Mentor Access</span>
              <span className="text-[#475569]">Small batches with 1-on-1 architectural and code guidance.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Corporate Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-8 pb-10 sm:pb-12 border-b border-[#E2E8F0]">
          {/* Brand & Overview */}
          <div className="sm:col-span-2 lg:col-span-4 space-y-4">
            <Link href="/" className="inline-flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#10264A] flex items-center justify-center text-white font-extrabold text-lg shadow-2xs">
                <span>V</span>
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold tracking-tight text-[#0B192C] leading-none">
                  VLEARNN
                </span>
                <span className="text-[9px] font-semibold uppercase tracking-widest text-[#64748B] mt-1 leading-none">
                  Institute of Technology
                </span>
              </div>
            </Link>

            <p className="text-xs text-[#475569] leading-relaxed max-w-sm">
              VLEARNN is a professional technology education institute dedicated to preparing engineers, graduates, and working professionals with deep, hands-on software development competencies.
            </p>

            <div className="pt-2">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-semibold px-3.5 py-2 rounded-lg bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0] hover:bg-[#D1FAE5] transition-colors shadow-2xs"
              >
                <MessageSquare className="w-3.5 h-3.5 text-[#059669]" />
                <span>WhatsApp Admissions Office</span>
              </a>
            </div>
          </div>

          {/* Academic Curricula */}
          <div className="sm:col-span-1 lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#0B192C]">
              Academic Programs
            </h4>
            <ul className="space-y-2 text-xs text-[#475569]">
              <li>
                <Link href="/courses" className="hover:text-[#10264A] hover:underline underline-offset-2 transition-colors">
                  Full Stack Software Engineering
                </Link>
              </li>
              <li>
                <Link href="/courses" className="hover:text-[#10264A] hover:underline underline-offset-2 transition-colors">
                  Cloud Infrastructure & DevOps
                </Link>
              </li>
              <li>
                <Link href="/courses" className="hover:text-[#10264A] hover:underline underline-offset-2 transition-colors">
                  Applied Artificial Intelligence
                </Link>
              </li>
              <li>
                <Link href="/courses" className="hover:text-[#10264A] hover:underline underline-offset-2 transition-colors">
                  Data Systems & Modern Analytics
                </Link>
              </li>
              <li>
                <Link href="/courses" className="hover:text-[#10264A] hover:underline underline-offset-2 transition-colors">
                  Python Backend & Distributed Systems
                </Link>
              </li>
            </ul>
          </div>

          {/* Institutional Directory */}
          <div className="sm:col-span-1 lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#0B192C]">
              Institute Directory
            </h4>
            <ul className="space-y-2 text-xs text-[#475569]">
              <li>
                <Link href="/about" className="hover:text-[#10264A] hover:underline underline-offset-2 transition-colors">
                  About VLEARNN
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-[#10264A] hover:underline underline-offset-2 transition-colors">
                  Educational Philosophy
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-[#10264A] hover:underline underline-offset-2 transition-colors">
                  Faculty & Mentors
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#10264A] hover:underline underline-offset-2 transition-colors">
                  Admissions Process
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#10264A] hover:underline underline-offset-2 transition-colors">
                  Contact Admissions
                </Link>
              </li>
            </ul>
          </div>

          {/* Campus Location & Hours */}
          <div className="sm:col-span-2 lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#0B192C]">
              Campus & Admissions
            </h4>
            <div className="space-y-2.5 text-xs text-[#475569]">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#1E5289] flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  {settings?.address || "Tech Corridor Campus, Innovation Square, Outer Ring Road, Bangalore 560103, India"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#1E5289] flex-shrink-0" />
                <a
                  href={`mailto:${settings?.email || "admissions@vlearnn.com"}`}
                  className="hover:text-[#10264A] transition-colors truncate"
                >
                  {settings?.email || "admissions@vlearnn.com"}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#1E5289] flex-shrink-0" />
                <a
                  href={`tel:${settings?.phone || "+91 98765 43210"}`}
                  className="hover:text-[#1E5289] transition-colors font-semibold text-[#0B192C]"
                >
                  {settings?.phone || "+91 98765 43210"}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Legal & Administration Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#64748B] gap-4">
          <p>© {new Date().getFullYear()} VLEARNN Institute of Technology. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-[#0B192C] transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-[#0B192C] transition-colors">
              Terms of Service
            </Link>
            <Link
              href="/admin/login"
              className="hover:text-[#10264A] transition-colors inline-flex items-center gap-1 font-semibold text-[#475569]"
            >
              <span>Faculty Portal</span>
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
