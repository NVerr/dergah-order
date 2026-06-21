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
    <main className="max-w-4xl mx-auto p-10">
      <h1 className="text-4xl font-bold mb-8">
        Kategorien
      </h1>

      <form onSubmit={createCategory} className="mb-8 flex gap-4">
        <input
          className="border p-4 rounded-xl flex-1"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Kategorie"
        />

        <button className="bg-black text-white px-8 rounded-xl">
          Speichern
        </button>
      </form>

      <div className="space-y-3">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="border rounded-xl p-5 text-xl"
          >
            {cat.name}
          </div>
        ))}
      </div>
    </main>
  );
}