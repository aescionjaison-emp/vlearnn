import React from "react";
import { fetchPublishedCourses, fetchSiteSettings } from "@/lib/api";
import { Course, SiteSettings } from "@/types";
import { ContactPageClient } from "./ContactPageClient";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: {
    course?: string;
  };
}

export default async function ContactPage({ searchParams }: PageProps) {
  let courses: Course[] = [];
  let settings: SiteSettings | null = null;
  let matchedCourseTitle: string | null = null;

  try {
    const [c, s] = await Promise.all([
      fetchPublishedCourses().catch(() => []),
      fetchSiteSettings().catch(() => null),
    ]);
    courses = c;
    settings = s;

    if (searchParams.course) {
      const match = courses.find(
        (item) => item.slug.toLowerCase() === searchParams.course?.toLowerCase()
      );
      if (match) {
        matchedCourseTitle = match.title;
      }
    }
  } catch (err) {
    console.error("Error loading contact page data:", err);
  }

  return (
    <ContactPageClient
      initialCourses={courses}
      initialSettings={settings}
      preselectedCourseSlug={searchParams.course || ""}
      matchedCourseTitle={matchedCourseTitle}
    />
  );
}
