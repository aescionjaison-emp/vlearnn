"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  UserCheck,
  Clock,
  BookOpen,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  ExternalLink,
  PlusCircle,
  RefreshCw,
  Phone,
  Mail,
} from "lucide-react";
import { fetchDashboardData } from "@/lib/api";
import { DashboardData } from "@/types";

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchDashboardData();
      setData(result);
    } catch (err: any) {
      console.error("Dashboard data load error:", err);
      setError(err?.message || "Failed to load dashboard metrics");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const timer = setInterval(loadData, 30000);
    return () => clearInterval(timer);
  }, []);

  const getStatusBadge = (status: string) => {
    const styles: Record<string, { bg: string; text: string; border: string }> = {
      NEW: { bg: "bg-blue-50", text: "text-[#2463A6]", border: "border-blue-200" },
      CONTACTED: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
      FOLLOW_UP: { bg: "bg-amber-50", text: "text-amber-800", border: "border-amber-200" },
      INTERESTED: { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200" },
      ENROLLED: { bg: "bg-emerald-50", text: "text-emerald-800", border: "border-emerald-200" },
      CLOSED: { bg: "bg-gray-100", text: "text-gray-700", border: "border-gray-300" },
    };
    const s = styles[status] || { bg: "bg-gray-100", text: "text-gray-700", border: "border-gray-200" };
    return (
      <span
        className={`text-[10px] font-bold px-2.5 py-0.5 border uppercase tracking-wider ${s.bg} ${s.text} ${s.border}`}
      >
        {status}
      </span>
    );
  };

  if (isLoading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-2">
          <RefreshCw className="w-6 h-6 animate-spin text-[#17324D] mx-auto" />
          <p className="text-xs text-[#60656D]">Loading administrative metrics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E7EB] pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#17324D]">
            Admissions & Academic Operations
          </h1>
          <p className="text-xs sm:text-sm text-[#60656D] mt-1">
            Real-time candidate inquiry pipeline, batch registrations, and published course status.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={loadData}
            disabled={isLoading}
            className="px-3.5 py-2 bg-white border border-[#E5E7EB] hover:bg-[#F7F8FA] text-[#17324D] text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
          <Link
            href="/admin/courses"
            className="bg-[#2463A6] hover:bg-[#1B4B80] text-white px-4 py-2 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Manage Courses</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">Synchronization Warning:</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Enterprise Metrics Strip (Zoho Style Clean Border Grid) */}
      <div className="grid grid-cols-2 lg:grid-cols-5 border border-[#E5E7EB] bg-white divide-x divide-y lg:divide-y-0 divide-[#E5E7EB]">
        <div className="p-5 space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#60656D] block">
            Total Inquiries
          </span>
          <div className="text-3xl font-bold text-[#17324D]">
            {data?.metrics.totalEnquiries ?? 0}
          </div>
          <p className="text-[11px] text-[#60656D]">All recorded candidate leads</p>
        </div>

        <div className="p-5 space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#2463A6] block">
            New Leads
          </span>
          <div className="text-3xl font-bold text-[#2463A6]">
            {data?.metrics.newEnquiries ?? 0}
          </div>
          <p className="text-[11px] text-[#60656D]">Awaiting counselor contact</p>
        </div>

        <div className="p-5 space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#60656D] block">
            Follow-Ups Due
          </span>
          <div className="text-3xl font-bold text-[#17324D]">
            {data?.metrics.followUpsDue ?? 0}
          </div>
          <p className="text-[11px] text-[#60656D]">Scheduled candidate contacts</p>
        </div>

        <div className="p-5 space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#60656D] block">
            Enrolled Students
          </span>
          <div className="text-3xl font-bold text-[#17324D]">
            {data?.metrics.enrolledStudents ?? 0}
          </div>
          <p className="text-[11px] text-[#60656D]">Confirmed batch registrations</p>
        </div>

        <div className="p-5 space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#60656D] block">
            Published Courses
          </span>
          <div className="text-3xl font-bold text-[#17324D]">
            {data?.metrics.publishedCourses ?? 0}
          </div>
          <p className="text-[11px] text-[#60656D]">Active public training programs</p>
        </div>
      </div>

      {/* Recent Admissions Pipeline Table */}
      <div className="bg-white border border-[#E5E7EB] space-y-4">
        <div className="p-5 border-b border-[#E5E7EB] flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#17324D]">
              Recent Prospective Inquiries
            </h2>
            <p className="text-xs text-[#60656D]">
              Direct submissions from public course pages and admissions contact form.
            </p>
          </div>
          <Link
            href="/admin/enquiries"
            className="text-xs font-semibold text-[#2463A6] hover:underline inline-flex items-center gap-1"
          >
            <span>View Full CRM Table</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Clean Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#F7F8FA] border-b border-[#E5E7EB] text-[#60656D]">
                <th className="py-3 px-5 font-bold uppercase tracking-wider text-[11px]">Inquiry Ref</th>
                <th className="py-3 px-5 font-bold uppercase tracking-wider text-[11px]">Candidate</th>
                <th className="py-3 px-5 font-bold uppercase tracking-wider text-[11px]">Contact</th>
                <th className="py-3 px-5 font-bold uppercase tracking-wider text-[11px]">Program Requested</th>
                <th className="py-3 px-5 font-bold uppercase tracking-wider text-[11px]">Status</th>
                <th className="py-3 px-5 font-bold uppercase tracking-wider text-[11px]">Submitted</th>
                <th className="py-3 px-5 font-bold uppercase tracking-wider text-[11px] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {!data?.recentEnquiries || data.recentEnquiries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[#60656D]">
                    No inquiries recorded in this period.
                  </td>
                </tr>
              ) : (
                data.recentEnquiries.map((enq) => (
                  <tr key={enq.id} className="hover:bg-[#F7F8FA]/60 transition-colors">
                    <td className="py-3.5 px-5 font-mono text-xs font-bold text-[#17324D]">
                      {enq.enquiryNumber || `#${enq.id.slice(0, 6)}`}
                    </td>
                    <td className="py-3.5 px-5 font-semibold text-[#1C1C1C]">
                      {enq.fullName}
                    </td>
                    <td className="py-3.5 px-5 text-[#60656D]">
                      <div className="space-y-0.5">
                        <div className="text-[#1C1C1C]">{enq.email}</div>
                        <div>{enq.countryCode} {enq.phone}</div>
                      </div>
                    </td>
                    <td className="py-3.5 px-5 text-[#17324D] font-medium">
                      {enq.course?.title || "General IT Inquiry"}
                    </td>
                    <td className="py-3.5 px-5">
                      {getStatusBadge(enq.status)}
                    </td>
                    <td className="py-3.5 px-5 text-[#60656D]">
                      {new Date(enq.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <Link
                        href={`/admin/enquiries?id=${enq.id}`}
                        className="text-[#2463A6] hover:underline font-semibold"
                      >
                        Details
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
