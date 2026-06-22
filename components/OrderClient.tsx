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

const WEEKDAY_OPTIONS: { value: string; label: string }[] = [
  { value: "ALL", label: "Her gün" },
  { value: "MONDAY", label: "Pzt" },
  { value: "TUESDAY", label: "Sal" },
  { value: "WEDNESDAY", label: "Çar" },
  { value: "THURSDAY", label: "Per" },
  { value: "FRIDAY", label: "Cum" },
  { value: "SATURDAY", label: "Cmt" },
  { value: "SUNDAY", label: "Paz" },
];

function isAvailableOnDay(product: Product, day: string): boolean {
  if (day === "ALL") return true;
  if (!product.availableDays) return true;
  return product.availableDays.split(",").includes(day);
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
  const [products] = useState<Product[]>(initialProducts);
  const [selectedDay, setSelectedDay] = useState<string>(
    WEEKDAY_BY_INDEX[new Date().getDay()]
  );
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderNumber, setOrderNumber] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Punkt 1: Zahlungsbestätigungs-Dialog ──
  const [showPaymentConfirm, setShowPaymentConfirm] = useState(false);

  // ── Punkt 3: Hell/Dunkel-Modus ──
  const [isDark, setIsDark] = useState(true);

  const [toppingDialogProduct, setToppingDialogProduct] =
    useState<Product | null>(null);
  const [dialogSelectedToppings, setDialogSelectedToppings] = useState<
    Set<string>
  >(new Set());

  const productsForDay = products.filter((p) =>
    isAvailableOnDay(p, selectedDay)
  );

  const categories = Array.from(
    new Map(productsForDay.map((p) => [p.category.id, p.category])).values()
  );

  const [activeCategory, setActiveCategory] = useState<string | null>(
    categories[0]?.id ?? null
  );

  function handleDayChange(day: string) {
    setSelectedDay(day);
    const stillAvailable = products.some(
      (p) => isAvailableOnDay(p, day) && p.category.id === activeCategory
    );
    if (!stillAvailable) {
      const firstCategoryForDay = Array.from(
        new Map(
          products
            .filter((p) => isAvailableOnDay(p, day))
            .map((p) => [p.category.id, p.category])
        ).values()
      )[0];
      setActiveCategory(firstCategoryForDay?.id ?? null);
    }
  }

  function addToCart(product: Product, selectedToppings: SelectedTopping[] = []) {
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
      const toppingsTotal = selectedToppings.reduce((sum, t) => sum + t.price, 0);
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
      if (next.has(toppingId)) next.delete(toppingId);
      else next.add(toppingId);
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

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // ── Punkt 1: Zuerst Zahlungsdialog zeigen, dann Bestellung abschicken ──
  function handleOrderButtonClick() {
    if (cart.length === 0 || isSubmitting) return;
    setShowPaymentConfirm(true);
  }

  async function submitOrder() {
    setShowPaymentConfirm(false);
    setIsSubmitting(true);

    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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

  // ── Theme-Klassen abhängig vom Modus ──
  const themeVars = isDark
    ? {
        "--bg": "#121212",
        "--fg": "#f5f3ee",
        "--surface": "#1c1c1c",
        "--surface-raised": "#262626",
        "--text-muted": "#9a958c",
        "--border": "#2e2e2e",
      }
    : {
        "--bg": "#f5f3ee",
        "--fg": "#121212",
        "--surface": "#ffffff",
        "--surface-raised": "#ebebeb",
        "--text-muted": "#6b6560",
        "--border": "#d8d5d0",
      };

  if (orderNumber) {
    return (
      <main
        style={{
          ...(themeVars as React.CSSProperties),
          background: "var(--bg)",
          color: "var(--fg)",
          minHeight: "100vh",
        }}
        className="flex flex-col items-center justify-center text-center p-8"
      >
        <div className="w-20 h-20 rounded-full flex items-center justify-center mb-8"
          style={{ background: "rgba(47,158,92,0.15)" }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
            strokeLinejoin="round" style={{ color: "#2f9e5c" }}>
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>
        <p className="text-2xl mb-3" style={{ color: "var(--text-muted)" }}>
          Siparişiniz alındı
        </p>
        <div className="text-[180px] leading-none font-semibold mb-12 tabular-nums">
          {orderNumber}
        </div>
        <button
          onClick={() => setOrderNumber(null)}
          className="text-xl font-semibold rounded-2xl px-10 py-5"
          style={{ background: "#2f9e5c", color: "#1d4f30" }}
        >
          Yeni sipariş
        </button>
      </main>
    );
  }

  return (
    <main
      style={{
        ...(themeVars as React.CSSProperties),
        background: "var(--bg)",
        color: "var(--fg)",
        minHeight: "100vh",
        paddingBottom: "8rem",
      }}
    >
      {/* ── Header ── */}
      <header className="flex items-center gap-3 px-6 pt-6">
        <div className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden shrink-0 relative bg-white">
          <Image
            src="/logo.png"
            alt="Logo Duisburg-Menzil e.V."
            fill
            sizes="48px"
            className="object-cover"
          />
        </div>
        <div className="flex-1">
          <h1 className="text-lg font-semibold leading-tight">Duisburg-Menzil</h1>
          <p className="text-sm leading-tight" style={{ color: "var(--text-muted)" }}>
            Sipariş
          </p>
        </div>

        {/* ── Punkt 3: Hell/Dunkel Toggle ── */}
        <button
          type="button"
          onClick={() => setIsDark(!isDark)}
          className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
          style={{ background: "var(--surface)", color: "var(--text-muted)" }}
          aria-label={isDark ? "Açık tema" : "Koyu tema"}
        >
          {isDark ? (
            // Sonne
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          ) : (
            // Mond
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </button>

        <a
          href="/admin"
          className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
          style={{ background: "var(--surface)", color: "var(--text-muted)" }}
          aria-label="Yönetim"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </a>
      </header>

      {/* ── Punkt 5: Tagesbuttons größer ── */}
      <div className="flex gap-2 px-6 pt-5 overflow-x-auto [scrollbar-width:none]">
        {WEEKDAY_OPTIONS.map((day) => {
          const isActive = day.value === selectedDay;
          return (
            <button
              key={day.value}
              type="button"
              onClick={() => handleDayChange(day.value)}
              className="px-4 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors"
              style={{
                background: isActive ? "#2f9e5c" : "var(--surface)",
                // ── Punkt 2: Schriftfarbe der aktiven (grünen) Buttons schwarz ──
                color: isActive ? "#000000" : "var(--text-muted)",
              }}
            >
              {day.label}
            </button>
          );
        })}
      </div>

      {/* ── Kategorie-Navigation ── */}
      <nav className="flex gap-2.5 px-6 pt-3 pb-1 overflow-x-auto [scrollbar-width:none]">
        {categories.map((category) => {
          const isActive = category.id === activeCategory;
          return (
            <button
              key={category.id}
              type="button"
              onClick={() => setActiveCategory(category.id)}
              className="px-4.5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors"
              style={{
                background: isActive ? "#2f9e5c" : "var(--surface)",
                // ── Punkt 2: Schriftfarbe auch bei Kategorien schwarz ──
                color: isActive ? "#000000" : "var(--text-muted)",
              }}
            >
              {category.name}
            </button>
          );
        })}
      </nav>

      {productsForDay.length === 0 && (
        <p className="px-6 pt-10 text-sm" style={{ color: "var(--text-muted)" }}>
          Bu gün için menüde ürün bulunmuyor.
        </p>
      )}

      {/* ── Produkte ── */}
      <section className="px-6 pt-5 grid grid-cols-2 gap-3.5">
        {productsForDay
          .filter((p) => p.category.id === activeCategory)
          .map((product) => (
            <button
              type="button"
              key={product.id}
              onClick={() => handleProductTap(product)}
              className="rounded-2xl overflow-hidden text-left active:scale-[0.97] transition-transform"
              style={{ background: "var(--surface)" }}
            >
              <div
                className="aspect-[6/5] relative"
                style={{
                  background: "var(--surface-raised)",
                  borderBottom: "1px solid var(--border)",
                }}
              >
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
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="1.6"
                      style={{ color: "var(--text-muted)", opacity: 0.6 }}>
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <circle cx="9" cy="9" r="2" />
                      <path d="m21 15-5-5L5 21" />
                    </svg>
                    <span className="text-[11px]" style={{ color: "var(--text-muted)", opacity: 0.7 }}>
                      Fotoğraf yakında
                    </span>
                  </div>
                )}
              </div>

              <div className="p-3.5">
                <div className="text-base font-medium leading-snug">{product.name}</div>
                {product.description && (
                  <div className="text-xs mt-0.5 line-clamp-2" style={{ color: "var(--text-muted)" }}>
                    {product.description}
                  </div>
                )}
                <div className="flex items-center justify-between mt-3">
                  <span className="text-base font-semibold" style={{ color: "#e23b34" }}>
                    {product.price.toFixed(2)} €
                  </span>
                  <span
                    className="w-8 h-8 rounded-[10px] flex items-center justify-center text-lg font-semibold leading-none"
                    style={{ background: "#2f9e5c", color: "#000000" }}
                  >
                    +
                  </span>
                </div>
              </div>
            </button>
          ))}
      </section>

      {/* ── Toppings-Dialog ── */}
      {toppingDialogProduct && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.6)" }}>
          <div className="rounded-2xl p-5 w-full max-w-sm" style={{ background: "var(--surface)" }}>
            <h2 className="text-lg font-semibold mb-0.5">{toppingDialogProduct.name}</h2>
            <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>
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
                    className="w-full flex items-center justify-between rounded-xl px-4 py-3 text-left"
                    style={{
                      background: isChecked ? "rgba(47,158,92,0.15)" : "var(--surface-raised)",
                      border: isChecked ? "1px solid #2f9e5c" : "1px solid transparent",
                    }}
                  >
                    <span className="text-sm font-medium">{topping.name}</span>
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                      {topping.price > 0 ? `+${topping.price.toFixed(2)} €` : "ücretsiz"}
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="flex gap-2.5">
              <button type="button" onClick={() => setToppingDialogProduct(null)}
                className="flex-1 text-sm font-medium rounded-xl py-3"
                style={{ background: "var(--surface-raised)" }}>
                Vazgeç
              </button>
              <button type="button" onClick={confirmToppingDialog}
                className="flex-1 text-sm font-semibold rounded-xl py-3"
                style={{ background: "#2f9e5c", color: "#000000" }}>
                Ekle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Warenkorb ── */}
      {cart.length > 0 && (
        <div className="fixed bottom-5 left-0 right-0 p-3.5 pt-8"
          style={{ background: "linear-gradient(to top, var(--bg) 70%, transparent)" }}>
          <div className="rounded-2xl p-4 max-w-2xl mx-auto" style={{ background: "var(--surface)" }}>
            <div className="max-h-40 overflow-y-auto space-y-3 mb-3">
              {cart.map((item) => (
                <div key={item.cartItemId} className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{item.name}</div>
                    {item.toppings.length > 0 && (
                      <div className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
                        {item.toppings.map((t) => t.name).join(", ")}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2.5 shrink-0">
                    <button type="button" onClick={() => removeFromCart(item.cartItemId)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-base leading-none"
                      style={{ background: "var(--surface-raised)" }}>
                      −
                    </button>
                    <span className="text-sm font-medium w-4 text-center tabular-nums">
                      {item.quantity}
                    </span>
                    <button type="button" onClick={() => increment(item.cartItemId)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-base leading-none"
                      style={{ background: "var(--surface-raised)" }}>
                      +
                    </button>
                  </div>
                  <span className="text-sm font-medium w-16 text-right tabular-nums shrink-0">
                    {(item.price * item.quantity).toFixed(2)} €
                  </span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between gap-3 pt-3"
              style={{ borderTop: "1px solid var(--border)" }}>
              <div>
                <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {totalItemCount} ürün
                </div>
                <div className="text-lg font-semibold tabular-nums">{total.toFixed(2)} €</div>
              </div>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleOrderButtonClick}
                className="font-semibold text-sm rounded-xl px-7 py-3.5 disabled:opacity-50"
                style={{ background: "#2f9e5c", color: "#000000" }}
              >
                {isSubmitting ? "Kaydediliyor…" : "Siparişi onayla"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Punkt 1: Zahlungsbestätigungs-Dialog ── */}
      {showPaymentConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.7)" }}>
          <div className="rounded-2xl p-6 w-full max-w-sm text-center"
            style={{ background: "var(--surface)" }}>
            <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: "rgba(47,158,92,0.15)" }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
                stroke="#2f9e5c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
                <path d="M12 6v6l4 2" />
              </svg>
            </div>
            <h2 className="text-xl font-bold mb-2">Ödemeyi aldın mı?</h2>
            <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
              Siparişi onaylamadan önce ödemenin alındığından emin olun.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowPaymentConfirm(false)}
                className="flex-1 font-semibold rounded-xl py-3.5 text-sm"
                style={{ background: "var(--surface-raised)" }}
              >
                Hayır
              </button>
              <button
                type="button"
                onClick={submitOrder}
                className="flex-1 font-semibold rounded-xl py-3.5 text-sm"
                style={{ background: "#2f9e5c", color: "#000000" }}
              >
                Evet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Punkt 6: Footer mit Werbung ── */}
{/* ── Punkt 6: Footer mit Werbung – immer ganz unten ── */}
      <footer
        className="fixed bottom-0 left-0 right-0 text-center text-xs py-1 z-10"
        style={{ color: "var(--text-muted)", background: "var(--bg)" }}
      >
        
          <a href="https://www.rosewater-it.de"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline"
          style={{ color: "var(--text-muted)" }}
        >
          Powered by rosewater-it.de
        </a>
      </footer>
    </main>
  );
}
