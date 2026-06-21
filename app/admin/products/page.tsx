"use client";

import { useEffect, useState } from "react";

type Category = {
  id: string;
  name: string;
};

type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  active: boolean;
  category: Category;
};

export default function ProductsPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");

  async function loadData() {
    const catRes = await fetch("/api/categories");
    const prodRes = await fetch("/api/products");

    const catData = await catRes.json();
    const prodData = await prodRes.json();

    setCategories(catData);
    setProducts(prodData);

    if (!categoryId && catData.length > 0) {
      setCategoryId(catData[0].id);
    }
  }

  async function createProduct(e: React.FormEvent) {
    e.preventDefault();

    await fetch("/api/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        description,
        price,
        categoryId,
      }),
    });

    setName("");
    setDescription("");
    setPrice("");

    await loadData();
  }

  useEffect(() => {
    loadData();
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
        Verwaltung
      </a>

      <h1 className="text-2xl font-semibold mb-6">Produkte</h1>

      <form
        onSubmit={createProduct}
        className="bg-surface rounded-2xl p-6 mb-10 grid gap-3 max-w-xl"
      >
        <input
          className="bg-surface-raised rounded-xl px-4 py-3 text-sm placeholder:text-text-muted outline-none focus:ring-2 focus:ring-menzil-green"
          placeholder="Produktname"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <textarea
          className="bg-surface-raised rounded-xl px-4 py-3 text-sm placeholder:text-text-muted outline-none focus:ring-2 focus:ring-menzil-green resize-none"
          placeholder="Beschreibung (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
        />

        <input
          className="bg-surface-raised rounded-xl px-4 py-3 text-sm placeholder:text-text-muted outline-none focus:ring-2 focus:ring-menzil-green"
          placeholder="Preis, z. B. 5.50"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />

        <select
          className="bg-surface-raised rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-menzil-green"
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

        <button className="bg-menzil-green text-menzil-green-deep font-semibold text-sm rounded-xl py-3 mt-1">
          Produkt speichern
        </button>
      </form>

      <div className="grid gap-3 max-w-xl">
        {products.length === 0 && (
          <p className="text-sm text-text-muted">
            Noch keine Produkte angelegt.
          </p>
        )}

        {products.map((product) => (
          <div key={product.id} className="bg-surface rounded-xl p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-base font-medium">{product.name}</div>
                <div className="text-xs text-text-muted mt-0.5">
                  {product.category.name}
                </div>
              </div>
              <div className="text-base font-semibold text-rose shrink-0">
                {product.price.toFixed(2)} €
              </div>
            </div>
            {product.description && (
              <div className="text-sm text-text-muted mt-2">
                {product.description}
              </div>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}
