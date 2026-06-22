"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import PageHeader from "@/components/PageHeader";
import ImagePicker, { uploadImage } from "@/components/ImagePicker";

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
  image: string | null;
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
        Hangi günler (boş bırakılırsa her gün)
      </div>
      <div className="flex gap-1.5 flex-wrap">
        {WEEKDAYS.map((day) => {
          const isSelected = selectedDays.includes(day.value);
          return (
            <button
              type="button"
              key={day.value}
              onClick={() => onToggle(day.value)}
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
  );
}

export default function ProductsPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editingProductId, setEditingProductId] = useState<string | null>(
    null
  );
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editCategoryId, setEditCategoryId] = useState("");
  const [editSelectedDays, setEditSelectedDays] = useState<string[]>([]);
  const [editImageUrl, setEditImageUrl] = useState<string | null>(null);
  const [editIsUploading, setEditIsUploading] = useState(false);
  const [editUploadError, setEditUploadError] = useState<string | null>(null);

  const [expandedToppingsId, setExpandedToppingsId] = useState<string | null>(
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
        image: imageUrl,
      }),
    });

    setName("");
    setDescription("");
    setPrice("");
    setSelectedDays([]);
    setImageUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";

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

  function startEditingProduct(product: Product) {
    setExpandedToppingsId(null);
    setEditingProductId(product.id);
    setEditName(product.name);
    setEditDescription(product.description ?? "");
    setEditPrice(String(product.price));
    setEditCategoryId(product.category.id);
    setEditSelectedDays(
      product.availableDays ? product.availableDays.split(",") : []
    );
    setEditImageUrl(product.image);
    setEditUploadError(null);
  }

  function cancelEditingProduct() {
    setEditingProductId(null);
  }

  function toggleEditDay(day: string) {
    setEditSelectedDays((current) =>
      current.includes(day)
        ? current.filter((d) => d !== day)
        : [...current, day]
    );
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

  async function saveEditingProduct(e: React.FormEvent) {
    e.preventDefault();
    if (!editingProductId) return;

    await fetch(`/api/products/${editingProductId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: editName,
        description: editDescription,
        price: editPrice,
        categoryId: editCategoryId,
        availableDays: editSelectedDays,
        image: editImageUrl,
      }),
    });

    setEditingProductId(null);
    await loadData();
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
    <main className="min-h-screen bg-background text-foreground pb-12">
      <PageHeader title="Ürünler" backHref="/admin" backLabel="Yönetim" />

      <div className="px-6 pt-6">
        <form
          onSubmit={createProduct}
          className="bg-surface rounded-2xl p-6 mb-10 grid gap-3 max-w-xl"
        >
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

          <DayPicker selectedDays={selectedDays} onToggle={toggleDay} />

          <button
            disabled={isUploading}
            className="bg-menzil-green text-menzil-green-deep font-semibold text-sm rounded-xl py-3 mt-1 disabled:opacity-50"
          >
            Ürünü kaydet
          </button>
        </form>

        <div className="grid grid-cols-2 gap-3.5 max-w-2xl">
          {products.length === 0 && (
            <p className="text-sm text-text-muted col-span-2">
              Henüz ürün eklenmedi.
            </p>
          )}

          {products.map((product) => {
            const isEditing = editingProductId === product.id;
            const isToppingsExpanded = expandedToppingsId === product.id;

            if (isEditing) {
              return (
                <form
                  key={product.id}
                  onSubmit={saveEditingProduct}
                  className="bg-surface rounded-2xl p-4 grid gap-3 border border-menzil-green/40 col-span-2"
                >
                  <ImagePicker
                    inputId={`product-image-input-edit-${product.id}`}
                    imageUrl={editImageUrl}
                    isUploading={editIsUploading}
                    error={editUploadError}
                    onFileSelected={handleEditFileSelect}
                  />

                  <input
                    className="bg-surface-raised rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-menzil-green"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                  />

                  <textarea
                    className="bg-surface-raised rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-menzil-green resize-none"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    rows={2}
                    placeholder="Açıklama (isteğe bağlı)"
                  />

                  <input
                    className="bg-surface-raised rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-menzil-green"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    required
                  />

                  <select
                    className="bg-surface-raised rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-menzil-green"
                    value={editCategoryId}
                    onChange={(e) => setEditCategoryId(e.target.value)}
                    required
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>

                  <DayPicker
                    selectedDays={editSelectedDays}
                    onToggle={toggleEditDay}
                  />

                  <div className="flex gap-2 mt-1">
                    <button
                      type="button"
                      onClick={cancelEditingProduct}
                      className="flex-1 bg-surface-raised text-sm font-medium rounded-xl py-3"
                    >
                      Vazgeç
                    </button>
                    <button
                      disabled={editIsUploading}
                      className="flex-1 bg-menzil-green text-menzil-green-deep font-semibold text-sm rounded-xl py-3 disabled:opacity-50"
                    >
                      Kaydet
                    </button>
                  </div>
                </form>
              );
            }

            return (
              <div
                key={product.id}
                className={`bg-surface rounded-2xl overflow-hidden ${
                  isToppingsExpanded ? "col-span-2" : ""
                }`}
              >
                {product.image && (
                  <div className="aspect-[6/5] relative bg-surface-raised">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      sizes="(max-width: 640px) 50vw, 300px"
                      className="object-cover"
                    />
                  </div>
                )}

                <div className="p-3.5">
                  <div className="text-sm font-medium leading-snug">
                    {product.name}
                  </div>
                  <div className="text-xs text-text-muted mt-0.5">
                    {product.category.name} · {formatDays(product.availableDays)}
                  </div>

                  <div className="flex items-center justify-between mt-2.5">
                    <div className="text-sm font-semibold text-rose">
                      {product.price.toFixed(2)} €
                    </div>
                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => startEditingProduct(product)}
                        className="text-text-muted hover:text-foreground"
                        aria-label="Ürünü düzenle"
                      >
                        <svg
                          width="15"
                          height="15"
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
                        onClick={() => deleteProduct(product.id)}
                        className="text-text-muted hover:text-rose"
                        aria-label="Ürünü sil"
                      >
                        <svg
                          width="15"
                          height="15"
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
                    <div className="text-xs text-text-muted mt-2 line-clamp-2">
                      {product.description}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() =>
                      setExpandedToppingsId(
                        isToppingsExpanded ? null : product.id
                      )
                    }
                    className="text-xs text-gold mt-2.5 font-medium"
                  >
                    {isToppingsExpanded
                      ? "Gizle"
                      : `Ek malzemeler (${product.toppings.length})`}
                  </button>

                  {isToppingsExpanded && (
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
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
