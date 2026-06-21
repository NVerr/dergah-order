"use client";

import Image from "next/image";
import { useState } from "react";

type Category = {
  id: string;
  name: string;
};

type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: Category;
};

type CartItem = Product & {
  quantity: number;
};

export default function OrderClient({
  initialProducts,
}: {
  initialProducts: Product[];
}) {
  const [products] = useState<Product[]>(initialProducts);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderNumber, setOrderNumber] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = Array.from(
    new Map(products.map((p) => [p.category.id, p.category])).values()
  );

  const [activeCategory, setActiveCategory] = useState<string | null>(
    categories[0]?.id ?? null
  );

  function addToCart(product: Product) {
    setCart((current) => {
      const existing = current.find((item) => item.id === product.id);

      if (existing) {
        return current.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...current, { ...product, quantity: 1 }];
    });
  }

  function removeFromCart(productId: string) {
    setCart((current) =>
      current
        .map((item) =>
          item.id === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const totalItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  async function submitOrder() {
    if (cart.length === 0 || isSubmitting) return;

    setIsSubmitting(true);

    const res = await fetch("/api/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        items: cart.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
        })),
      }),
    });

    const data = await res.json();

    setIsSubmitting(false);

    if (!res.ok) {
      alert("Bestellung konnte nicht gespeichert werden.");
      return;
    }

    setOrderNumber(data.orderNumber);
    setCart([]);
  }

  if (orderNumber) {
    return (
      <main className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center text-center p-8">
        <div className="w-20 h-20 rounded-full bg-menzil-green/15 flex items-center justify-center mb-8">
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-menzil-green"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>

        <p className="text-2xl text-text-muted mb-3">Bestellung aufgegeben</p>

        <div className="text-[180px] leading-none font-semibold mb-12 tabular-nums">
          {orderNumber}
        </div>

        <button
          onClick={() => setOrderNumber(null)}
          className="bg-menzil-green text-menzil-green-deep text-xl font-semibold rounded-2xl px-10 py-5"
        >
          Neue Bestellung
        </button>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground pb-32">
      <header className="flex items-center gap-3 px-6 pt-6">
        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center overflow-hidden shrink-0 relative">
          <Image
            src="/logo.png"
            alt="Logo Duisburg-Menzil e.V."
            fill
            sizes="48px"
            className="object-cover"
          />
        </div>
        <div>
          <h1 className="text-lg font-semibold leading-tight">
            Duisburg-Menzil
          </h1>
          <p className="text-sm text-text-muted leading-tight">Bestellung</p>
        </div>
      </header>

      <nav className="flex gap-2.5 px-6 pt-5 pb-1 overflow-x-auto [scrollbar-width:none]">
        {categories.map((category) => {
          const isActive = category.id === activeCategory;
          return (
            <button
              key={category.id}
              type="button"
              onClick={() => setActiveCategory(category.id)}
              className={`px-4.5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                isActive
                  ? "bg-menzil-green text-menzil-green-deep"
                  : "bg-surface text-text-muted"
              }`}
            >
              {category.name}
            </button>
          );
        })}
      </nav>

      <section className="px-6 pt-5 grid grid-cols-2 gap-3.5">
        {products
          .filter((p) => p.category.id === activeCategory)
          .map((product) => (
            <button
              type="button"
              key={product.id}
              onClick={() => addToCart(product)}
              className="bg-surface rounded-2xl overflow-hidden text-left active:scale-[0.97] transition-transform"
            >
              <div className="aspect-[6/5] bg-surface-raised flex flex-col items-center justify-center gap-1.5 border-b border-border">
                <svg
                  width="26"
                  height="26"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  className="text-text-muted/60"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="9" cy="9" r="2" />
                  <path d="m21 15-5-5L5 21" />
                </svg>
                <span className="text-[11px] text-text-muted/70">
                  Foto folgt
                </span>
              </div>

              <div className="p-3.5">
                <div className="text-base font-medium leading-snug">
                  {product.name}
                </div>
                {product.description && (
                  <div className="text-xs text-text-muted mt-0.5 line-clamp-2">
                    {product.description}
                  </div>
                )}

                <div className="flex items-center justify-between mt-3">
                  <span className="text-base font-semibold text-rose">
                    {product.price.toFixed(2)} €
                  </span>
                  <span className="w-8 h-8 rounded-[10px] bg-menzil-green text-menzil-green-deep flex items-center justify-center text-lg font-semibold leading-none">
                    +
                  </span>
                </div>
              </div>
            </button>
          ))}
      </section>

      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-3.5 bg-gradient-to-t from-background via-background/95 to-transparent pt-8">
          <div className="bg-surface rounded-2xl p-4 max-w-2xl mx-auto">
            <div className="max-h-40 overflow-y-auto space-y-3 mb-3">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">
                      {item.name}
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.id)}
                      className="w-7 h-7 rounded-lg bg-surface-raised flex items-center justify-center text-base leading-none"
                    >
                      −
                    </button>
                    <span className="text-sm font-medium w-4 text-center tabular-nums">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => addToCart(item)}
                      className="w-7 h-7 rounded-lg bg-surface-raised flex items-center justify-center text-base leading-none"
                    >
                      +
                    </button>
                  </div>

                  <span className="text-sm font-medium w-16 text-right tabular-nums shrink-0">
                    {(item.price * item.quantity).toFixed(2)} €
                  </span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between gap-3 pt-3 border-t border-border">
              <div>
                <div className="text-xs text-text-muted">
                  {totalItemCount} Artikel
                </div>
                <div className="text-lg font-semibold tabular-nums">
                  {total.toFixed(2)} €
                </div>
              </div>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={submitOrder}
                className="bg-menzil-green text-menzil-green-deep font-semibold text-sm rounded-xl px-7 py-3.5 disabled:opacity-50"
              >
                {isSubmitting ? "Wird gespeichert…" : "Bestellung aufgeben"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
