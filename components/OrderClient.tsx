"use client";

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

  const categories = Array.from(
    new Map(products.map((p) => [p.category.id, p.category])).values()
  );

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

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
    <main className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center text-center p-8">
      <h1 className="text-6xl font-bold mb-8">Vielen Dank!</h1>
      <p className="text-3xl mb-6">Deine Bestellnummer ist:</p>

      <div className="text-[160px] font-black leading-none mb-10">
        {orderNumber}
      </div>

      <button
        onClick={() => setOrderNumber(null)}
        className="bg-white text-black text-3xl font-bold rounded-3xl px-12 py-6"
      >
        Neue Bestellung
      </button>
    </main>
  );
}

  return (
    <main className="min-h-screen bg-neutral-950 text-white p-6">
      <h1 className="text-5xl font-bold mb-8">Dergah – Bestellung</h1>

      <div className="grid grid-cols-[1fr_380px] gap-6">
        <section className="space-y-10">
          {categories.map((category) => (
            <div key={category.id}>
              <h2 className="text-3xl font-bold mb-4">{category.name}</h2>

              <div className="grid grid-cols-2 gap-4">
                {products
                  .filter((p) => p.category.id === category.id)
                  .map((product) => (
                  <button
                    type="button"
                    key={product.id}
                    onClick={() => addToCart(product)}
                    className="bg-white text-black rounded-3xl p-8 text-left active:scale-95"
                  >
                    <div className="text-3xl font-bold">{product.name}</div>

                    {product.description && (
                      <div className="text-neutral-500 mt-2">
                        {product.description}
                      </div>
                    )}

                    <div className="text-2xl font-bold mt-6">
                      {product.price.toFixed(2)} €
                    </div>
                  </button>
                  ))}
              </div>
            </div>
          ))}
        </section>

        <aside className="bg-white text-black rounded-3xl p-6 h-fit sticky top-6">
          <h2 className="text-3xl font-bold mb-6">Warenkorb</h2>

          {cart.length === 0 && (
            <p className="text-neutral-500 text-xl">
              Noch nichts ausgewählt.
            </p>
          )}

          <div className="space-y-4">
            {cart.map((item) => (
              <div key={item.id} className="border-b pb-4">
                <div className="text-xl font-bold">{item.name}</div>

                <div className="flex items-center justify-between mt-3">
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="bg-neutral-200 rounded-xl px-4 py-2 text-xl"
                  >
                    -
                  </button>

                  <span className="text-2xl font-bold">
                    {item.quantity}x
                  </span>

                  <button
                    onClick={() => addToCart(item)}
                    className="bg-neutral-200 rounded-xl px-4 py-2 text-xl"
                  >
                    +
                  </button>
                </div>

                <div className="text-right text-xl mt-2">
                  {(item.price * item.quantity).toFixed(2)} €
                </div>
              </div>
            ))}
          </div>

          <div className="text-4xl font-bold mt-8">
            Summe: {total.toFixed(2)} €
          </div>

          <button
            disabled={cart.length === 0 || isSubmitting}
            onClick={submitOrder}
            className="mt-6 w-full bg-green-700 text-white text-2xl font-bold rounded-2xl p-5 disabled:bg-neutral-400"
          >
            {isSubmitting ? "Wird gespeichert..." : "Bestellung aufgeben"}
          </button>
        </aside>
      </div>
    </main>
  );
}