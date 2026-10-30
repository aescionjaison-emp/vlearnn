"use client";

import React, { useEffect, useState } from "react";
import { FolderTree, Plus, Edit, Trash2, RefreshCw, X, AlertCircle } from "lucide-react";
import {
  fetchAdminCategories,
  createAdminCategory,
  updateAdminCategory,
  deleteAdminCategory,
} from "@/lib/api";
import { CourseCategory } from "@/types";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CourseCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CourseCategory | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [displayOrder, setDisplayOrder] = useState("1");
  const [isSaving, setIsSaving] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const loadCategories = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchAdminCategories();
      setCategories(data);
    } catch (err: any) {
      setError(err?.message || "Failed to load categories");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const openCreateModal = () => {
    setEditingCategory(null);
    setName("");
    setSlug("");
    setDescription("");
    setDisplayOrder((categories.length + 1).toString());
    setModalError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (cat: CourseCategory) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || "");
    setDisplayOrder(cat.displayOrder.toString());
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (cat: CourseCategory) => {
    if (!confirm(`Are you sure you want to delete category "${cat.name}"?`)) return;
    try {
      await deleteAdminCategory(cat.id);
      loadCategories();
    } catch (err: any) {
      alert(`Deletion blocked: ${err?.message}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setModalError(null);
    try {
      const payload = {
        name: name.trim(),
        slug: slug.trim().toLowerCase(),
        description: description.trim() || null,
        displayOrder: parseInt(displayOrder, 10) || 0,
      };

      if (editingCategory) {
        await updateAdminCategory(editingCategory.id, payload);
      } else {
        await createAdminCategory(payload);
      }

      setIsModalOpen(false);
      loadCategories();
    } catch (err: any) {
      setModalError(err?.message || "Failed to save category");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-navy-950">
            Course Categories
          </h1>
          <p className="text-xs text-mutedblue-600 mt-1">
            Organize curricula into structured educational disciplines.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="bg-navy-800 hover:bg-navy-900 text-white px-4 py-2 rounded text-xs font-semibold inline-flex items-center gap-1.5 shadow-sm"
        >
          <Plus className="w-3.5 h-3.5 text-amber-400" />
          <span>Add New Category</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-white rounded border border-navy-100 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-navy-50 bg-paper-100 text-[11px] font-bold text-mutedblue-700 uppercase tracking-wider">
              <th className="py-3 px-5">Name & Slug</th>
              <th className="py-3 px-5">Description</th>
              <th className="py-3 px-5">Order</th>
              <th className="py-3 px-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy-50 text-xs">
            {categories.map((cat) => (
              <tr key={cat.id} className="hover:bg-paper-50 transition-colors">
                <td className="py-3.5 px-5">
                  <span className="font-bold text-navy-950 text-sm block">{cat.name}</span>
                  <span className="font-mono text-[11px] text-mutedblue-500 block">
                    {cat.slug}
                  </span>
                </td>
                <td className="py-3.5 px-5 text-mutedblue-700 max-w-md">
                  {cat.description || "—"}
                </td>
                <td className="py-3.5 px-5 font-semibold text-navy-900">{cat.displayOrder}</td>
                <td className="py-3.5 px-5 text-right space-x-2">
                  <button
                    type="button"
                    onClick={() => openEditModal(cat)}
                    className="p-1.5 rounded text-navy-800 hover:bg-paper-200 border border-navy-200"
                    title="Edit Category"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(cat)}
                    className="p-1.5 rounded text-red-600 hover:bg-red-50 border border-red-200"
                    title="Delete Category"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm">
          <div className="bg-white rounded border border-navy-200 shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-navy-100 pb-2">
              <h3 className="text-base font-bold text-navy-950">
                {editingCategory ? "Edit Category" : "New Category"}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-mutedblue-500 hover:text-navy-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {modalError && (
              <div className="p-2.5 rounded bg-red-50 text-red-800 text-xs">{modalError}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-navy-900 uppercase block">Category Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (!editingCategory) {
                      setSlug(
                        e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9]+/g, "-")
                          .replace(/(^-|-$)/g, "")
                      );
                    }
                  }}
                  className="w-full px-3 py-2 rounded bg-paper-100 border border-navy-200"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-navy-900 uppercase block">URL Slug *</label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-paper-100 border border-navy-200 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-navy-900 uppercase block">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
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

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-navy-100">
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
                  {isSaving ? "Saving..." : "Save Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

