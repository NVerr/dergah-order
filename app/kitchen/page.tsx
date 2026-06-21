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
      const res = await fetch("/api/orders?status=OPEN,IN_PROGRESS");
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

  async function updateStatus(order: Order, status: "IN_PROGRESS" | "DONE") {
    // Lokal sofort aktualisieren (optimistisch), damit die Küche
    // kein Warten auf den Server spürt.
    if (status === "DONE") {
      setOrders((current) => current.filter((o) => o.id !== order.id));
      setRecentlyDone((current) => [...current, order]);

      setTimeout(() => {
        setRecentlyDone((current) => current.filter((o) => o.id !== order.id));
      }, HIDE_AFTER_DONE_MS);
    } else {
      setOrders((current) =>
        current.map((o) => (o.id === order.id ? { ...o, status } : o))
      );
    }

    try {
      await fetch(`/api/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
    } catch {
      // Falls der Server-Request fehlschlägt, holt der nächste Poll
      // den korrekten Stand automatisch wieder zurück.
    }
  }

  const openOrders = orders.filter((o) => o.status === "OPEN");
  const inProgressOrders = orders.filter((o) => o.status === "IN_PROGRESS");

  return (
    <main className="min-h-screen bg-background text-foreground p-6">
      <h1 className="text-2xl font-semibold mb-6">Küche</h1>

      {orders.length === 0 && (
        <p className="text-text-muted text-lg">Keine offenen Bestellungen.</p>
      )}

      <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4">
        {openOrders.map((order) => (
          <div
            key={order.id}
            className="bg-surface rounded-2xl p-5 flex flex-col"
          >
            <div className="text-2xl font-semibold mb-3 tabular-nums">
              #{order.orderNumber}
            </div>

            <ul className="space-y-1.5 flex-1 mb-5 text-sm">
              {order.items.map((item) => (
                <li key={item.id}>
                  <span className="font-medium">{item.quantity}x</span>{" "}
                  <span className="text-text-muted">{item.name}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => updateStatus(order, "IN_PROGRESS")}
              className="bg-gold text-[#3a2c0f] text-sm font-semibold rounded-xl py-3"
            >
              Wird zubereitet
            </button>
          </div>
        ))}

        {inProgressOrders.map((order) => (
          <div
            key={order.id}
            className="bg-surface rounded-2xl p-5 flex flex-col border border-gold/40"
          >
            <div className="text-2xl font-semibold mb-0.5 tabular-nums">
              #{order.orderNumber}
            </div>
            <div className="text-xs font-medium text-gold mb-4 uppercase tracking-wide">
              Wird zubereitet
            </div>

            <ul className="space-y-1.5 flex-1 mb-5 text-sm">
              {order.items.map((item) => (
                <li key={item.id}>
                  <span className="font-medium">{item.quantity}x</span>{" "}
                  <span className="text-text-muted">{item.name}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => updateStatus(order, "DONE")}
              className="bg-menzil-green text-menzil-green-deep text-sm font-semibold rounded-xl py-3"
            >
              Fertig
            </button>
          </div>
        ))}

        {recentlyDone.map((order) => (
          <div
            key={order.id}
            className="bg-menzil-green-deep rounded-2xl p-5 opacity-60"
          >
            <div className="text-2xl font-semibold mb-1 tabular-nums">
              #{order.orderNumber}
            </div>
            <div className="text-sm">Fertig ✓</div>
          </div>
        ))}
      </div>
    </main>
  );
}
