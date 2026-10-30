import React from "react";

export default function TermsOfServicePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
      <div className="space-y-2 border-b border-navy-100 pb-6">
        <span className="text-xs font-bold uppercase tracking-wider text-amber-600 block">
          Terms & Academic Governance
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold text-navy-950">Terms of Service</h1>
        <p className="text-xs text-mutedblue-500">Last updated: October 2026</p>
      </div>

      <div className="space-y-6 text-sm text-navy-900 leading-relaxed bg-white p-8 rounded border border-navy-100 shadow-sm">
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-navy-950">1. Acceptance of Terms</h2>
          <p className="text-mutedblue-700">
            By accessing or utilizing the VLEARNN website, admissions portal, and associated course materials, you agree to comply with and be bound by these Terms of Service.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-navy-950">2. Academic Integrity & Course Materials</h2>
          <p className="text-mutedblue-700">
            All course syllabus structures, lecture materials, sandbox configurations, and project assignments are proprietary intellectual property of VLEARNN. Enrolled students are granted personal, non-commercial licenses to utilize materials during their enrolled cohorts.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-navy-950">3. Admissions & Cohort Placement</h2>
          <p className="text-mutedblue-700">
            Submission of an enquiry does not constitute guaranteed cohort admission. Admissions decisions are determined based on prerequisite readiness, batch capacity limits, and technical alignment.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-navy-950">4. Institutional Inquiries</h2>
          <p className="text-mutedblue-700">
            For academic queries regarding our institutional standards, contact us at admissions@vlearnn.com.
          </p>
        </section>
      </div>
    </div>
  );
}

