import React from "react";
import { fetchPublishedCourses, fetchCategories } from "@/lib/api";
import { CoursesClient } from "./CoursesClient";
import { Course, CourseCategory } from "@/types";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: {
    category?: string;
  };
}

export default async function CoursesPage({ searchParams }: PageProps) {
  let courses: Course[] = [];
  let categories: CourseCategory[] = [];
  let loadError: string | null = null;

  try {
    const [c, cats] = await Promise.all([
      fetchPublishedCourses(),
      fetchCategories(),
    ]);
    courses = c;
    categories = cats;
  } catch (err: any) {
    console.error("Error loading courses page:", err);
    loadError = err?.message || "Failed to connect to database";
  }

  return (
    <div className="font-sans bg-white min-h-screen">
      {loadError ? (
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="bg-[#FAF9F6] border border-[#E5E7EB] text-[#10264A] p-6 text-sm space-y-2 rounded-2xl">
            <h3 className="font-bold">Unable to load courses</h3>
            <p className="text-xs text-[#687586]">{loadError}</p>
          </div>
        </div>
      ) : (
        <CoursesClient
          initialCourses={courses}
          categories={categories}
          initialCategory={searchParams.category || "ALL"}
        />
      )}
    </div>
  );
}
