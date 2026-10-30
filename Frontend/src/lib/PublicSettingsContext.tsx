"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { SiteSettings } from "@/types";
import { fetchSiteSettings } from "./api";
import { usePublicRealtime } from "./usePublicRealtime";

interface PublicSettingsContextType {
  settings: SiteSettings | null;
  refreshSettings: () => Promise<void>;
}

const defaultSettings: SiteSettings = {
  id: "default",
  instituteName: "VLEARNN",
  tagLine: "Practical IT & Advanced Technical Training",
  heroTitle: "Master Real-World IT Engineering with Industry Practitioners",
  heroSubtitle:
    "Rigorous, cohort-based technical training in Artificial Intelligence, Full Stack Web Architecture, Cloud DevOps, and Data Systems. Build production applications, not toy projects.",
  aboutStory:
    "VLEARNN was founded by seasoned software architects and engineering leaders with a clear mission: bridge the gap between theoretical classroom learning and high-stakes production engineering.",
  mission:
    "To provide disciplined, hands-on technical education that empowers students and career-changers to design, develop, and operate high-standard software systems.",
  vision:
    "To become the benchmark institute for practical IT engineering education, recognized by engineering organizations for producing capable, day-one productive technologists.",
  address: "VLEARNN Tech Campus, Level 4, Innovation Square, Tech Corridor, Bangalore 560103, India",
  phone: "+91 98765 43210",
  email: "admissions@vlearnn.com",
  whatsappNumber: "+919876543210",
  facebookUrl: "https://facebook.com/vlearnn",
  linkedinUrl: "https://linkedin.com/company/vlearnn",
  twitterUrl: "https://twitter.com/vlearnn",
  githubUrl: "https://github.com/vlearnn",
  updatedAt: new Date().toISOString(),
};

const PublicSettingsContext = createContext<PublicSettingsContextType>({
  settings: defaultSettings,
  refreshSettings: async () => {},
});

export function PublicSettingsProvider({
  children,
  initialSettings,
}: {
  children: React.ReactNode;
  initialSettings?: SiteSettings | null;
}) {
  const [settings, setSettings] = useState<SiteSettings>(initialSettings || defaultSettings);

  const refreshSettings = useCallback(async () => {
    try {
      const data = await fetchSiteSettings();
      if (data) {
        setSettings(data);
      }
    } catch (err) {
      console.warn("PublicSettingsProvider failed to refresh settings:", err);
    }
  }, []);

  useEffect(() => {
    if (!initialSettings) {
      refreshSettings();
    }
  }, [initialSettings, refreshSettings]);

  // Subscribe to real-time public updates
  usePublicRealtime(
    (event) => {
      if (event === "site_content_updated" || event === "public_settings_updated") {
        refreshSettings();
      }
    },
    ["site_content_updated", "public_settings_updated"]
  );

  return (
    <PublicSettingsContext.Provider value={{ settings, refreshSettings }}>
      {children}
    </PublicSettingsContext.Provider>
  );
}

export function usePublicSettings() {
  const context = useContext(PublicSettingsContext);
  return context.settings || defaultSettings;
}

