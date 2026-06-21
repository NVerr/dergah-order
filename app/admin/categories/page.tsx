"use client";

import { useEffect, useState } from "react";

type Category = {
  id: string;
  name: string;
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");

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

  useEffect(() => {
    load();
  }, []);

  return (
    <main className="min-h-screen bg-background text-foreground p-8">
      <a
        href="/admin"
        className="text-sm text-text-muted hover:text-foreground inline-flex items-center gap-1.5 mb-6"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m15 18-6-6 6-6" />
        </svg>
        Yönetim
      </a>

      <h1 className="text-2xl font-semibold mb-6">Kategoriler</h1>

      <form
        onSubmit={createCategory}
        className="mb-8 flex gap-3 max-w-xl"
      >
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

      <div className="space-y-2 max-w-xl">
        {categories.length === 0 && (
          <p className="text-sm text-text-muted">
            Henüz kategori eklenmedi.
          </p>
        )}

        {categories.map((cat) => (
          <div
            key={cat.id}
            className="bg-surface rounded-xl px-4 py-3.5 text-sm font-medium"
          >
            {cat.name}
          </div>
        ))}
      </div>
    </main>
  );
}
