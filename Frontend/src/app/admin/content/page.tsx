"use client";

import React, { useEffect, useState } from "react";
import { FileText, Save, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import { fetchSiteSettings, updateSiteSettings } from "@/lib/api";
import { SiteSettings } from "@/types";

export default function AdminContentPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ success: boolean; message: string } | null>(null);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const data = await fetchSiteSettings();
      setSettings(data);
    } catch (err: any) {
      setFeedback({ success: false, message: err?.message || "Failed to load settings" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setIsSaving(true);
    setFeedback(null);

    try {
      const updated = await updateSiteSettings(settings);
      setSettings(updated);
      setFeedback({
        success: true,
        message: "Site content and contact settings updated successfully!",
      });
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      setFeedback({ success: false, message: err?.message || "Failed to update settings" });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading && !settings) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <RefreshCw className="w-6 h-6 animate-spin text-navy-800" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-navy-950">
          Site Content & Institute Information
        </h1>
        <p className="text-xs text-mutedblue-600 mt-1">
          Changes saved here update the public homepage, about page, and footer immediately.
        </p>
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded text-xs flex items-start gap-2.5 ${
            feedback.success
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {feedback.success ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {settings && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Hero & Branding */}
          <div className="bg-white p-6 rounded border border-navy-100 shadow-sm space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-navy-900 border-b border-navy-50 pb-2">
              Homepage Hero Section
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-navy-900 uppercase">
                  Institute Name
                </label>
                <input
                  type="text"
                  value={settings.instituteName}
                  onChange={(e) => setSettings({ ...settings, instituteName: e.target.value })}
                  className="w-full px-3 py-2 rounded bg-paper-100 border border-navy-200 text-xs font-semibold text-navy-900"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-navy-900 uppercase">Tagline</label>
                <input
                  type="text"
                  value={settings.tagLine}
                  onChange={(e) => setSettings({ ...settings, tagLine: e.target.value })}
                  className="w-full px-3 py-2 rounded bg-paper-100 border border-navy-200 text-xs text-navy-900"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-navy-900 uppercase">
                Hero Main Headline
              </label>
              <input
                type="text"
                value={settings.heroTitle}
                onChange={(e) => setSettings({ ...settings, heroTitle: e.target.value })}
                className="w-full px-3 py-2 rounded bg-paper-100 border border-navy-200 text-xs font-bold text-navy-950"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-navy-900 uppercase">
                Hero Subtitle / Description
              </label>
              <textarea
                rows={3}
                value={settings.heroSubtitle}
                onChange={(e) => setSettings({ ...settings, heroSubtitle: e.target.value })}
                className="w-full px-3 py-2 rounded bg-paper-100 border border-navy-200 text-xs text-navy-900"
              />
            </div>
          </div>

          {/* Section 2: About Page Content */}
          <div className="bg-white p-6 rounded border border-navy-100 shadow-sm space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-navy-900 border-b border-navy-50 pb-2">
              About Page Content
            </h2>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-navy-900 uppercase">
                Institute Origin Story
              </label>
              <textarea
                rows={4}
                value={settings.aboutStory}
                onChange={(e) => setSettings({ ...settings, aboutStory: e.target.value })}
                className="w-full px-3 py-2 rounded bg-paper-100 border border-navy-200 text-xs text-navy-900"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-navy-900 uppercase">Mission</label>
                <textarea
                  rows={3}
                  value={settings.mission}
                  onChange={(e) => setSettings({ ...settings, mission: e.target.value })}
                  className="w-full px-3 py-2 rounded bg-paper-100 border border-navy-200 text-xs text-navy-900"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-navy-900 uppercase">Vision</label>
                <textarea
                  rows={3}
                  value={settings.vision}
                  onChange={(e) => setSettings({ ...settings, vision: e.target.value })}
                  className="w-full px-3 py-2 rounded bg-paper-100 border border-navy-200 text-xs text-navy-900"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Admissions & Direct Contact */}
          <div className="bg-white p-6 rounded border border-navy-100 shadow-sm space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-navy-900 border-b border-navy-50 pb-2">
              Admissions Desk & Channels
            </h2>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-navy-900 uppercase">
                Physical Campus Address
              </label>
              <input
                type="text"
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                className="w-full px-3 py-2 rounded bg-paper-100 border border-navy-200 text-xs text-navy-900"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-navy-900 uppercase">
                  Admissions Phone
                </label>
                <input
                  type="text"
                  value={settings.phone}
                  onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded bg-paper-100 border border-navy-200 text-xs text-navy-900"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-navy-900 uppercase">
                  Admissions Email
                </label>
                <input
                  type="email"
                  value={settings.email}
                  onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                  className="w-full px-3 py-2 rounded bg-paper-100 border border-navy-200 text-xs text-navy-900"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-navy-900 uppercase">
                  WhatsApp Number (with country code)
                </label>
                <input
                  type="text"
                  value={settings.whatsappNumber}
                  onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
                  placeholder="919876543210"
                  className="w-full px-3 py-2 rounded bg-paper-100 border border-navy-200 text-xs text-navy-900 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Social Channels & External Presence */}
          <div className="bg-white p-6 rounded border border-navy-100 shadow-sm space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-navy-900 border-b border-navy-50 pb-2">
              Social Channels & Profiles
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-navy-900 uppercase">LinkedIn Profile URL</label>
                <input
                  type="url"
                  value={settings.linkedinUrl || ""}
                  onChange={(e) => setSettings({ ...settings, linkedinUrl: e.target.value })}
                  placeholder="https://linkedin.com/company/vlearnn"
                  className="w-full px-3 py-2 rounded bg-paper-100 border border-navy-200 text-xs text-navy-900"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-navy-900 uppercase">Twitter / X URL</label>
                <input
                  type="url"
                  value={settings.twitterUrl || ""}
                  onChange={(e) => setSettings({ ...settings, twitterUrl: e.target.value })}
                  placeholder="https://twitter.com/vlearnn"
                  className="w-full px-3 py-2 rounded bg-paper-100 border border-navy-200 text-xs text-navy-900"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-navy-900 uppercase">GitHub Organization URL</label>
                <input
                  type="url"
                  value={settings.githubUrl || ""}
                  onChange={(e) => setSettings({ ...settings, githubUrl: e.target.value })}
                  placeholder="https://github.com/vlearnn"
                  className="w-full px-3 py-2 rounded bg-paper-100 border border-navy-200 text-xs text-navy-900"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-navy-900 uppercase">Facebook Page URL</label>
                <input
                  type="url"
                  value={settings.facebookUrl || ""}
                  onChange={(e) => setSettings({ ...settings, facebookUrl: e.target.value })}
                  placeholder="https://facebook.com/vlearnn"
                  className="w-full px-3 py-2 rounded bg-paper-100 border border-navy-200 text-xs text-navy-900"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-3 rounded bg-navy-800 hover:bg-navy-900 text-white font-bold text-xs flex items-center gap-2 shadow-sm disabled:opacity-50"
            >
              <Save className="w-4 h-4 text-amber-400" />
              <span>{isSaving ? "Saving Changes..." : "Save Content"}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

