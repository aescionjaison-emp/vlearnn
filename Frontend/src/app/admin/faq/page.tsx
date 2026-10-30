"use client";

import React, { useEffect, useState } from "react";
import { HelpCircle, Plus, Edit, Trash2, X, AlertCircle } from "lucide-react";
import {
  fetchAdminFAQs,
  createAdminFAQ,
  updateAdminFAQ,
  deleteAdminFAQ,
} from "@/lib/api";
import { FAQ } from "@/types";

export default function AdminFAQPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [category, setCategory] = useState("General");
  const [displayOrder, setDisplayOrder] = useState("1");
  const [isPublished, setIsPublished] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const loadFAQs = async () => {
    setIsLoading(true);
    try {
      const data = await fetchAdminFAQs();
      setFaqs(data);
    } catch (err: any) {
      setError(err?.message || "Failed to load FAQs");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFAQs();
  }, []);

  const openCreateModal = () => {
    setEditingFaq(null);
    setQuestion("");
    setAnswer("");
    setCategory("General");
    setDisplayOrder((faqs.length + 1).toString());
    setIsPublished(true);
    setIsModalOpen(true);
  };

  const openEditModal = (item: FAQ) => {
    setEditingFaq(item);
    setQuestion(item.question);
    setAnswer(item.answer);
    setCategory(item.category);
    setDisplayOrder(item.displayOrder.toString());
    setIsPublished(item.isPublished);
    setIsModalOpen(true);
  };

  const handleDelete = async (item: FAQ) => {
    if (!confirm("Are you sure you want to delete this FAQ?")) return;
    try {
      await deleteAdminFAQ(item.id);
      loadFAQs();
    } catch (err: any) {
      alert(`Deletion error: ${err?.message}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload = {
        question: question.trim(),
        answer: answer.trim(),
        category: category.trim(),
        displayOrder: parseInt(displayOrder, 10) || 0,
        isPublished,
      };

      if (editingFaq) {
        await updateAdminFAQ(editingFaq.id, payload);
      } else {
        await createAdminFAQ(payload);
      }
      setIsModalOpen(false);
      loadFAQs();
    } catch (err: any) {
      alert(`Error saving FAQ: ${err?.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-navy-950">
            Frequently Asked Questions
          </h1>
          <p className="text-xs text-mutedblue-600 mt-1">
            Manage student inquiries and admissions answers on the homepage.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="bg-navy-800 hover:bg-navy-900 text-white px-4 py-2 rounded text-xs font-semibold inline-flex items-center gap-1.5 shadow-sm"
        >
          <Plus className="w-3.5 h-3.5 text-amber-400" />
          <span>Add New FAQ</span>
        </button>
      </div>

      <div className="space-y-3">
        {faqs.map((faq) => (
          <div
            key={faq.id}
            className="bg-white p-5 rounded border border-navy-100 shadow-sm flex items-start justify-between gap-4"
          >
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-paper-200 text-navy-800 uppercase">
                  {faq.category}
                </span>
                {!faq.isPublished && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700">
                    Draft
                  </span>
                )}
              </div>
              <h3 className="font-bold text-navy-950 text-sm">{faq.question}</h3>
              <p className="text-xs text-mutedblue-700 leading-relaxed">{faq.answer}</p>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                type="button"
                onClick={() => openEditModal(faq)}
                className="p-1.5 rounded text-navy-800 hover:bg-paper-200 border border-navy-200"
              >
                <Edit className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleDelete(faq)}
                className="p-1.5 rounded text-red-600 hover:bg-red-50 border border-red-200"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm">
          <div className="bg-white rounded border border-navy-200 shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-navy-100 pb-2">
              <h3 className="text-base font-bold text-navy-950">
                {editingFaq ? "Edit FAQ" : "New FAQ"}
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
              <div className="space-y-1">
                <label className="font-bold text-navy-900 uppercase block">Question *</label>
                <input
                  type="text"
                  required
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-paper-100 border border-navy-200"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-navy-900 uppercase block">Answer *</label>
                <textarea
                  rows={4}
                  required
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-paper-100 border border-navy-200 resize-y"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-navy-900 uppercase block">Category</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded bg-paper-100 border border-navy-200"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-navy-900 uppercase block">Display Order</label>
                  <input
                    type="number"
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(e.target.value)}
                    className="w-full px-3 py-2 rounded bg-paper-100 border border-navy-200"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 pt-2 font-semibold text-navy-900 cursor-pointer">
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
                  {isSaving ? "Saving..." : "Save FAQ"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

