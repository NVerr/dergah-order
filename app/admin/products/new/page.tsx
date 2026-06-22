"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import ImagePicker, { uploadImage } from "@/components/ImagePicker";

type Category = {
  id: string;
  name: string;
};

const WEEKDAYS: { value: string; label: string }[] = [
  { value: "MONDAY", label: "Pzt" },
  { value: "TUESDAY", label: "Sal" },
  { value: "WEDNESDAY", label: "Çar" },
  { value: "THURSDAY", label: "Per" },
  { value: "FRIDAY", label: "Cum" },
  { value: "SATURDAY", label: "Cmt" },
  { value: "SUNDAY", label: "Paz" },
];

function DayPicker({
  selectedDays,
  onToggle,
}: {
  selectedDays: string[];
  onToggle: (day: string) => void;
}) {
  return (
    <div>
      <div className="text-xs text-text-muted mb-2">
        Hangi günler? (Boş bırakılırsa her gün seçilir.)
      </div>
      <div className="flex gap-1.5 flex-wrap">
        {WEEKDAYS.map((day) => {
          const isSelected = selectedDays.includes(day.value);
          return (
            <button
              type="button"
              key={day.value}
              onClick={() => onToggle(day.value)}
              className="px-3.5 py-2 rounded-lg text-xs font-medium"
              style={{
                background: isSelected ? "#2f9e5c" : undefined,
                color: isSelected ? "#000000" : undefined,
              }}
            >
              {day.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function NewProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data: Category[]) => {
        setCategories(data);
        if (data.length > 0) setCategoryId(data[0].id);
      });
  }, []);

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

  function toggleDay(day: string) {
    setSelectedDays((current) =>
      current.includes(day) ? current.filter((d) => d !== day) : [...current, day]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isSaving) return;

    setIsSaving(true);
    await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        description,
        price,
        categoryId,
        availableDays: selectedDays,
        image: imageUrl,
      }),
    });
    setIsSaving(false);
    router.push("/admin/products");
  }

  return (
    <main className="min-h-screen bg-background text-foreground pb-12">
      <PageHeader
        title="Yeni Ürün"
        backHref="/admin/products"
        backLabel="Ürünler"
      />

      <div className="px-6 pt-6">
        <form onSubmit={handleSubmit} className="bg-surface rounded-2xl p-6 grid gap-3 max-w-xl">
          <ImagePicker
            inputId="product-image-input-new"
            imageUrl={imageUrl}
            isUploading={isUploading}
            error={uploadError}
            onFileSelected={handleFileSelect}
          />

          <input
            className="bg-surface-raised rounded-xl px-4 py-3 text-sm placeholder:text-text-muted outline-none focus:ring-2 focus:ring-menzil-green"
            placeholder="Ürün adı"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <textarea
            className="bg-surface-raised rounded-xl px-4 py-3 text-sm placeholder:text-text-muted outline-none focus:ring-2 focus:ring-menzil-green resize-none"
            placeholder="Açıklama (isteğe bağlı))"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={1}
          />

          <input
            className="bg-surface-raised rounded-xl px-4 py-3 text-sm placeholder:text-text-muted outline-none focus:ring-2 focus:ring-menzil-green"
            placeholder="Fiyat, örn. 5.50"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />

          <select
            className="bg-surface-raised rounded-xl px-4 text-sm outline-none focus:ring-2 focus:ring-menzil-green w-full"
            style={{ height: "44px" }}
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            required
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          <DayPicker selectedDays={selectedDays} onToggle={toggleDay} />

          <button
            disabled={isUploading || isSaving}
            className="bg-menzil-green text-black font-semibold text-sm rounded-xl py-3 mt-1 disabled:opacity-50"
          >
            {isSaving ? "Kaydediliyor..." : "Ürünü kaydet"}
          </button>
        </form>
      </div>
    </main>
  );
}
