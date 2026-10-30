"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  Users,
  Clock,
  ArrowRight,
  RefreshCw,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  MessageSquare,
} from "lucide-react";
import {
  fetchAdminEnquiries,
  updateEnquiryStatus,
  fetchAdminCourses,
} from "@/lib/api";
import { Enquiry, Course, EnquiryStatus } from "@/types";

export default function AdminEnquiriesPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [courseId, setCourseId] = useState("ALL");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 15,
    totalPages: 1,
  });

  const loadEnquiries = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetchAdminEnquiries({
        search: search.trim() || undefined,
        status: status !== "ALL" ? status : undefined,
        courseId: courseId !== "ALL" ? courseId : undefined,
        page,
        limit: 15,
      });
      setEnquiries(res.data);
      setPagination(res.pagination);
    } catch (err: any) {
      console.error("Error loading enquiries:", err);
      setError(err?.message || "Failed to load enquiries");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminCourses()
      .then((c) => setCourses(c))
      .catch((e) => console.error("Courses list load error:", e));
  }, []);

  useEffect(() => {
    loadEnquiries();
  }, [status, courseId, page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadEnquiries();
  };

  const handleQuickStatusChange = async (enquiryId: string, newStatus: string) => {
    try {
      await updateEnquiryStatus(enquiryId, newStatus);
      setEnquiries((prev) =>
        prev.map((item) =>
          item.id === enquiryId ? { ...item, status: newStatus as EnquiryStatus } : item
        )
      );
    } catch (err: any) {
      alert(`Error updating status: ${err?.message}`);
    }
  };

  const getStatusBadge = (s: string) => {
    const styles: Record<string, { bg: string; text: string; border: string }> = {
      NEW: { bg: "bg-blue-50", text: "text-[#2463A6]", border: "border-blue-200" },
      CONTACTED: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
      FOLLOW_UP: { bg: "bg-amber-50", text: "text-amber-800", border: "border-amber-200" },
      INTERESTED: { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200" },
      ENROLLED: { bg: "bg-emerald-50", text: "text-emerald-800", border: "border-emerald-200" },
      CLOSED: { bg: "bg-gray-100", text: "text-gray-700", border: "border-gray-300" },
    };
    const st = styles[s] || { bg: "bg-gray-100", text: "text-gray-700", border: "border-gray-200" };
    return (
      <span
        className={`text-[10px] font-bold px-2 py-0.5 border uppercase tracking-wider ${st.bg} ${st.text} ${st.border}`}
      >
        {s}
      </span>
    );
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E7EB] pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#17324D]">
            Admissions Pipeline & CRM
          </h1>
          <p className="text-xs text-[#60656D] mt-1">
            Centralized directory of prospective student applications and lead qualification workflows.
          </p>
        </div>

        <button
          type="button"
          onClick={loadEnquiries}
          className="px-3.5 py-2 bg-white border border-[#E5E7EB] hover:bg-[#F7F8FA] text-[#17324D] text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          <span>Refresh Pipeline</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Enterprise Filter Toolbar */}
      <div className="bg-white border border-[#E5E7EB] p-4 sm:p-5 space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#60656D] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search candidate name, email, phone number, or reference (VLRN-2026-XXXXX)..."
              className="w-full pl-10 pr-4 py-2 bg-[#F7F8FA] border border-[#E5E7EB] text-xs text-[#1C1C1C] placeholder:text-[#60656D] focus:outline-none focus:border-[#2463A6] transition-colors"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2 bg-[#17324D] hover:bg-[#2463A6] text-white font-semibold text-xs transition-colors"
          >
            Apply Search
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-[#E5E7EB] text-xs">
          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#17324D]">Pipeline Status:</span>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="px-3 py-1.5 bg-[#F7F8FA] border border-[#E5E7EB] text-xs font-medium text-[#1C1C1C] focus:outline-none focus:border-[#2463A6]"
            >
              <option value="ALL">All Statuses</option>
              <option value="NEW">NEW</option>
              <option value="CONTACTED">CONTACTED</option>
              <option value="FOLLOW_UP">FOLLOW_UP</option>
              <option value="INTERESTED">INTERESTED</option>
              <option value="ENROLLED">ENROLLED</option>
              <option value="CLOSED">CLOSED</option>
            </select>
          </div>

          {/* Course Filter */}
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#17324D]">Program:</span>
            <select
              value={courseId}
              onChange={(e) => {
                setCourseId(e.target.value);
                setPage(1);
              }}
              className="px-3 py-1.5 bg-[#F7F8FA] border border-[#E5E7EB] text-xs font-medium text-[#1C1C1C] max-w-xs focus:outline-none focus:border-[#2463A6]"
            >
              <option value="ALL">All Programs</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          <div className="ml-auto text-[#60656D] font-medium text-xs">
            Showing {enquiries.length} of {pagination.total} records
          </div>
        </div>
      </div>

      {/* Enterprise CRM Table */}
      <div className="bg-white border border-[#E5E7EB] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-[#F7F8FA] text-[#60656D]">
                <th className="py-3 px-5 font-bold uppercase tracking-wider text-[11px]">Enquiry Ref & Candidate</th>
                <th className="py-3 px-5 font-bold uppercase tracking-wider text-[11px]">Contact Details</th>
                <th className="py-3 px-5 font-bold uppercase tracking-wider text-[11px]">Course Applied</th>
                <th className="py-3 px-5 font-bold uppercase tracking-wider text-[11px]">Pipeline Status</th>
                <th className="py-3 px-5 font-bold uppercase tracking-wider text-[11px]">Submission Date</th>
                <th className="py-3 px-5 font-bold uppercase tracking-wider text-[11px] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {enquiries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#60656D]">
                    No inquiries found matching current filters.
                  </td>
                </tr>
              ) : (
                enquiries.map((enq) => (
                  <tr key={enq.id} className="hover:bg-[#F7F8FA]/60 transition-colors">
                    <td className="py-3.5 px-5">
                      <span className="font-mono text-[11px] text-[#2463A6] font-bold block">
                        {enq.enquiryNumber}
                      </span>
                      <span className="font-bold text-[#17324D] block text-sm">
                        {enq.fullName}
                      </span>
                    </td>

                    <td className="py-3.5 px-5">
                      <div className="font-medium text-[#1C1C1C]">{enq.email}</div>
                      <div className="text-[11px] text-[#60656D]">
                        {enq.countryCode} {enq.phone}
                      </div>
                    </td>

                    <td className="py-3.5 px-5">
                      <span className="font-semibold text-[#17324D] block max-w-xs truncate">
                        {enq.course?.title || "General IT Training Enquiry"}
                      </span>
                      <span className="text-[11px] text-[#60656D] block">
                        Mode: {enq.learningMode || "Flexible"}
                      </span>
                    </td>

                    <td className="py-3.5 px-5 space-y-1.5">
                      <div>{getStatusBadge(enq.status)}</div>
                      <select
                        value={enq.status}
                        onChange={(e) => handleQuickStatusChange(enq.id, e.target.value)}
                        className="text-[10px] bg-[#F7F8FA] border border-[#E5E7EB] px-2 py-0.5 font-semibold text-[#17324D] focus:outline-none focus:border-[#2463A6]"
                      >
                        <option value="NEW">Set NEW</option>
                        <option value="CONTACTED">Set CONTACTED</option>
                        <option value="FOLLOW_UP">Set FOLLOW_UP</option>
                        <option value="INTERESTED">Set INTERESTED</option>
                        <option value="ENROLLED">Set ENROLLED</option>
                        <option value="CLOSED">Set CLOSED</option>
                      </select>
                    </td>

                    <td className="py-3.5 px-5 text-[#60656D]">
                      <div>{new Date(enq.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric"
                      })}</div>
                      <div className="text-[10px] text-[#60656D]">
                        {new Date(enq.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </td>

                    <td className="py-3.5 px-5 text-right">
                      <Link
                        href={`/admin/enquiries/${enq.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#17324D] hover:bg-[#2463A6] text-white font-semibold text-xs transition-colors"
                      >
                        <span>Manage Lead</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {pagination.totalPages > 1 && (
          <div className="p-4 border-t border-[#E5E7EB] flex items-center justify-between text-xs text-[#60656D] bg-[#F7F8FA]">
            <span>
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={pagination.page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3.5 py-1.5 bg-white border border-[#E5E7EB] disabled:opacity-40 font-semibold text-[#17324D] hover:bg-[#F7F8FA]"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3.5 py-1.5 bg-white border border-[#E5E7EB] disabled:opacity-40 font-semibold text-[#17324D] hover:bg-[#F7F8FA]"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
