import React from "react";
import {
  fetchPublishedCourses,
  fetchCategories,
  fetchSiteSettings,
  fetchTestimonials,
} from "@/lib/api";
import { Course, CourseCategory, SiteSettings, Testimonial } from "@/types";
import { HomePageClient } from "./HomePageClient";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let settings: SiteSettings | null = null;
  let featuredCourses: Course[] = [];
  let categories: CourseCategory[] = [];
  let testimonials: Testimonial[] = [];

  try {
    const [fetchedSettings, fetchedCourses, fetchedCategories, fetchedTestimonials] =
      await Promise.all([
        fetchSiteSettings().catch(() => null),
        fetchPublishedCourses({ featured: true }).catch(() => []),
        fetchCategories().catch(() => []),
        fetchTestimonials().catch(() => []),
      ]);

    settings = fetchedSettings;
    featuredCourses = fetchedCourses;
    categories = fetchedCategories;
    testimonials = fetchedTestimonials;
  } catch (error) {
    console.error("Error loading homepage data from backend:", error);
  }

  return (
    <HomePageClient
      initialSettings={settings}
      initialFeaturedCourses={featuredCourses}
      initialCategories={categories}
      initialTestimonials={testimonials}
    />
  );
}
