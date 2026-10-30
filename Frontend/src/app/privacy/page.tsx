import React from "react";
import Link from "next/link";

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
      <div className="space-y-2 border-b border-navy-100 pb-6">
        <span className="text-xs font-bold uppercase tracking-wider text-amber-600 block">
          Legal & Compliance
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold text-navy-950">Privacy Policy</h1>
        <p className="text-xs text-mutedblue-500">Last updated: October 2026</p>
      </div>

      <div className="space-y-6 text-sm text-navy-900 leading-relaxed bg-white p-8 rounded border border-navy-100 shadow-sm">
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-navy-950">1. Information Collection</h2>
          <p className="text-mutedblue-700">
            VLEARNN collects information you provide directly to us when submitting an admissions enquiry, registering for course syllabi, or communicating with our admissions advisors. This includes full name, email address, telephone number, and learning preferences.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-navy-950">2. Purpose of Processing</h2>
          <p className="text-mutedblue-700">
            We use your personal data exclusively to respond to your technical training enquiries, coordinate admissions scheduling, provide curriculum updates, and issue verified completion credentials.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-navy-950">3. Data Confidentiality & Sharing</h2>
          <p className="text-mutedblue-700">
            We do not sell, rent, or lease prospective student data to third parties or marketing brokers. Data is accessible solely to authorized academic counselors and instructors.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-navy-950">4. Contact & Rights</h2>
          <p className="text-mutedblue-700">
            You may request deletion or correction of your admissions enquiry records at any time by contacting{" "}
            <a href="mailto:admissions@vlearnn.com" className="text-amber-700 underline font-semibold">
              admissions@vlearnn.com
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}

