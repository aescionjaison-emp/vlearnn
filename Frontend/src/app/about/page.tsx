import React from "react";
import { fetchSiteSettings, fetchFaculty } from "@/lib/api";
import { SiteSettings, FacultyProfile } from "@/types";
import { AboutClient } from "./AboutClient";

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  let settings: SiteSettings | null = null;
  let faculty: FacultyProfile[] = [];

  try {
    const [s, f] = await Promise.all([
      fetchSiteSettings().catch(() => null),
      fetchFaculty().catch(() => []),
    ]);
    settings = s;
    faculty = f;
  } catch (err) {
    console.error("Error fetching about page data:", err);
  }

  return <AboutClient initialSettings={settings} faculty={faculty} />;
}
