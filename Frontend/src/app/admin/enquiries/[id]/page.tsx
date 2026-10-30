"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Mail,
  Phone,
  MessageSquare,
  Calendar,
  Save,
  Send,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  User,
  ShieldAlert,
  ExternalLink,
} from "lucide-react";
import {
  fetchEnquiryById,
  updateEnquiryStatus,
  updateEnquiryNotes,
  replyEnquiryEmail,
} from "@/lib/api";
import { Enquiry, EnquiryStatus } from "@/types";

interface PageProps {
  params: {
    id: string;
  };
}

export default function EnquiryDetailPage({ params }: PageProps) {
  const router = useRouter();
  const [enquiry, setEnquiry] = useState<Enquiry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Editable fields
  const [currentStatus, setCurrentStatus] = useState<EnquiryStatus>("NEW");
  const [notes, setNotes] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [notesFeedback, setNotesFeedback] = useState<string | null>(null);

  // Email Reply Form
  const [replySubject, setReplySubject] = useState("");
  const [replyBody, setReplyBody] = useState("");
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [emailFeedback, setEmailFeedback] = useState<{ success: boolean; message: string } | null>(
    null
  );

  // WhatsApp Modal
  const [whatsAppModalOpen, setWhatsAppModalOpen] = useState(false);
  const [whatsAppMessage, setWhatsAppMessage] = useState("");

  const loadEnquiry = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchEnquiryById(params.id);
      setEnquiry(data);
      setCurrentStatus(data.status);
      setNotes(data.notes || "");
      if (data.followUpDate) {
        setFollowUpDate(new Date(data.followUpDate).toISOString().slice(0, 10));
      }
      // Prefill default email subject
      setReplySubject(`Re: Admissions Enquiry [${data.enquiryNumber}] - VLEARNN Institute`);
      // Prefill WhatsApp text
      const coursePart = data.course?.title ? ` for our ${data.course.title} program` : "";
      setWhatsAppMessage(
        `Hello ${data.fullName}! This is the Admissions Desk at VLEARNN Institute. We received your enquiry${coursePart} (${data.enquiryNumber}). Would you be available for a brief 10-minute call today to discuss batch timings and curriculum details?`
      );
    } catch (err: any) {
      console.error("Error loading enquiry:", err);
      setError(err?.message || "Failed to load enquiry record");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEnquiry();
  }, [params.id]);

  const handleStatusChange = async (newStatus: EnquiryStatus) => {
    try {
      await updateEnquiryStatus(params.id, newStatus);
      setCurrentStatus(newStatus);
      setEnquiry((prev) => (prev ? { ...prev, status: newStatus } : null));
    } catch (err: any) {
      alert(`Failed to update status: ${err?.message}`);
    }
  };

  const handleSaveNotes = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingNotes(true);
    setNotesFeedback(null);
    try {
      await updateEnquiryNotes(params.id, {
        notes: notes.trim(),
        followUpDate: followUpDate ? new Date(followUpDate).toISOString() : null,
      });
      setNotesFeedback("Internal notes saved successfully.");
      setTimeout(() => setNotesFeedback(null), 3500);
    } catch (err: any) {
      setNotesFeedback(`Error: ${err?.message}`);
    } finally {
      setIsSavingNotes(false);
    }
  };

  const handleSendEmailReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replySubject.trim() || !replyBody.trim()) {
      alert("Please enter subject and message body.");
      return;
    }
    setIsSendingReply(true);
    setEmailFeedback(null);
    try {
      const res = await replyEnquiryEmail(params.id, {
        subject: replySubject.trim(),
        body: replyBody.trim(),
      });
      setEmailFeedback({
        success: res.success,
        message: res.message || "Email response logged successfully.",
      });
      setReplyBody("");
      // Reload enquiry to see new message in history
      loadEnquiry();
    } catch (err: any) {
      setEmailFeedback({
        success: false,
        message: err?.message || "Failed to dispatch email reply.",
      });
    } finally {
      setIsSendingReply(false);
    }
  };

  const handleOpenWhatsApp = () => {
    if (!enquiry) return;
    // Clean and validate phone number (digits only)
    const combinedPhone = `${enquiry.countryCode}${enquiry.phone}`.replace(/\D/g, "");
    const waUrl = `https://wa.me/${combinedPhone}?text=${encodeURIComponent(whatsAppMessage)}`;
    window.open(waUrl, "_blank");
    setWhatsAppModalOpen(false);
  };

  if (isLoading && !enquiry) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-2">
          <Clock className="w-6 h-6 animate-spin text-navy-800 mx-auto" />
          <p className="text-xs text-mutedblue-600">Loading student enquiry details...</p>
        </div>
      </div>
    );
  }

  if (error || !enquiry) {
    return (
      <div className="p-8 text-center space-y-4 bg-white rounded border border-navy-100">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
        <h2 className="text-lg font-bold text-navy-900">Enquiry Not Found</h2>
        <p className="text-xs text-mutedblue-600">{error || "Record does not exist."}</p>
        <Link
          href="/admin/enquiries"
          className="text-xs font-semibold text-amber-700 hover:underline"
        >
          ← Return to Enquiries CRM
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Back button and Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-navy-100 pb-4">
        <div className="space-y-1">
          <Link
            href="/admin/enquiries"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-mutedblue-600 hover:text-navy-900 transition-colors mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Enquiries</span>
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-navy-950">
              {enquiry.fullName}
            </h1>
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-paper-200 text-navy-800 border border-navy-200">
              {enquiry.enquiryNumber}
            </span>
          </div>
        </div>

        {/* Lead Status Transition Controls */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-mutedblue-600">Status:</span>
          <select
            value={currentStatus}
            onChange={(e) => handleStatusChange(e.target.value as EnquiryStatus)}
            className="px-3 py-2 rounded bg-white border border-navy-200 font-bold text-xs text-navy-900 shadow-sm focus:outline-none focus:border-amber-500"
          >
            <option value="NEW">NEW</option>
            <option value="CONTACTED">CONTACTED</option>
            <option value="FOLLOW_UP">FOLLOW_UP</option>
            <option value="INTERESTED">INTERESTED</option>
            <option value="ENROLLED">ENROLLED</option>
            <option value="CLOSED">CLOSED</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Col: Contact Card & Message */}
        <div className="lg:col-span-7 space-y-6">
          {/* Student Profile Card */}
          <div className="bg-white p-6 rounded border border-navy-100 shadow-sm space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-amber-600 border-b border-navy-50 pb-2">
              Applicant Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-navy-900">
              <div>
                <span className="text-mutedblue-500 block text-[11px]">Email Address</span>
                <span className="font-semibold text-sm">{enquiry.email}</span>
              </div>
              <div>
                <span className="text-mutedblue-500 block text-[11px]">Phone Number</span>
                <span className="font-semibold text-sm">
                  {enquiry.countryCode} {enquiry.phone}
                </span>
              </div>
              <div>
                <span className="text-mutedblue-500 block text-[11px]">Requested Course</span>
                <span className="font-semibold text-sm">
                  {enquiry.course?.title || "General IT Training Enquiry"}
                </span>
              </div>
              <div>
                <span className="text-mutedblue-500 block text-[11px]">Preferred Learning Mode</span>
                <span className="font-semibold">{enquiry.learningMode || "Flexible"}</span>
              </div>
              <div>
                <span className="text-mutedblue-500 block text-[11px]">Submission Date & Time</span>
                <span className="font-semibold">{new Date(enquiry.createdAt).toLocaleString()}</span>
              </div>
              <div>
                <span className="text-mutedblue-500 block text-[11px]">Communication Consent</span>
                <span className="font-semibold text-emerald-700">Given by Student</span>
              </div>
            </div>

            {/* Student's Original Message */}
            <div className="pt-3 border-t border-navy-50 space-y-1.5">
              <span className="text-[11px] font-bold text-mutedblue-500 uppercase tracking-wider block">
                Original Message / Questions
              </span>
              <div className="p-4 rounded bg-paper-100 border border-navy-100 text-xs text-navy-900 leading-relaxed italic whitespace-pre-wrap">
                "{enquiry.message}"
              </div>
            </div>

            {/* Direct Communication Buttons */}
            <div className="pt-3 border-t border-navy-50 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setWhatsAppModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs shadow-sm transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Reply on WhatsApp</span>
              </button>

              <a
                href={`mailto:${enquiry.email}?subject=VLEARNN%20Admissions%20Enquiry%20${enquiry.enquiryNumber}`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded bg-paper-200 hover:bg-paper-300 text-navy-900 font-semibold text-xs transition-colors"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Open in Mail App</span>
              </a>

              <a
                href={`tel:${enquiry.countryCode}${enquiry.phone}`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded bg-paper-200 hover:bg-paper-300 text-navy-900 font-semibold text-xs transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Phone</span>
              </a>
            </div>
          </div>

          {/* Email Reply Composer (Resend) */}
          <div className="bg-white p-6 rounded border border-navy-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-navy-50 pb-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-navy-900">
                Compose Email Reply (via Resend)
              </h2>
              <span className="text-[10px] text-mutedblue-500 font-medium">
                Sent to: {enquiry.email}
              </span>
            </div>

            {emailFeedback && (
              <div
                className={`p-3 rounded text-xs flex items-start gap-2 ${
                  emailFeedback.success
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    : "bg-amber-50 text-amber-800 border border-amber-200"
                }`}
              >
                {emailFeedback.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                )}
                <span>{emailFeedback.message}</span>
              </div>
            )}

            <form onSubmit={handleSendEmailReply} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-mutedblue-600 uppercase">Subject</label>
                <input
                  type="text"
                  required
                  value={replySubject}
                  onChange={(e) => setReplySubject(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-paper-100 border border-navy-200 text-xs text-navy-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-mutedblue-600 uppercase">
                  Message Body
                </label>
                <textarea
                  rows={5}
                  required
                  value={replyBody}
                  onChange={(e) => setReplyBody(e.target.value)}
                  placeholder={`Dear ${enquiry.fullName},\n\nThank you for reaching out regarding our courses...`}
                  className="w-full px-3 py-2 rounded bg-paper-100 border border-navy-200 text-xs text-navy-900 focus:outline-none focus:border-amber-500 resize-y"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <p className="text-[11px] text-mutedblue-500 max-w-sm">
                  Dispatched through configured Resend transactional mailer. Logged to student message history.
                </p>
                <button
                  type="submit"
                  disabled={isSendingReply}
                  className="px-4 py-2 rounded bg-navy-800 hover:bg-navy-900 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isSendingReply ? "Dispatching..." : "Send Email Reply"}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Communication & Activity Timeline */}
          <div className="bg-white p-6 rounded border border-navy-100 shadow-sm space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-navy-900 border-b border-navy-50 pb-2">
              Communication History & Activity Log
            </h2>

            {(!enquiry.messages || enquiry.messages.length === 0) &&
            (!enquiry.emailNotifications || enquiry.emailNotifications.length === 0) ? (
              <p className="text-xs text-mutedblue-500 italic py-2">
                No past email replies recorded yet.
              </p>
            ) : (
              <div className="space-y-3">
                {enquiry.messages?.map((msg) => (
                  <div
                    key={msg.id}
                    className="p-3.5 rounded bg-paper-100 border border-navy-100 space-y-2 text-xs"
                  >
                    <div className="flex justify-between items-center text-[11px] text-mutedblue-600">
                      <span className="font-bold text-navy-900">
                        Email to Student: {msg.recipientEmail}
                      </span>
                      <span>{new Date(msg.createdAt).toLocaleString()}</span>
                    </div>
                    <div className="font-semibold text-navy-950 text-xs">{msg.subject}</div>
                    <p className="text-mutedblue-800 whitespace-pre-wrap">{msg.body}</p>
                    <div className="text-[10px] text-mutedblue-500">
                      Status: <strong className="text-navy-900">{msg.status}</strong>
                      {msg.providerMessageId && ` (ID: ${msg.providerMessageId})`}
                    </div>
                  </div>
                ))}

                {enquiry.emailNotifications?.map((notif) => (
                  <div
                    key={notif.id}
                    className="p-2.5 rounded bg-navy-50 border border-navy-100 text-[11px] flex justify-between items-center text-navy-800"
                  >
                    <span>Admin Notification Attempt to {notif.recipient}</span>
                    <span className="font-semibold uppercase text-[10px]">{notif.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Private Admin Notes & Follow-up */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded border border-navy-100 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-navy-50 pb-2">
              <FileText className="w-4 h-4 text-amber-600" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-navy-900">
                Private Internal Notes (Staff Only)
              </h2>
            </div>

            <p className="text-[11px] text-mutedblue-600 leading-relaxed">
              These notes are strictly private and never exposed to the student or public website.
            </p>

            {notesFeedback && (
              <div className="p-2.5 rounded bg-paper-200 text-xs font-semibold text-navy-900">
                {notesFeedback}
              </div>
            )}

            <form onSubmit={handleSaveNotes} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-mutedblue-600 uppercase block">
                  Follow-Up Date
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-mutedblue-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="date"
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded bg-paper-100 border border-navy-200 text-xs text-navy-900 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-mutedblue-600 uppercase block">
                  Counselor Notes
                </label>
                <textarea
                  rows={6}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Record call outcomes, financial details, background assessments..."
                  className="w-full px-3 py-2.5 rounded bg-paper-100 border border-navy-200 text-xs text-navy-900 focus:outline-none focus:border-amber-500 resize-y"
                />
              </div>

              <button
                type="submit"
                disabled={isSavingNotes}
                className="w-full py-2.5 rounded bg-navy-800 hover:bg-navy-900 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5 text-amber-400" />
                <span>{isSavingNotes ? "Saving Notes..." : "Save Internal Notes"}</span>
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* WhatsApp Modal with Message Review */}
      {whatsAppModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm">
          <div className="bg-white rounded border border-navy-200 shadow-xl max-w-lg w-full p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-navy-100 pb-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-navy-950">Reply on WhatsApp</h3>
              </div>
              <button
                type="button"
                onClick={() => setWhatsAppModalOpen(false)}
                className="text-xs text-mutedblue-500 hover:text-navy-900 font-bold"
              >
                Cancel
              </button>
            </div>

            <div className="text-xs text-mutedblue-700 space-y-1">
              <p>
                Recipient: <strong>{enquiry.fullName}</strong> ({enquiry.countryCode} {enquiry.phone})
              </p>
              <p className="text-[11px] text-mutedblue-500">
                You can review or customize the prefilled message below before opening WhatsApp.
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-navy-900 uppercase block">
                Prefilled Message Text
              </label>
              <textarea
                rows={4}
                value={whatsAppMessage}
                onChange={(e) => setWhatsAppMessage(e.target.value)}
                className="w-full p-3 rounded bg-paper-100 border border-navy-200 text-xs text-navy-900 focus:outline-none focus:border-amber-500 resize-y"
              />
            </div>

            <div className="p-3 rounded bg-amber-50 border border-amber-200 text-[11px] text-amber-900 space-y-1">
              <span className="font-bold block">Important Notice:</span>
              <p>
                Clicking "Open WhatsApp Conversation" will open WhatsApp Web or your desktop app with this message prefilled. You must manually click send inside WhatsApp.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setWhatsAppModalOpen(false)}
                className="px-4 py-2 rounded text-xs font-semibold text-navy-700 hover:bg-paper-200"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleOpenWhatsApp}
                className="px-5 py-2.5 rounded bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
              >
                <span>Open WhatsApp Conversation</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

