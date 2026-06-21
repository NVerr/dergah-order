"use client";

import Image from "next/image";
import { useState } from "react";

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
  image: string | null;
  category: Category;
  toppings: Topping[];
  availableDays: string | null;
};

type SelectedTopping = {
  name: string;
  price: number;
};

type CartItem = {
  // Eindeutige Warenkorb-Zeile: gleiches Produkt mit unterschiedlichen
  // Toppings sind unterschiedliche Zeilen.
  cartItemId: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  toppings: SelectedTopping[];
};

const WEEKDAY_BY_INDEX = [
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
];

function isAvailableToday(product: Product): boolean {
  if (!product.availableDays) return true;
  const today = WEEKDAY_BY_INDEX[new Date().getDay()];
  return product.availableDays.split(",").includes(today);
}

function buildCartItemId(productId: string, toppings: SelectedTopping[]) {
  const toppingKey = toppings
    .map((t) => t.name)
    .sort()
    .join("|");
  return `${productId}::${toppingKey}`;
}

export default function OrderClient({
  initialProducts,
}: {
  initialProducts: Product[];
}) {
  const [products] = useState<Product[]>(
    initialProducts.filter(isAvailableToday)
  );
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderNumber, setOrderNumber] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Produkt, für das gerade der Toppings-Auswahldialog offen ist.
  const [toppingDialogProduct, setToppingDialogProduct] =
    useState<Product | null>(null);
  const [dialogSelectedToppings, setDialogSelectedToppings] = useState<
    Set<string>
  >(new Set());

  const categories = Array.from(
    new Map(products.map((p) => [p.category.id, p.category])).values()
  );

  const [activeCategory, setActiveCategory] = useState<string | null>(
    categories[0]?.id ?? null
  );

  function addToCart(
    product: Product,
    selectedToppings: SelectedTopping[] = []
  ) {
    const cartItemId = buildCartItemId(product.id, selectedToppings);

    setCart((current) => {
      const existing = current.find((item) => item.cartItemId === cartItemId);

      if (existing) {
        return current.map((item) =>
          item.cartItemId === cartItemId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      const toppingsTotal = selectedToppings.reduce(
        (sum, t) => sum + t.price,
        0
      );

      return [
        ...current,
        {
          cartItemId,
          productId: product.id,
          name: product.name,
          price: product.price + toppingsTotal,
          quantity: 1,
          toppings: selectedToppings,
        },
      ];
    });
  }

  function handleProductTap(product: Product) {
    if (product.toppings.length === 0) {
      addToCart(product);
      return;
    }
    setToppingDialogProduct(product);
    setDialogSelectedToppings(new Set());
  }

  function confirmToppingDialog() {
    if (!toppingDialogProduct) return;

    const selected = toppingDialogProduct.toppings
      .filter((t) => dialogSelectedToppings.has(t.id))
      .map((t) => ({ name: t.name, price: t.price }));

    addToCart(toppingDialogProduct, selected);
    setToppingDialogProduct(null);
  }

  function toggleDialogTopping(toppingId: string) {
    setDialogSelectedToppings((current) => {
      const next = new Set(current);
      if (next.has(toppingId)) {
        next.delete(toppingId);
      } else {
        next.add(toppingId);
      }
      return next;
    });
  }

  function removeFromCart(cartItemId: string) {
    setCart((current) =>
      current
        .map((item) =>
          item.cartItemId === cartItemId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }

  function increment(cartItemId: string) {
    setCart((current) =>
      current.map((item) =>
        item.cartItemId === cartItemId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
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
          productId: item.productId,
          quantity: item.quantity,
          toppings: item.toppings,
        })),
      }),
    });

    const data = await res.json();

    setIsSubmitting(false);

    if (!res.ok) {
      alert("Sipariş kaydedilemedi.");
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

        <p className="text-2xl text-text-muted mb-3">Siparişiniz alındı</p>

        <div className="text-[180px] leading-none font-semibold mb-12 tabular-nums">
          {orderNumber}
        </div>

        <button
          onClick={() => setOrderNumber(null)}
          className="bg-menzil-green text-menzil-green-deep text-xl font-semibold rounded-2xl px-10 py-5"
        >
          Yeni sipariş
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
        <div className="flex-1">
          <h1 className="text-lg font-semibold leading-tight">
            Duisburg-Menzil
          </h1>
          <p className="text-sm text-text-muted leading-tight">Sipariş</p>
        </div>
        <a
          href="/admin"
          className="w-9 h-9 rounded-full bg-surface flex items-center justify-center shrink-0 text-text-muted"
          aria-label="Yönetim"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </a>
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

      {products.length === 0 && (
        <p className="px-6 pt-10 text-text-muted text-sm">
          Bugün menüde ürün bulunmuyor.
        </p>
      )}

      <section className="px-6 pt-5 grid grid-cols-2 gap-3.5">
        {products
          .filter((p) => p.category.id === activeCategory)
          .map((product) => (
            <button
              type="button"
              key={product.id}
              onClick={() => handleProductTap(product)}
              className="bg-surface rounded-2xl overflow-hidden text-left active:scale-[0.97] transition-transform"
            >
              <div className="aspect-[6/5] bg-surface-raised relative border-b border-border">
                {product.image ? (
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="(max-width: 640px) 50vw, 300px"
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5">
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
                      Fotoğraf yakında
                    </span>
                  </div>
                )}
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

      {toppingDialogProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center p-4">
          <div className="bg-surface rounded-2xl p-5 w-full max-w-sm">
            <h2 className="text-lg font-semibold mb-0.5">
              {toppingDialogProduct.name}
            </h2>
            <p className="text-xs text-text-muted mb-4">
              Ek malzeme seçin (isteğe bağlı)
            </p>

            <div className="space-y-2 mb-5 max-h-72 overflow-y-auto">
              {toppingDialogProduct.toppings.map((topping) => {
                const isChecked = dialogSelectedToppings.has(topping.id);
                return (
                  <button
                    type="button"
                    key={topping.id}
                    onClick={() => toggleDialogTopping(topping.id)}
                    className={`w-full flex items-center justify-between rounded-xl px-4 py-3 text-left ${
                      isChecked
                        ? "bg-menzil-green/15 border border-menzil-green"
                        : "bg-surface-raised border border-transparent"
                    }`}
                  >
                    <span className="text-sm font-medium">
                      {topping.name}
                    </span>
                    <span className="text-xs text-text-muted">
                      {topping.price > 0
                        ? `+${topping.price.toFixed(2)} €`
                        : "ücretsiz"}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => setToppingDialogProduct(null)}
                className="flex-1 bg-surface-raised text-sm font-medium rounded-xl py-3"
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={confirmToppingDialog}
                className="flex-1 bg-menzil-green text-menzil-green-deep text-sm font-semibold rounded-xl py-3"
              >
                Ekle
              </button>
            </div>
          </div>
        </div>
      )}

      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-3.5 bg-gradient-to-t from-background via-background/95 to-transparent pt-8">
          <div className="bg-surface rounded-2xl p-4 max-w-2xl mx-auto">
            <div className="max-h-40 overflow-y-auto space-y-3 mb-3">
              {cart.map((item) => (
                <div key={item.cartItemId} className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">
                      {item.name}
                    </div>
                    {item.toppings.length > 0 && (
                      <div className="text-xs text-text-muted truncate">
                        {item.toppings.map((t) => t.name).join(", ")}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.cartItemId)}
                      className="w-7 h-7 rounded-lg bg-surface-raised flex items-center justify-center text-base leading-none"
                    >
                      −
                    </button>
                    <span className="text-sm font-medium w-4 text-center tabular-nums">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => increment(item.cartItemId)}
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
                  {totalItemCount} ürün
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
                {isSubmitting ? "Kaydediliyor…" : "Siparişi onayla"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
