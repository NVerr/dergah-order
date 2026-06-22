"use client";

import Image from "next/image";

export async function uploadImage(
  file: File
): Promise<{ url?: string; error?: string }> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    return { error: data?.error ?? "Fotoğraf yüklenemedi." };
  }

  return { url: data.url };
}

export default function ImagePicker({
  inputId,
  imageUrl,
  isUploading,
  error,
  aspect = "aspect-[16/9]",
  onFileSelected,
}: {
  inputId: string;
  imageUrl: string | null;
  isUploading: boolean;
  error: string | null;
  aspect?: string;
  onFileSelected: (file: File) => void;
}) {
  return (
    <div>
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFileSelected(file);
        }}
        className="hidden"
        id={inputId}
      />
      <label
        htmlFor={inputId}
        className={`block ${aspect} rounded-xl bg-surface-raised border border-dashed border-border overflow-hidden cursor-pointer relative`}
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt=""
            fill
            sizes="400px"
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 text-text-muted">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="9" cy="9" r="2" />
              <path d="m21 15-5-5L5 21" />
            </svg>
            <span className="text-xs">
              {isUploading ? "Yükleniyor…" : "Fotoğraf ekle"}
            </span>
          </div>
        )}
        {imageUrl && isUploading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-xs text-white">
            Yükleniyor…
          </div>
        )}
      </label>
      {error && <p className="text-xs text-rose mt-2">{error}</p>}
    </div>
  );
}
