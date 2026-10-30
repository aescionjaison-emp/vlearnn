"use client";

import React, { useState } from "react";
import {
  Send,
  CheckCircle2,
  AlertCircle,
  Check,
} from "lucide-react";
import { submitStudentEnquiry } from "@/lib/api";
import { Course } from "@/types";

interface ContactFormClientProps {
  courses: Course[];
  preselectedCourseSlug?: string;
  matchedCourseTitle?: string | null;
}

export function ContactFormClient({
  courses,
  preselectedCourseSlug = "",
  matchedCourseTitle,
}: ContactFormClientProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [phone, setPhone] = useState("");
  const [selectedCourseSlug, setSelectedCourseSlug] = useState<string>(preselectedCourseSlug);
  const [learningMode, setLearningMode] = useState<string>("HYBRID");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [consentGiven, setConsentGiven] = useState(true);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{
    enquiryNumber: string;
    createdAt: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
    if (!fullName || fullName.length < 2) {
      setErrorMessage("Please enter both your first and last name.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }
    if (!phone.trim() || phone.trim().length < 7) {
      setErrorMessage("Please enter a valid phone number.");
      return;
    }
    if (!message.trim() || message.trim().length < 10) {
      setErrorMessage("Please enter at least 10 characters in your message.");
      return;
    }
    if (!consentGiven) {
      setErrorMessage("Please accept the communication consent to proceed.");
      return;
    }

    setIsSubmitting(true);

    try {
      const fullMessage = subject.trim()
        ? `[Subject: ${subject.trim()}]\n\n${message.trim()}`
        : message.trim();

      const response = await submitStudentEnquiry({
        fullName,
        email: email.trim(),
        countryCode: countryCode.trim(),
        phone: phone.trim(),
        courseSlug: selectedCourseSlug ? selectedCourseSlug : undefined,
        learningMode: learningMode || undefined,
        message: fullMessage,
        consentGiven,
      });

      if (response.success) {
        setSuccessData(response.data);
      } else {
        setErrorMessage(response.message || "Failed to submit enquiry. Please try again.");
      }
    } catch (err: any) {
      console.error("Submission error:", err);
      setErrorMessage(
        err?.message || "An error occurred while submitting your enquiry. Please check your details."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // SUCCESS CONFIRMATION STATE
  if (successData) {
    const displayName = `${firstName} ${lastName}`.trim() || "Student";
    return (
      <div className="bg-white p-8 sm:p-10 rounded-corporate border border-corporate-border shadow-corporate space-y-5 text-center max-w-xl mx-auto font-sans">
        <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div className="space-y-1.5">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-subtle">
            Enquiry Submitted Successfully
          </span>
          <h2 className="text-2xl font-bold text-navy-800">Thank you, {displayName}!</h2>
          <p className="text-xs sm:text-sm text-corporate-secondary leading-relaxed font-normal">
            Your admissions enquiry has been securely recorded. An academic advisor will reach out to you within 24 hours.
          </p>
        </div>

        <div className="bg-surface-soft p-4 rounded-subtle border border-corporate-border text-left space-y-2 text-xs">
          <div className="flex justify-between items-center pb-2 border-b border-corporate-border">
            <span className="text-corporate-secondary font-medium">Enquiry Reference Number:</span>
            <span className="font-mono font-bold text-navy-800 text-sm">
              {successData.enquiryNumber}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-corporate-secondary font-medium">Registered Email:</span>
            <span className="font-medium text-brandText-dark">{email}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-corporate-secondary font-medium">Course:</span>
            <span className="font-medium text-brandText-dark truncate max-w-[200px]">
              {courses.find((c) => c.slug === selectedCourseSlug)?.title || "General Technical Program"}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setSuccessData(null);
            setMessage("");
            setSubject("");
          }}
          className="text-xs font-semibold text-corporate-blue hover:underline block mx-auto pt-2"
        >
          Submit another inquiry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 sm:p-8 rounded-corporate border border-corporate-border shadow-corporate space-y-5 font-sans">
      {matchedCourseTitle && (
        <div className="p-3.5 rounded-subtle bg-corporate-blue-light border border-corporate-border flex items-start gap-2.5 text-xs text-corporate-blue">
          <Check className="w-4 h-4 text-corporate-blue flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">Selected Course:</span>
            <span>
              You are enquiring about <strong className="underline">{matchedCourseTitle}</strong>.
            </span>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 rounded-subtle bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-800">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* First Name & Last Name */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label htmlFor="firstName" className="text-xs font-bold uppercase tracking-wider text-navy-800 block">
              First Name <span className="text-red-500">*</span>
            </label>
            <input
              id="firstName"
              type="text"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="e.g. Rahul"
              className="w-full px-3.5 py-2 rounded-subtle bg-surface-soft border border-corporate-border text-sm text-brandText-dark placeholder:text-corporate-secondary focus:outline-none focus:border-corporate-blue transition-colors"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="lastName" className="text-xs font-bold uppercase tracking-wider text-navy-800 block">
              Last Name <span className="text-red-500">*</span>
            </label>
            <input
              id="lastName"
              type="text"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="e.g. Sharma"
              className="w-full px-3.5 py-2 rounded-subtle bg-surface-soft border border-corporate-border text-sm text-brandText-dark placeholder:text-corporate-secondary focus:outline-none focus:border-corporate-blue transition-colors"
            />
          </div>
        </div>

        {/* Email & Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-navy-800 block">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. rahul@domain.com"
              className="w-full px-3.5 py-2 rounded-subtle bg-surface-soft border border-corporate-border text-sm text-brandText-dark placeholder:text-corporate-secondary focus:outline-none focus:border-corporate-blue transition-colors"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="phone" className="text-xs font-bold uppercase tracking-wider text-navy-800 block">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className="w-14 sm:w-16 px-1 sm:px-2 py-2 rounded-subtle bg-surface-soft border border-corporate-border text-xs text-brandText-dark font-mono text-center focus:outline-none focus:border-corporate-blue shrink-0"
                title="Country Code"
              />
              <input
                id="phone"
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="98765 43210"
                className="flex-1 min-w-0 px-3 sm:px-3.5 py-2 rounded-subtle bg-surface-soft border border-corporate-border text-sm text-brandText-dark placeholder:text-corporate-secondary focus:outline-none focus:border-corporate-blue transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Course & Learning Mode */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label htmlFor="course" className="text-xs font-bold uppercase tracking-wider text-navy-800 block">
              Target Course <span className="text-corporate-secondary font-normal">(Optional)</span>
            </label>
            <select
              id="course"
              value={selectedCourseSlug}
              onChange={(e) => setSelectedCourseSlug(e.target.value)}
              className="w-full px-3 py-2 rounded-subtle bg-surface-soft border border-corporate-border text-xs text-brandText-dark focus:outline-none focus:border-corporate-blue transition-colors"
            >
              <option value="">General IT Training Enquiry</option>
              {courses.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label htmlFor="mode" className="text-xs font-bold uppercase tracking-wider text-navy-800 block">
              Learning Mode
            </label>
            <select
              id="mode"
              value={learningMode}
              onChange={(e) => setLearningMode(e.target.value)}
              className="w-full px-3 py-2 rounded-subtle bg-surface-soft border border-corporate-border text-xs text-brandText-dark focus:outline-none focus:border-corporate-blue transition-colors"
            >
              <option value="HYBRID">Hybrid (Weekend In-Person + Online Labs)</option>
              <option value="ONLINE">100% Online Live Classes</option>
              <option value="IN_PERSON">In-Person Classroom</option>
              <option value="WEEKEND_BOOTCAMP">Weekend Bootcamp</option>
            </select>
          </div>
        </div>

        {/* Subject */}
        <div className="space-y-1">
          <label htmlFor="subject" className="text-xs font-bold uppercase tracking-wider text-navy-800 block">
            Subject / Area of Interest
          </label>
          <input
            id="subject"
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g. Next Batch Start Date, Course Fees, Syllabus Clarification"
            className="w-full px-3.5 py-2 rounded-subtle bg-surface-soft border border-corporate-border text-sm text-brandText-dark placeholder:text-corporate-secondary focus:outline-none focus:border-corporate-blue transition-colors"
          />
        </div>

        {/* Message */}
        <div className="space-y-1">
          <label htmlFor="message" className="text-xs font-bold uppercase tracking-wider text-navy-800 block">
            Questions or Background <span className="text-red-500">*</span>
          </label>
          <textarea
            id="message"
            rows={4}
            required
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Share details regarding your current background, goals, or questions about the batch schedule..."
            className="w-full px-3.5 py-2 rounded-subtle bg-surface-soft border border-corporate-border text-sm text-brandText-dark placeholder:text-corporate-secondary focus:outline-none focus:border-corporate-blue transition-colors resize-y"
          ></textarea>
        </div>

        {/* Consent Checkbox */}
        <div className="flex items-start gap-2 pt-1">
          <input
            id="consent"
            type="checkbox"
            checked={consentGiven}
            onChange={(e) => setConsentGiven(e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded border-corporate-border text-corporate-blue focus:ring-corporate-blue"
          />
          <label htmlFor="consent" className="text-xs text-corporate-secondary leading-snug cursor-pointer">
            I consent to VLEARNN contacting me via phone, email, or WhatsApp with curriculum details and admissions updates.
          </label>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-6 py-2.5 rounded-subtle bg-corporate-blue hover:bg-corporate-blue-hover disabled:opacity-60 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-corporate"
          >
            {isSubmitting ? (
              <span>Submitting Enquiry...</span>
            ) : (
              <>
                <span>Submit Admissions Enquiry</span>
                <Send className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
