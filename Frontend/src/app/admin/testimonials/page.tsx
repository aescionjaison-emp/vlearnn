"use client";

import React, { useEffect, useState } from "react";
import { MessageSquareQuote, Plus, Edit, Trash2, X, Star } from "lucide-react";
import {
  fetchAdminTestimonials,
  createAdminTestimonial,
  updateAdminTestimonial,
  deleteAdminTestimonial,
} from "@/lib/api";
import { Testimonial } from "@/types";

export default function AdminTestimonialsPage() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Testimonial | null>(null);
  const [studentName, setStudentName] = useState("");
  const [courseName, setCourseName] = useState("");
  const [role, setRole] = useState("");
  const [company, setCompany] = useState("");
  const [quote, setQuote] = useState("");
  const [rating, setRating] = useState(5);
  const [isPublished, setIsPublished] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await fetchAdminTestimonials();
      setItems(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingItem(null);
    setStudentName("");
    setCourseName("");
    setRole("");
    setCompany("");
    setQuote("");
    setRating(5);
    setIsPublished(true);
    setIsModalOpen(true);
  };

  const openEditModal = (t: Testimonial) => {
    setEditingItem(t);
    setStudentName(t.studentName);
    setCourseName(t.courseName);
    setRole(t.role);
    setCompany(t.company);
    setQuote(t.quote);
    setRating(t.rating);
    setIsPublished(t.isPublished);
    setIsModalOpen(true);
  };

  const handleDelete = async (t: Testimonial) => {
    if (!confirm(`Delete review from ${t.studentName}?`)) return;
    try {
      await deleteAdminTestimonial(t.id);
      loadData();
    } catch (err: any) {
      alert(`Delete failed: ${err?.message}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload = {
        studentName: studentName.trim(),
        courseName: courseName.trim(),
        role: role.trim(),
        company: company.trim(),
        quote: quote.trim(),
        rating,
        isPublished,
      };

      if (editingItem) {
        await updateAdminTestimonial(editingItem.id, payload);
      } else {
        await createAdminTestimonial(payload);
      }
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      alert(`Error saving testimonial: ${err?.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-navy-950">
            Student Reviews & Testimonials
          </h1>
          <p className="text-xs text-mutedblue-600 mt-1">
            Publish authentic graduate feedback and career outcomes.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="bg-navy-800 hover:bg-navy-900 text-white px-4 py-2 rounded text-xs font-semibold inline-flex items-center gap-1.5 shadow-sm"
        >
          <Plus className="w-3.5 h-3.5 text-amber-400" />
          <span>Add Testimonial</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((t) => (
          <div
            key={t.id}
            className="bg-white p-5 rounded border border-navy-100 shadow-sm flex flex-col justify-between space-y-3"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-amber-500">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
                {!t.isPublished && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-700">
                    Draft
                  </span>
                )}
              </div>
              <p className="text-xs text-navy-800 italic leading-relaxed">"{t.quote}"</p>
            </div>

            <div className="pt-3 border-t border-navy-50 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-navy-950 block">{t.studentName}</span>
                <span className="text-[11px] text-mutedblue-600 block">
                  {t.role} at {t.company}
                </span>
                <span className="text-[10px] text-amber-700 block">{t.courseName}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => openEditModal(t)}
                  className="p-1.5 rounded text-navy-800 hover:bg-paper-200 border border-navy-200"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(t)}
                  className="p-1.5 rounded text-red-600 hover:bg-red-50 border border-red-200"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm">
          <div className="bg-white rounded border border-navy-200 shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-navy-100 pb-2">
              <h3 className="text-base font-bold text-navy-950">
                {editingItem ? "Edit Testimonial" : "New Testimonial"}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-mutedblue-500 hover:text-navy-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-navy-900 uppercase block">Student Name *</label>
                  <input
                    type="text"
                    required
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="w-full px-3 py-2 rounded bg-paper-100 border border-navy-200"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-navy-900 uppercase block">Course Name *</label>
                  <input
                    type="text"
                    required
                    value={courseName}
                    onChange={(e) => setCourseName(e.target.value)}
                    className="w-full px-3 py-2 rounded bg-paper-100 border border-navy-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-navy-900 uppercase block">Job Role</label>
                  <input
                    type="text"
                    required
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g. AI Engineer"
                    className="w-full px-3 py-2 rounded bg-paper-100 border border-navy-200"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-navy-900 uppercase block">Company</label>
                  <input
                    type="text"
                    required
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g. Cognizant"
                    className="w-full px-3 py-2 rounded bg-paper-100 border border-navy-200"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-navy-900 uppercase block">Quote / Review *</label>
                <textarea
                  rows={4}
                  required
                  value={quote}
                  onChange={(e) => setQuote(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-paper-100 border border-navy-200"
                />
              </div>

              <label className="flex items-center gap-2 pt-1 font-semibold text-navy-900 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="w-4 h-4 rounded text-navy-800"
                />
                <span>Published on website</span>
              </label>

              <div className="flex justify-end gap-2 pt-3 border-t border-navy-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 rounded text-navy-700 hover:bg-paper-200 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 rounded bg-navy-800 hover:bg-navy-900 text-white font-bold"
                >
                  {isSaving ? "Saving..." : "Save Testimonial"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

