"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    setIsSubmitting(false);

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Giriş başarısız.");
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
      <form
        onSubmit={handleSubmit}
        className="bg-surface rounded-2xl p-8 w-full max-w-sm"
      >
        <a
          href="/"
          className="text-sm text-text-muted hover:text-foreground inline-flex items-center gap-1.5 mb-5"
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
          Sipariş sayfası
        </a>

        <h1 className="text-xl font-semibold mb-1">Yönetim</h1>
        <p className="text-sm text-text-muted mb-6">
          Lütfen şifrenizi girin.
        </p>

        <input
          type="password"
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="bg-surface-raised rounded-xl px-4 py-3 w-full text-sm outline-none focus:ring-2 focus:ring-menzil-green mb-3"
          placeholder="Şifre"
        />

        {error && <p className="text-sm text-rose mb-3">{error}</p>}

        <button
          type="submit"
          disabled={isSubmitting || password.length === 0}
          className="bg-menzil-green text-menzil-green-deep font-semibold text-sm rounded-xl py-3 w-full disabled:opacity-50"
        >
          {isSubmitting ? "Kontrol ediliyor…" : "Giriş yap"}
        </button>
      </form>
    </main>
  );
}
