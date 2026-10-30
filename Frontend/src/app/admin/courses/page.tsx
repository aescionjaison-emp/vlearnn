"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Plus,
  Edit,
  Archive,
  Eye,
  EyeOff,
  Check,
  Star,
  RefreshCw,
  AlertCircle,
  Clock,
  Layers,
  X,
  PlusCircle,
  Trash2,
} from "lucide-react";
import {
  fetchAdminCourses,
  fetchAdminCategories,
  createAdminCourse,
  updateAdminCourse,
  archiveAdminCourse,
} from "@/lib/api";
import { Course, CourseCategory, LearningMode } from "@/types";

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<CourseCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Form Fields
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [summary, setSummary] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [learningMode, setLearningMode] = useState<LearningMode>("HYBRID");
  const [fees, setFees] = useState<string>("");
  const [eligibility, setEligibility] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isPublished, setIsPublished] = useState(true);

  // Modules Editor
  const [modules, setModules] = useState<
    Array<{ title: string; description: string; topicsText: string; durationHours: string }>
  >([]);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [coursesData, categoriesData] = await Promise.all([
        fetchAdminCourses(),
        fetchAdminCategories(),
      ]);
      setCourses(coursesData);
      setCategories(categoriesData);
      if (categoriesData.length > 0 && !categoryId) {
        setCategoryId(categoriesData[0].id);
      }
    } catch (err: any) {
      console.error("Error loading courses:", err);
      setError(err?.message || "Failed to load courses");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingCourse(null);
    setTitle("");
    setSlug("");
    const defaultCatId = categories.length > 0 ? categories[0].id : "";
    setCategoryId(defaultCatId);
    setSummary("");
    setDescription("");
    setDuration("14 Weeks (100 Hours)");
    setLearningMode("HYBRID");
    setFees("35000");
    setEligibility("");
    setIsFeatured(false);
    setIsPublished(true);
    setModules([
      {
        title: "Module 1: Foundations & Architecture",
        description: "Core principles, system design blueprints, and setup.",
        topicsText: "Core syntax, Protocols, Architectural patterns",
        durationHours: "25",
      },
    ]);
    setFieldErrors({});
    setModalError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (c: Course) => {
    setEditingCourse(c);
    setTitle(c.title);
    setSlug(c.slug);
    setCategoryId(c.categoryId);
    setSummary(c.summary);
    setDescription(c.description);
    setDuration(c.duration);
    setLearningMode(c.learningMode);
    setFees(c.fees !== null && c.fees !== undefined ? c.fees.toString() : "");
    setEligibility(c.eligibility || "");
    setIsFeatured(c.isFeatured);
    setIsPublished(c.isPublished);
    setModules(
      c.modules && c.modules.length > 0
        ? c.modules.map((m) => ({
            title: m.title,
            description: m.description || "",
            topicsText: (m.topics || []).join(", "),
            durationHours: m.durationHours ? m.durationHours.toString() : "20",
          }))
        : []
    );
    setFieldErrors({});
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleTogglePublish = async (course: Course) => {
    try {
      await updateAdminCourse(course.id, { isPublished: !course.isPublished });
      setCourses((prev) =>
        prev.map((c) =>
          c.id === course.id ? { ...c, isPublished: !c.isPublished } : c
        )
      );
      setSuccessBanner(
        `Course "${course.title}" is now ${
          !course.isPublished ? "published" : "hidden/draft"
        }.`
      );
    } catch (err: any) {
      alert(`Error toggling course status: ${err?.message}`);
    }
  };

  const handleToggleFeatured = async (course: Course) => {
    try {
      await updateAdminCourse(course.id, { isFeatured: !course.isFeatured });
      setCourses((prev) =>
        prev.map((c) =>
          c.id === course.id ? { ...c, isFeatured: !c.isFeatured } : c
        )
      );
      setSuccessBanner(
        `Course "${course.title}" ${
          !course.isFeatured ? "marked as featured" : "removed from featured"
        }.`
      );
    } catch (err: any) {
      alert(`Error updating featured flag: ${err?.message}`);
    }
  };

  const handleArchiveCourse = async (course: Course) => {
    if (
      !confirm(
        `Are you sure you want to archive "${course.title}"? Archived courses cannot accept new inquiries.`
      )
    ) {
      return;
    }
    try {
      await archiveAdminCourse(course.id);
      setCourses((prev) =>
        prev.map((c) => (c.id === course.id ? { ...c, isArchived: true } : c))
      );
      setSuccessBanner(`Course "${course.title}" has been archived.`);
    } catch (err: any) {
      alert(`Error archiving course: ${err?.message}`);
    }
  };

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);
    setFieldErrors({});
    setIsSaving(true);

    const trimmedTitle = title.trim();
    const trimmedSlug = slug.trim();
    const trimmedSummary = summary.trim();
    const trimmedDescription = description.trim();
    const trimmedDuration = duration.trim();

    const localErrors: Record<string, string> = {};
    if (!trimmedTitle) localErrors.title = "Course title is mandatory.";
    if (!trimmedSlug) localErrors.slug = "URL slug is mandatory.";
    if (!categoryId) localErrors.categoryId = "A category must be selected.";
    if (!trimmedSummary) localErrors.summary = "A summary overview is mandatory.";
    if (!trimmedDescription) localErrors.description = "Full course description is mandatory.";
    if (!trimmedDuration) localErrors.duration = "Duration text is mandatory.";

    if (Object.keys(localErrors).length > 0) {
      setFieldErrors(localErrors);
      setModalError("Please complete all required fields indicated below.");
      setIsSaving(false);
      return;
    }

    try {
      const formattedModules = modules.map((m, idx) => ({
        id: `mod-${idx + 1}-${Date.now()}`,
        title: m.title.trim(),
        description: m.description.trim(),
        topics: m.topicsText
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        durationHours: m.durationHours ? parseInt(m.durationHours, 10) : 20,
        sortOrder: idx,
      }));

      const payload = {
        title: trimmedTitle,
        slug: trimmedSlug,
        categoryId,
        summary: trimmedSummary,
        description: trimmedDescription,
        duration: trimmedDuration,
        learningMode,
        fees: fees && !isNaN(parseInt(fees, 10)) ? parseInt(fees, 10) : null,
        eligibility: eligibility.trim() || null,
        isFeatured: Boolean(isFeatured),
        isPublished: Boolean(isPublished),
        modules: formattedModules,
      };

      if (editingCourse) {
        await updateAdminCourse(editingCourse.id, payload);
        setSuccessBanner(`Course "${payload.title}" updated successfully.`);
      } else {
        await createAdminCourse(payload);
        setSuccessBanner(`Course "${payload.title}" created successfully.`);
      }

      setIsModalOpen(false);
      await loadData();
    } catch (err: any) {
      console.error("Save course error:", err);
      if (err?.fields && Object.keys(err.fields).length > 0) {
        setFieldErrors(err.fields);
      }
      setModalError(
        err?.message ||
          "Failed to save course. Please review the highlighted fields."
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E7EB] pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#17324D]">
            Course & Curriculum Management
          </h1>
          <p className="text-xs text-[#60656D] mt-1">
            Publish cohorts, adjust syllabus modules, and manage tuition structures.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={loadData}
            className="px-3.5 py-2 bg-white border border-[#E5E7EB] hover:bg-[#F7F8FA] text-[#17324D] text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
          <button
            type="button"
            onClick={openCreateModal}
            className="bg-[#2463A6] hover:bg-[#1B4B80] text-white px-4 py-2 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create New Program</span>
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {successBanner && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span className="font-semibold">{successBanner}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessBanner(null)}
            className="text-emerald-700 hover:text-emerald-900 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Courses Enterprise Table */}
      <div className="bg-white border border-[#E5E7EB] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-[#F7F8FA] text-[#60656D]">
                <th className="py-3 px-5 font-bold uppercase tracking-wider text-[11px]">Title & Slug</th>
                <th className="py-3 px-5 font-bold uppercase tracking-wider text-[11px]">Category & Mode</th>
                <th className="py-3 px-5 font-bold uppercase tracking-wider text-[11px]">Duration & Tuition</th>
                <th className="py-3 px-5 font-bold uppercase tracking-wider text-[11px]">Status</th>
                <th className="py-3 px-5 font-bold uppercase tracking-wider text-[11px] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {courses.map((course) => (
                <tr
                  key={course.id}
                  className={`hover:bg-[#F7F8FA]/60 transition-colors ${
                    course.isArchived ? "opacity-60 bg-gray-50" : ""
                  }`}
                >
                  <td className="py-3.5 px-5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#17324D] text-sm block">
                        {course.title}
                      </span>
                      {course.isFeatured && (
                        <span className="px-2 py-0.5 bg-[#EBF3FA] text-[#2463A6] border border-[#2463A6]/30 text-[10px] font-bold">
                          Featured
                        </span>
                      )}
                    </div>
                    <span className="font-mono text-[11px] text-[#60656D] block">
                      /courses/{course.slug}
                    </span>
                  </td>

                  <td className="py-3.5 px-5">
                    <span className="font-semibold text-[#1C1C1C] block">
                      {course.category?.name}
                    </span>
                    <span className="text-[11px] text-[#60656D] block">
                      {course.learningMode}
                    </span>
                  </td>

                  <td className="py-3.5 px-5">
                    <span className="text-[#1C1C1C] block">{course.duration}</span>
                    <span className="font-bold text-[#17324D] block text-[11px]">
                      {course.fees ? `₹${course.fees.toLocaleString()}` : "Upon Request"}
                    </span>
                  </td>

                  <td className="py-3.5 px-5 space-y-1">
                    {course.isArchived ? (
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-[10px] font-bold uppercase border border-gray-300">
                        ARCHIVED
                      </span>
                    ) : course.isPublished ? (
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold uppercase">
                        PUBLISHED
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold uppercase">
                        DRAFT
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-5 text-right space-x-2">
                    {/* Toggle Publish button */}
                    {!course.isArchived && (
                      <button
                        type="button"
                        onClick={() => handleTogglePublish(course)}
                        title={course.isPublished ? "Unpublish course" : "Publish course"}
                        className={`p-1.5 text-xs font-semibold border transition-colors ${
                          course.isPublished
                            ? "border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                            : "border-gray-300 text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        {course.isPublished ? (
                          <Eye className="w-3.5 h-3.5" />
                        ) : (
                          <EyeOff className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}

                    {/* Toggle Featured */}
                    {!course.isArchived && (
                      <button
                        type="button"
                        onClick={() => handleToggleFeatured(course)}
                        title="Toggle Featured"
                        className={`p-1.5 text-xs font-semibold border transition-colors ${
                          course.isFeatured
                            ? "border-[#2463A6] text-[#2463A6] bg-[#EBF3FA]"
                            : "border-gray-200 text-gray-400 hover:bg-gray-50"
                        }`}
                      >
                        <Star className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {/* Edit button */}
                    <button
                      type="button"
                      onClick={() => openEditModal(course)}
                      title="Edit Course & Modules"
                      className="p-1.5 text-[#17324D] hover:bg-[#F7F8FA] border border-[#E5E7EB] transition-colors"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>

                    {/* Archive button */}
                    {!course.isArchived && (
                      <button
                        type="button"
                        onClick={() => handleArchiveCourse(course)}
                        title="Archive Course"
                        className="p-1.5 text-red-600 hover:bg-red-50 border border-red-200 transition-colors"
                      >
                        <Archive className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Course Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#17324D]/70 overflow-y-auto">
          <div className="bg-white border border-[#E5E7EB] shadow-2xl max-w-3xl w-full p-6 sm:p-8 space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-4">
              <h2 className="text-lg font-bold text-[#17324D]">
                {editingCourse ? "Edit Curriculum & Syllabus Details" : "Create New Engineering Course"}
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-[#60656D] hover:text-[#17324D]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="p-3.5 bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-semibold">{modalError}</span>
                  {Object.keys(fieldErrors).length > 0 && (
                    <ul className="list-disc list-inside text-[11px] text-red-700 space-y-0.5 mt-1">
                      {Object.entries(fieldErrors).map(([key, msg]) => (
                        <li key={key}>
                          <span className="font-medium capitalize">{key.replace(/\./g, " ")}</span>: {msg}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}

            <form onSubmit={handleSaveCourse} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#17324D] uppercase">
                    Course Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      if (fieldErrors.title) {
                        const copy = { ...fieldErrors };
                        delete copy.title;
                        setFieldErrors(copy);
                      }
                      if (!editingCourse) {
                        setSlug(
                          e.target.value
                            .toLowerCase()
                            .replace(/[^a-z0-9]+/g, "-")
                            .replace(/(^-|-$)/g, "")
                        );
                      }
                    }}
                    placeholder="e.g. Applied Machine Learning & RAG"
                    className={`w-full px-3 py-2 bg-[#F7F8FA] border text-xs text-[#1C1C1C] transition-colors focus:outline-none ${
                      fieldErrors.title
                        ? "border-red-500 bg-red-50/20"
                        : "border-[#E5E7EB] focus:border-[#2463A6]"
                    }`}
                  />
                  {fieldErrors.title && (
                    <p className="text-[11px] text-red-600 font-medium">{fieldErrors.title}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#17324D] uppercase">
                    URL Slug * (Unique)
                  </label>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => {
                      setSlug(e.target.value);
                      if (fieldErrors.slug) {
                        const copy = { ...fieldErrors };
                        delete copy.slug;
                        setFieldErrors(copy);
                      }
                    }}
                    placeholder="e.g. applied-machine-learning"
                    className={`w-full px-3 py-2 bg-[#F7F8FA] border text-xs font-mono text-[#1C1C1C] transition-colors focus:outline-none ${
                      fieldErrors.slug
                        ? "border-red-500 bg-red-50/20"
                        : "border-[#E5E7EB] focus:border-[#2463A6]"
                    }`}
                  />
                  {fieldErrors.slug && (
                    <p className="text-[11px] text-red-600 font-medium">{fieldErrors.slug}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#17324D] uppercase">Category *</label>
                  <select
                    value={categoryId}
                    onChange={(e) => {
                      setCategoryId(e.target.value);
                      if (fieldErrors.categoryId) {
                        const copy = { ...fieldErrors };
                        delete copy.categoryId;
                        setFieldErrors(copy);
                      }
                    }}
                    className={`w-full px-3 py-2 bg-[#F7F8FA] border text-xs text-[#1C1C1C] transition-colors focus:outline-none ${
                      fieldErrors.categoryId
                        ? "border-red-500"
                        : "border-[#E5E7EB] focus:border-[#2463A6]"
                    }`}
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#17324D] uppercase">
                    Learning Mode
                  </label>
                  <select
                    value={learningMode}
                    onChange={(e) => setLearningMode(e.target.value as LearningMode)}
                    className="w-full px-3 py-2 bg-[#F7F8FA] border border-[#E5E7EB] text-xs text-[#1C1C1C] focus:outline-none focus:border-[#2463A6]"
                  >
                    <option value="HYBRID">HYBRID</option>
                    <option value="ONLINE">ONLINE</option>
                    <option value="IN_PERSON">IN_PERSON</option>
                    <option value="WEEKEND_BOOTCAMP">WEEKEND_BOOTCAMP</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#17324D] uppercase">
                    Tuition Fees (₹)
                  </label>
                  <input
                    type="number"
                    value={fees}
                    onChange={(e) => {
                      setFees(e.target.value);
                      if (fieldErrors.fees) {
                        const copy = { ...fieldErrors };
                        delete copy.fees;
                        setFieldErrors(copy);
                      }
                    }}
                    placeholder="e.g. 42000"
                    className={`w-full px-3 py-2 bg-[#F7F8FA] border text-xs text-[#1C1C1C] transition-colors focus:outline-none ${
                      fieldErrors.fees
                        ? "border-red-500"
                        : "border-[#E5E7EB] focus:border-[#2463A6]"
                    }`}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#17324D] uppercase">
                  Duration Text *
                </label>
                <input
                  type="text"
                  required
                  value={duration}
                  onChange={(e) => {
                    setDuration(e.target.value);
                    if (fieldErrors.duration) {
                      const copy = { ...fieldErrors };
                      delete copy.duration;
                      setFieldErrors(copy);
                    }
                  }}
                  placeholder="e.g. 16 Weeks (120 Hours)"
                  className="w-full px-3 py-2 bg-[#F7F8FA] border border-[#E5E7EB] text-xs text-[#1C1C1C] focus:outline-none focus:border-[#2463A6]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#17324D] uppercase">
                  Summary / Short Card Description *
                </label>
                <textarea
                  rows={2}
                  required
                  value={summary}
                  onChange={(e) => {
                    setSummary(e.target.value);
                    if (fieldErrors.summary) {
                      const copy = { ...fieldErrors };
                      delete copy.summary;
                      setFieldErrors(copy);
                    }
                  }}
                  placeholder="Concise overview for directory listings."
                  className="w-full px-3 py-2 bg-[#F7F8FA] border border-[#E5E7EB] text-xs text-[#1C1C1C] focus:outline-none focus:border-[#2463A6]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#17324D] uppercase">
                  Full Course Description *
                </label>
                <textarea
                  rows={4}
                  required
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    if (fieldErrors.description) {
                      const copy = { ...fieldErrors };
                      delete copy.description;
                      setFieldErrors(copy);
                    }
                  }}
                  placeholder="In-depth breakdown of program scope, outcomes, and hands-on lab projects."
                  className="w-full px-3 py-2 bg-[#F7F8FA] border border-[#E5E7EB] text-xs text-[#1C1C1C] focus:outline-none focus:border-[#2463A6]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#17324D] uppercase">
                  Eligibility & Prerequisites
                </label>
                <input
                  type="text"
                  value={eligibility}
                  onChange={(e) => setEligibility(e.target.value)}
                  placeholder="e.g. Prior programming background in Python or JavaScript."
                  className="w-full px-3 py-2 bg-[#F7F8FA] border border-[#E5E7EB] text-xs text-[#1C1C1C] focus:outline-none focus:border-[#2463A6]"
                />
              </div>

              {/* Status checkboxes */}
              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 text-xs font-semibold text-[#17324D] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPublished}
                    onChange={(e) => setIsPublished(e.target.checked)}
                    className="w-4 h-4 text-[#2463A6]"
                  />
                  <span>Publish immediately to catalog</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-semibold text-[#17324D] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="w-4 h-4 text-[#2463A6]"
                  />
                  <span>Feature on homepage</span>
                </label>
              </div>

              {/* Modules & Syllabus Editor */}
              <div className="pt-4 border-t border-[#E5E7EB] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#17324D] uppercase">
                    Curriculum Modules ({modules.length})
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setModules([
                        ...modules,
                        {
                          title: `Module ${modules.length + 1}: Technical Topic`,
                          description: "",
                          topicsText: "",
                          durationHours: "20",
                        },
                      ])
                    }
                    className="text-xs font-semibold text-[#2463A6] hover:underline flex items-center gap-1"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Add Module</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {modules.map((m, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-[#F7F8FA] border border-[#E5E7EB] space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-[#17324D] text-[11px]">
                          Module #{idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => setModules(modules.filter((_, i) => i !== idx))}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div className="sm:col-span-2">
                          <input
                            type="text"
                            value={m.title}
                            onChange={(e) => {
                              const updated = [...modules];
                              updated[idx].title = e.target.value;
                              setModules(updated);
                            }}
                            placeholder="Module Title *"
                            className="w-full px-2.5 py-1.5 bg-white border border-[#E5E7EB] text-xs focus:outline-none focus:border-[#2463A6]"
                          />
                        </div>
                        <div>
                          <input
                            type="number"
                            value={m.durationHours}
                            onChange={(e) => {
                              const updated = [...modules];
                              updated[idx].durationHours = e.target.value;
                              setModules(updated);
                            }}
                            placeholder="Hours"
                            className="w-full px-2.5 py-1.5 bg-white border border-[#E5E7EB] text-xs focus:outline-none focus:border-[#2463A6]"
                          />
                        </div>
                      </div>

                      <input
                        type="text"
                        value={m.topicsText}
                        onChange={(e) => {
                          const updated = [...modules];
                          updated[idx].topicsText = e.target.value;
                          setModules(updated);
                        }}
                        placeholder="Comma-separated topics (e.g. Docker, CI/CD, Microservices)"
                        className="w-full px-2.5 py-1.5 bg-white border border-[#E5E7EB] text-xs focus:outline-none focus:border-[#2463A6]"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E5E7EB]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#60656D] hover:bg-[#F7F8FA]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 bg-[#17324D] hover:bg-[#2463A6] text-white font-bold text-xs disabled:opacity-50 transition-colors inline-flex items-center gap-2"
                >
                  {isSaving && (
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                  <span>
                    {isSaving
                      ? "Saving..."
                      : editingCourse
                      ? "Update Course"
                      : "Save Course"}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
