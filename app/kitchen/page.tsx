"use client";

import { useEffect, useState, useCallback } from "react";

type OrderItem = {
  id: string;
  name: string;
  quantity: number;
};

type Order = {
  id: string;
  orderNumber: number;
  status: string;
  items: OrderItem[];
  createdAt: string;
};

const POLL_INTERVAL_MS = 3000;
const HIDE_AFTER_DONE_MS = 5000;

export default function KitchenPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [recentlyDone, setRecentlyDone] = useState<Order[]>([]);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch("/api/orders?status=OPEN");
      if (!res.ok) return;
      const data: Order[] = await res.json();
      setOrders(data);
    } catch {
      // Bei Netzwerkfehlern bleibt einfach der letzte Stand sichtbar.
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  async function markDone(order: Order) {
    // Bestellung sofort aus der offenen Liste nehmen (optimistisch),
    // damit die Küche kein Warten auf den Server spürt.
    setOrders((current) => current.filter((o) => o.id !== order.id));
    setRecentlyDone((current) => [...current, order]);

    setTimeout(() => {
      setRecentlyDone((current) => current.filter((o) => o.id !== order.id));
    }, HIDE_AFTER_DONE_MS);

    try {
      await fetch(`/api/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "DONE" }),
      });
    } catch {
      // Falls der Server-Request fehlschlägt, holt der nächste Poll
      // die Bestellung automatisch wieder zurück in die offene Liste.
    }
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-white p-6">
      <h1 className="text-4xl font-bold mb-8">Küche</h1>

      {orders.length === 0 && (
        <p className="text-neutral-500 text-2xl">
          Keine offenen Bestellungen.
        </p>
      )}

      <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-5">
        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-white text-black rounded-3xl p-6 flex flex-col"
          >
            <div className="text-3xl font-black mb-4">
              #{order.orderNumber}
            </div>

            <ul className="space-y-2 flex-1 mb-6">
              {order.items.map((item) => (
                <li key={item.id} className="text-xl">
                  <span className="font-bold">{item.quantity}x</span>{" "}
                  {item.name}
                </li>
              ))}
            </ul>

            <button
              onClick={() => markDone(order)}
              className="bg-green-700 text-white text-xl font-bold rounded-2xl p-4"
            >
              Fertig
            </button>
          </div>
        ))}

        {recentlyDone.map((order) => (
          <div
            key={order.id}
            className="bg-green-900 text-white rounded-3xl p-6 opacity-60"
          >
            <div className="text-3xl font-black mb-2">
              #{order.orderNumber}
            </div>
            <div className="text-xl">Fertig ✓</div>
          </div>
        ))}
      </div>
    </main>
  );
}
