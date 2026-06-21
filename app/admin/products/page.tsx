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
    <main className="max-w-5xl mx-auto p-10">
      <h1 className="text-4xl font-bold mb-8">Produkte</h1>

      <form onSubmit={createProduct} className="border rounded-2xl p-6 mb-10 grid gap-4">
        <input
          className="border p-4 rounded-xl"
          placeholder="Produktname"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <textarea
          className="border p-4 rounded-xl"
          placeholder="Beschreibung optional"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <input
          className="border p-4 rounded-xl"
          placeholder="Preis z. B. 5.50"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />

        <select
          className="border p-4 rounded-xl"
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

        <button className="bg-black text-white rounded-xl p-4">
          Produkt speichern
        </button>
      </form>

      <div className="grid gap-4">
        {products.map((product) => (
          <div key={product.id} className="border rounded-xl p-5">
            <div className="text-2xl font-bold">{product.name}</div>
            <div>{product.category.name}</div>
            <div>{product.price.toFixed(2)} €</div>
            {product.description && (
              <div className="text-gray-500">{product.description}</div>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}