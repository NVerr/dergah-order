"use client";

import { useEffect, useState, useCallback } from "react";

type Order = {
  id: string;
  orderNumber: number;
  status: string;
  updatedAt: string;
};

const POLL_INTERVAL_MS = 3000;
const MAX_VISIBLE = 6;
const HIDE_AFTER_MS = 2 * 60 * 1000; // 2 Minuten

export default function DisplayPage() {
  const [readyOrders, setReadyOrders] = useState<Order[]>([]);

  const fetchDone = useCallback(async () => {
    try {
      const res = await fetch("/api/orders?status=DONE");
      if (!res.ok) return;
      const data: Order[] = await res.json();

      // Nur Bestellungen behalten, die innerhalb der letzten 2 Minuten
      // fertig wurden – ältere sollen nicht mehr auftauchen.
      const cutoff = Date.now() - HIDE_AFTER_MS;
      const recent = data.filter(
        (order) => new Date(order.updatedAt).getTime() > cutoff
      );

      // Neueste zuerst, maximal MAX_VISIBLE Stück.
      recent.sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );

      setReadyOrders(recent.slice(0, MAX_VISIBLE));
    } catch {
      // Bei Netzwerkfehlern bleibt einfach der letzte Stand sichtbar.
    }
  }, []);

  useEffect(() => {
    fetchDone();
    const interval = setInterval(fetchDone, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchDone]);

  const [newest, ...older] = readyOrders;

  return (
    <main className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center p-8">
      <p className="text-3xl md:text-4xl text-neutral-400 font-bold mb-6 tracking-wide">
        Bitte abholen
      </p>

      {!newest && (
        <p className="text-3xl text-neutral-600">
          Noch keine Bestellung bereit.
        </p>
      )}

      {newest && (
        <div className="text-[220px] md:text-[260px] font-black leading-none mb-12">
          {newest.orderNumber}
        </div>
      )}

      {older.length > 0 && (
        <div className="flex flex-wrap justify-center gap-6">
          {older.map((order) => (
            <div
              key={order.id}
              className="text-7xl font-bold text-neutral-500"
            >
              {order.orderNumber}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
