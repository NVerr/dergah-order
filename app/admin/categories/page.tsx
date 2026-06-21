"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";

type Category = {
  id: string;
  name: string;
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/categories");
    const data = await res.json();
    setCategories(data);
  }

  async function createCategory(e: React.FormEvent) {
    e.preventDefault();

    await fetch("/api/categories", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
      }),
    });

    setName("");
    load();
  }

  function startEditing(category: Category) {
    setDeleteError(null);
    setEditingId(category.id);
    setEditingName(category.name);
  }

  function cancelEditing() {
    setEditingId(null);
    setEditingName("");
  }

  async function saveEditing(categoryId: string) {
    if (!editingName.trim()) return;

    await fetch(`/api/categories/${categoryId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editingName }),
    });

    setEditingId(null);
    setEditingName("");
    await load();
  }

  async function deleteCategory(categoryId: string) {
    setDeleteError(null);
    if (!confirm("Bu kategoriyi silmek istediğinize emin misiniz?")) return;

    const res = await fetch(`/api/categories/${categoryId}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setDeleteError(data?.error ?? "Kategori silinemedi.");
      return;
    }

    await load();
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <main className="min-h-screen bg-background text-foreground pb-12">
      <PageHeader
        title="Kategoriler"
        backHref="/admin"
        backLabel="Yönetim"
      />

      <div className="px-6 pt-6">
      <form onSubmit={createCategory} className="mb-8 flex gap-3 max-w-xl">
        <input
          className="bg-surface rounded-xl px-4 py-3 flex-1 text-sm placeholder:text-text-muted outline-none focus:ring-2 focus:ring-menzil-green"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Kategori adı"
        />

        <button className="bg-menzil-green text-menzil-green-deep font-semibold text-sm px-6 rounded-xl">
          Kaydet
        </button>
      </form>

      {deleteError && (
        <p className="text-sm text-rose mb-4 max-w-xl">{deleteError}</p>
      )}

      <div className="space-y-2 max-w-xl">
        {categories.length === 0 && (
          <p className="text-sm text-text-muted">
            Henüz kategori eklenmedi.
          </p>
        )}

        {categories.map((cat) => {
          const isEditing = editingId === cat.id;

          if (isEditing) {
            return (
              <div
                key={cat.id}
                className="bg-surface rounded-xl px-4 py-3 flex items-center gap-2"
              >
                <input
                  autoFocus
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  className="bg-surface-raised rounded-lg px-3 py-2 text-sm flex-1 outline-none focus:ring-2 focus:ring-menzil-green"
                />
                <button
                  type="button"
                  onClick={() => saveEditing(cat.id)}
                  className="bg-menzil-green text-menzil-green-deep text-xs font-semibold rounded-lg px-3 py-2"
                >
                  Kaydet
                </button>
                <button
                  type="button"
                  onClick={cancelEditing}
                  className="text-text-muted text-xs font-medium px-2"
                >
                  Vazgeç
                </button>
              </div>
            );
          }

          return (
            <div
              key={cat.id}
              className="bg-surface rounded-xl px-4 py-3.5 flex items-center justify-between"
            >
              <span className="text-sm font-medium">{cat.name}</span>
              <div className="flex items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => startEditing(cat)}
                  className="text-text-muted hover:text-foreground"
                  aria-label="Kategoriyi düzenle"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => deleteCategory(cat.id)}
                  className="text-text-muted hover:text-rose"
                  aria-label="Kategoriyi sil"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6h16Z" />
                  </svg>
                </button>
              </div>
            </div>
          );
        })}
      </div>
      </div>
    </main>
  );
}
