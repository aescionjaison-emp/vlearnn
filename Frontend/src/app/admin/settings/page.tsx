"use client";

import React, { useEffect, useState } from "react";
import { ShieldCheck, Mail, MessageSquare } from "lucide-react";
import { getStoredAdminUser } from "@/lib/api";

export default function AdminSettingsPage() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    setUser(getStoredAdminUser());
  }, []);

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-16">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-navy-950">
          System Diagnostics & Integration Setup
        </h1>
        <p className="text-xs text-mutedblue-600 mt-1">
          Review email service status, messaging integrations, and administrator security policies.
        </p>
      </div>

      {/* Admin User Profile */}
      <div className="bg-white p-6 rounded border border-navy-100 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-navy-50 pb-2">
          <ShieldCheck className="w-5 h-5 text-amber-600" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-navy-900">
            Current Authenticated Staff Account
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <span className="text-mutedblue-500 block text-[11px]">Administrator Name</span>
            <span className="font-bold text-navy-950 text-sm">
              {user?.name || "VLEARNN Master Administrator"}
            </span>
          </div>
          <div>
            <span className="text-mutedblue-500 block text-[11px]">Staff Email</span>
            <span className="font-semibold text-navy-900">{user?.email || "admin@vlearnn.com"}</span>
          </div>
          <div>
            <span className="text-mutedblue-500 block text-[11px]">Access Level</span>
            <span className="font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-[11px]">
              {user?.role || "SUPER_ADMIN"}
            </span>
          </div>
        </div>
      </div>

      {/* Resend Integration Status */}
      <div className="bg-white p-6 rounded border border-navy-100 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-navy-50 pb-2">
          <Mail className="w-5 h-5 text-blue-600" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-navy-900">
            Resend Transactional Email Integration
          </h2>
        </div>

        <div className="space-y-3 text-xs text-mutedblue-800 leading-relaxed">
          <p>
            VLEARNN utilizes <strong>Resend</strong> for dispatching admissions alerts to institute coordinators and sending direct email replies from the Enquiry CRM to prospective students.
          </p>
          <div className="p-3.5 rounded bg-paper-100 border border-navy-100 space-y-2 text-[11px]">
            <div className="flex justify-between">
              <span className="text-mutedblue-600">Provider:</span>
              <strong className="text-navy-950">Resend (Official Node SDK)</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-mutedblue-600">Configured Sender:</span>
              <span className="font-mono text-navy-950">onboarding@resend.dev (or verified domain)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-mutedblue-600">Admin Notification Target:</span>
              <span className="font-mono text-navy-950">admin@vlearnn.com</span>
            </div>
            <div className="flex justify-between">
              <span className="text-mutedblue-600">Delivery Persistence:</span>
              <span className="text-emerald-700 font-bold">
                Safely recorded (Never dropped on API failure)
              </span>
            </div>
          </div>
          <div className="p-3 rounded bg-amber-50 border border-amber-200 text-amber-900 text-[11px] space-y-1">
            <strong>Inbound Email Synchronization Note:</strong>
            <p>
              Sending or receiving a reply in an external email application will not automatically synchronize that message into the dashboard without an inbound webhook configuration. All dashboard-initiated replies are recorded directly in the CRM.
            </p>
          </div>
        </div>
      </div>

      {/* WhatsApp Click-to-Chat Integration */}
      <div className="bg-white p-6 rounded border border-navy-100 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-navy-50 pb-2">
          <MessageSquare className="w-5 h-5 text-emerald-600" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-navy-900">
            WhatsApp Click-to-Chat Integration
          </h2>
        </div>

        <div className="space-y-3 text-xs text-mutedblue-800 leading-relaxed">
          <p>
            Direct WhatsApp integration uses official <code className="font-mono bg-paper-200 px-1 py-0.5 rounded">wa.me</code> universal links with encoded query messages. It requires zero third-party API dependencies or recurring costs.
          </p>
          <div className="p-3.5 rounded bg-paper-100 border border-navy-100 space-y-2 text-[11px]">
            <div className="flex justify-between">
              <span className="text-mutedblue-600">Configured WhatsApp Phone:</span>
              <span className="font-mono text-navy-950">+91 98765 43210</span>
            </div>
            <div className="flex justify-between">
              <span className="text-mutedblue-600">Public Floating Button:</span>
              <span className="text-emerald-700 font-semibold">Active across all public pages</span>
            </div>
            <div className="flex justify-between">
              <span className="text-mutedblue-600">CRM Reply Mechanism:</span>
              <span className="text-navy-950">Pre-populates student name & requested course</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

