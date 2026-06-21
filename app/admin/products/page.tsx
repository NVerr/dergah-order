"use client";

import { useEffect, useState } from "react";

type Category = {
  id: string;
  name: string;
};

type Topping = {
  id: string;
  name: string;
  price: number;
};

type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  active: boolean;
  availableDays: string | null;
  category: Category;
  toppings: Topping[];
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

function formatDays(availableDays: string | null): string {
  if (!availableDays) return "Her gün";
  const selected = availableDays.split(",");
  return WEEKDAYS.filter((d) => selected.includes(d.value))
    .map((d) => d.label)
    .join(", ");
}

export default function ProductsPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [selectedDays, setSelectedDays] = useState<string[]>([]);

  const [expandedProductId, setExpandedProductId] = useState<string | null>(
    null
  );
  const [toppingName, setToppingName] = useState("");
  const [toppingPrice, setToppingPrice] = useState("");

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
        availableDays: selectedDays,
      }),
    });

    setName("");
    setDescription("");
    setPrice("");
    setSelectedDays([]);

    await loadData();
  }

  async function deleteProduct(productId: string) {
    if (!confirm("Bu ürünü silmek istediğinize emin misiniz?")) return;
    await fetch(`/api/products/${productId}`, { method: "DELETE" });
    await loadData();
  }

  function toggleDay(day: string) {
    setSelectedDays((current) =>
      current.includes(day)
        ? current.filter((d) => d !== day)
        : [...current, day]
    );
  }

  async function addTopping(productId: string, e: React.FormEvent) {
    e.preventDefault();
    if (!toppingName.trim()) return;

    await fetch("/api/toppings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: toppingName,
        price: toppingPrice || 0,
        productId,
      }),
    });

    setToppingName("");
    setToppingPrice("");
    await loadData();
  }

  async function deleteTopping(toppingId: string) {
    await fetch(`/api/toppings/${toppingId}`, { method: "DELETE" });
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
        Yönetim
      </a>

      <h1 className="text-2xl font-semibold mb-6">Ürünler</h1>

      <form
        onSubmit={createProduct}
        className="bg-surface rounded-2xl p-6 mb-10 grid gap-3 max-w-xl"
      >
        <input
          className="bg-surface-raised rounded-xl px-4 py-3 text-sm placeholder:text-text-muted outline-none focus:ring-2 focus:ring-menzil-green"
          placeholder="Ürün adı"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <textarea
          className="bg-surface-raised rounded-xl px-4 py-3 text-sm placeholder:text-text-muted outline-none focus:ring-2 focus:ring-menzil-green resize-none"
          placeholder="Açıklama (isteğe bağlı)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
        />

        <input
          className="bg-surface-raised rounded-xl px-4 py-3 text-sm placeholder:text-text-muted outline-none focus:ring-2 focus:ring-menzil-green"
          placeholder="Fiyat, örn. 5.50"
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

        <div>
          <div className="text-xs text-text-muted mb-2">
            Hangi günler (boş bırakılırsa her gün)
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {WEEKDAYS.map((day) => {
              const isSelected = selectedDays.includes(day.value);
              return (
                <button
                  type="button"
                  key={day.value}
                  onClick={() => toggleDay(day.value)}
                  className={`px-3.5 py-2 rounded-lg text-xs font-medium ${
                    isSelected
                      ? "bg-menzil-green text-menzil-green-deep"
                      : "bg-surface-raised text-text-muted"
                  }`}
                >
                  {day.label}
                </button>
              );
            })}
          </div>
        </div>

        <button className="bg-menzil-green text-menzil-green-deep font-semibold text-sm rounded-xl py-3 mt-1">
          Ürünü kaydet
        </button>
      </form>

      <div className="grid gap-3 max-w-xl">
        {products.length === 0 && (
          <p className="text-sm text-text-muted">
            Henüz ürün eklenmedi.
          </p>
        )}

        {products.map((product) => {
          const isExpanded = expandedProductId === product.id;

          return (
            <div key={product.id} className="bg-surface rounded-xl p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-base font-medium">{product.name}</div>
                  <div className="text-xs text-text-muted mt-0.5">
                    {product.category.name} · {formatDays(product.availableDays)}
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-base font-semibold text-rose">
                    {product.price.toFixed(2)} €
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteProduct(product.id)}
                    className="text-text-muted hover:text-rose"
                    aria-label="Ürünü sil"
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

              {product.description && (
                <div className="text-sm text-text-muted mt-2">
                  {product.description}
                </div>
              )}

              <button
                type="button"
                onClick={() =>
                  setExpandedProductId(isExpanded ? null : product.id)
                }
                className="text-xs text-gold mt-3 font-medium"
              >
                {isExpanded
                  ? "Ek malzemeleri gizle"
                  : `Ek malzemeleri yönet (${product.toppings.length})`}
              </button>

              {isExpanded && (
                <div className="mt-3 pt-3 border-t border-border">
                  {product.toppings.length === 0 && (
                    <p className="text-xs text-text-muted mb-3">
                      Henüz ek malzeme yok.
                    </p>
                  )}

                  <div className="space-y-1.5 mb-3">
                    {product.toppings.map((topping) => (
                      <div
                        key={topping.id}
                        className="flex items-center justify-between bg-surface-raised rounded-lg px-3 py-2"
                      >
                        <span className="text-sm">{topping.name}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-text-muted">
                            {topping.price > 0
                              ? `+${topping.price.toFixed(2)} €`
                              : "ücretsiz"}
                          </span>
                          <button
                            type="button"
                            onClick={() => deleteTopping(topping.id)}
                            className="text-text-muted hover:text-rose"
                            aria-label="Ek malzemeyi sil"
                          >
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                            >
                              <path d="M18 6 6 18M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <form
                    onSubmit={(e) => addTopping(product.id, e)}
                    className="flex gap-2"
                  >
                    <input
                      className="bg-surface-raised rounded-lg px-3 py-2 text-sm flex-1 outline-none focus:ring-2 focus:ring-menzil-green"
                      placeholder="Ek malzeme, örn. Ekstra Peynir"
                      value={toppingName}
                      onChange={(e) => setToppingName(e.target.value)}
                    />
                    <input
                      className="bg-surface-raised rounded-lg px-3 py-2 text-sm w-24 outline-none focus:ring-2 focus:ring-menzil-green"
                      placeholder="0.00"
                      value={toppingPrice}
                      onChange={(e) => setToppingPrice(e.target.value)}
                    />
                    <button className="bg-gold text-[#3a2c0f] font-semibold text-sm rounded-lg px-4">
                      +
                    </button>
                  </form>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}
