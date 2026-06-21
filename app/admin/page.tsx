export default function AdminPage() {
  return (
    <main className="min-h-screen p-10">
      <h1 className="text-5xl font-bold mb-10">
        Dergah Verwaltung
      </h1>

      <div className="grid grid-cols-2 gap-6">

        <a
          href="/admin/categories"
          className="border rounded-3xl p-10 text-3xl shadow"
        >
          Kategorien
        </a>

        <a
          href="/admin/products"
          className="border rounded-3xl p-10 text-3xl shadow"
        >
          Produkte
        </a>

      </div>

    </main>
  );
}