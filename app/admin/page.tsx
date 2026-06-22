import PageHeader from "@/components/PageHeader";
import LogoutButton from "@/components/LogoutButton";

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-background text-foreground pb-12">
      <PageHeader
        title="Yönetim"
        subtitle="Duisburg-Menzil"
        backHref="/"
        backLabel="Sipariş sayfası"
        showLogout
      />
      
      <div className="grid grid-cols-2 gap-3.5 px-6 pt-6 max-w-2xl">
        <a
          href="/admin/categories"
          className="bg-surface rounded-2xl p-6 active:scale-[0.97] transition-transform"
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
            style={{ background: "rgba(47,158,92,0.15)" }}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#2f9e5c"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 6h16M4 12h16M4 18h7" />
            </svg>
          </div>
          <div className="text-base font-medium">Kategoriler</div>
          <div className="text-xs text-text-muted mt-1">
            Menü bölümlerini yönet
          </div>
        </a>

        <a
          href="/admin/products"
          className="bg-surface rounded-2xl p-6 active:scale-[0.97] transition-transform"
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
            style={{ background: "rgba(226,59,52,0.15)" }}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#e23b34"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="18" height="18" rx="3" />
              <path d="M9 9h6v6H9z" />
            </svg>
          </div>
          <div className="text-base font-medium">Ürünler</div>
          <div className="text-xs text-text-muted mt-1">
            Yiyecek ve içecekleri yönet
          </div>
        </a>
      </div>
    </main>
  );
}
