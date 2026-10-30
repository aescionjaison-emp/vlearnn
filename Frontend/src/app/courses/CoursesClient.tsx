"use client";

import React, { useState } from "react";
import { Course, CourseCategory } from "@/types";
import { fetchPublishedCourses, fetchCategories } from "@/lib/api";
import { usePublicRealtime } from "@/lib/usePublicRealtime";
import { AcademicProgramsSection } from "@/components/AcademicProgramsSection";

interface CoursesClientProps {
  initialCourses: Course[];
  categories: CourseCategory[];
  initialCategory?: string;
}

export function CoursesClient({
  initialCourses,
  categories,
  initialCategory = "ALL",
}: CoursesClientProps) {
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [categoryList, setCategoryList] = useState<CourseCategory[]>(categories);

  // Live real-time subscription
  usePublicRealtime(
    async (event) => {
      if (event === "courses_updated" || event === "categories_updated") {
        try {
          const [freshCourses, freshCats] = await Promise.all([
            fetchPublishedCourses(),
            fetchCategories(),
          ]);
          setCourses(freshCourses);
          setCategoryList(freshCats);
        } catch (err) {
          console.error("Failed to live-refresh courses:", err);
        }
      }
    },
    ["courses_updated", "categories_updated"]
  );

  return (
    <div className="font-sans">
      <AcademicProgramsSection
        courses={courses}
        initialCategory={initialCategory}
        isCoursePage={true}
      />
    </div>
  );
}
