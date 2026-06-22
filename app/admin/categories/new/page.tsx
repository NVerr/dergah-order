"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import ImagePicker, { uploadImage } from "@/components/ImagePicker";

export default function NewCategoryPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || isSaving) return;

    setIsSaving(true);
    await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, image: imageUrl }),
    });
    setIsSaving(false);
    router.push("/admin/categories");
  }

  return (
    <main className="min-h-screen bg-background text-foreground pb-12">
      <PageHeader
        title="Yeni Kategori"
        backHref="/admin/categories"
        backLabel="Kategoriler"
      />

      <div className="px-6 pt-6">
        <form onSubmit={handleSubmit} className="bg-surface rounded-2xl p-6 grid gap-3 max-w-xl">
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
            required
          />

          <button
            disabled={isUploading || isSaving}
            className="bg-menzil-green text-black font-semibold text-sm rounded-xl py-3 disabled:opacity-50"
          >
            {isSaving ? "Kaydediliyor..." : "Kaydet"}
          </button>
        </form>
      </div>
    </main>
  );
}
