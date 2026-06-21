"use client";

import Image from "next/image";
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
    <main className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-8">
      <div className="flex items-center gap-3 mb-10">
        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center overflow-hidden shrink-0 relative">
          <Image
            src="/logo.png"
            alt="Logo Duisburg-Menzil e.V."
            fill
            sizes="48px"
            className="object-cover"
          />
        </div>
        <p className="text-2xl md:text-3xl text-text-muted font-medium tracking-wide">
          Lütfen alın
        </p>
      </div>

      {!newest && (
        <p className="text-2xl text-text-muted">
          Henüz hazır sipariş yok.
        </p>
      )}

      {newest && (
        <div className="text-[220px] md:text-[260px] font-semibold leading-none mb-12 text-menzil-green tabular-nums">
          {newest.orderNumber}
        </div>
      )}

      {older.length > 0 && (
        <div className="flex flex-wrap justify-center gap-6">
          {older.map((order) => (
            <div
              key={order.id}
              className="text-6xl font-semibold text-text-muted tabular-nums"
            >
              {order.orderNumber}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
