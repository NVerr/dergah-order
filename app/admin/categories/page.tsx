"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import ImagePicker, { uploadImage } from "@/components/ImagePicker";

type Category = {
  id: string;
  name: string;
  image: string | null;
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);

  const [name, setName] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editImageUrl, setEditImageUrl] = useState<string | null>(null);
  const [editIsUploading, setEditIsUploading] = useState(false);
  const [editUploadError, setEditUploadError] = useState<string | null>(null);

  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/categories");
    const data = await res.json();
    setCategories(data);
  }

  async function handleFileSelect(file: File) {
    setUploadError(null);
    setIsUploading(true);
    const result = await uploadImage(file);
    setIsUploading(false);

    if (result.error) {
      setUploadError(result.error);
      return;
    }
    setImageUrl(result.url ?? null);
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
        image: imageUrl,
      }),
    });

    setName("");
    setImageUrl(null);
    load();
  }

  function startEditing(category: Category) {
    setDeleteError(null);
    setEditingId(category.id);
    setEditingName(category.name);
    setEditImageUrl(category.image);
    setEditUploadError(null);
  }

  function cancelEditing() {
    setEditingId(null);
  }

  async function handleEditFileSelect(file: File) {
    setEditUploadError(null);
    setEditIsUploading(true);
    const result = await uploadImage(file);
    setEditIsUploading(false);

    if (result.error) {
      setEditUploadError(result.error);
      return;
    }
    setEditImageUrl(result.url ?? null);
  }

  async function saveEditing(categoryId: string) {
    if (!editingName.trim()) return;

    await fetch(`/api/categories/${categoryId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editingName, image: editImageUrl }),
    });

    setEditingId(null);
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
      <PageHeader title="Kategoriler" backHref="/admin" backLabel="Yönetim" />

      <div className="px-6 pt-6">
        <form
          onSubmit={createCategory}
          className="bg-surface rounded-2xl p-6 mb-10 grid gap-3 max-w-xl"
        >
          <ImagePicker
            inputId="category-image-input-new"
            imageUrl={imageUrl}
            isUploading={isUploading}
            error={uploadError}
            aspect="aspect-[4/3]"
            onFileSelected={handleFileSelect}
          />

          <input
            className="bg-surface-raised rounded-xl px-4 py-3 text-sm placeholder:text-text-muted outline-none focus:ring-2 focus:ring-menzil-green"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Kategori adı"
          />

          <button
            disabled={isUploading}
            className="bg-menzil-green text-menzil-green-deep font-semibold text-sm rounded-xl py-3 disabled:opacity-50"
          >
            Kaydet
          </button>
        </form>

        {deleteError && (
          <p className="text-sm text-rose mb-4 max-w-2xl">{deleteError}</p>
        )}

        <div className="grid grid-cols-3 gap-3 max-w-2xl">
          {categories.length === 0 && (
            <p className="text-sm text-text-muted col-span-3">
              Henüz kategori eklenmedi.
            </p>
          )}

          {categories.map((cat) => {
            const isEditing = editingId === cat.id;

            if (isEditing) {
              return (
                <div
                  key={cat.id}
                  className="bg-surface rounded-2xl p-3 grid gap-2.5 border border-menzil-green/40 col-span-3"
                >
                  <ImagePicker
                    inputId={`category-image-input-edit-${cat.id}`}
                    imageUrl={editImageUrl}
                    isUploading={editIsUploading}
                    error={editUploadError}
                    aspect="aspect-[4/3]"
                    onFileSelected={handleEditFileSelect}
                  />
                  <input
                    autoFocus
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    className="bg-surface-raised rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-menzil-green"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={cancelEditing}
                      className="flex-1 bg-surface-raised text-xs font-medium rounded-lg py-2.5"
                    >
                      Vazgeç
                    </button>
                    <button
                      type="button"
                      onClick={() => saveEditing(cat.id)}
                      disabled={editIsUploading}
                      className="flex-1 bg-menzil-green text-menzil-green-deep text-xs font-semibold rounded-lg py-2.5 disabled:opacity-50"
                    >
                      Kaydet
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <div key={cat.id} className="bg-surface rounded-2xl overflow-hidden">
                <div className="aspect-[4/3] relative bg-surface-raised">
                  {cat.image ? (
                    <Image
                      src={cat.image}
                      alt={cat.name}
                      fill
                      sizes="200px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg
                        width="22"
                        height="22"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        className="text-text-muted/50"
                      >
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <circle cx="9" cy="9" r="2" />
                        <path d="m21 15-5-5L5 21" />
                      </svg>
                    </div>
                  )}
                </div>

                <div className="p-2.5">
                  <div className="text-xs font-medium truncate">
                    {cat.name}
                  </div>
                  <div className="flex items-center gap-2.5 mt-2">
                    <button
                      type="button"
                      onClick={() => startEditing(cat)}
                      className="text-text-muted hover:text-foreground"
                      aria-label="Kategoriyi düzenle"
                    >
                      <svg
                        width="14"
                        height="14"
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
                        width="14"
                        height="14"
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
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
