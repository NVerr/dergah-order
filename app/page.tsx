import OrderClient from "@/components/OrderClient";
import { prisma } from "@/lib/prisma";

// Diese Seite muss bei jedem Aufruf frisch aus der Datenbank lesen:
// Admin-Änderungen (neue Produkte, Toppings, Fotos) sollen sofort
// sichtbar sein, nicht erst nach einem Server-Neustart.
export const dynamic = "force-dynamic";

export default async function Page() {
  const products = await prisma.product.findMany({
    where: {
      active: true,
      category: {
        active: true,
      },
    },
    include: {
      category: true,
      toppings: {
        where: { active: true },
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  return <OrderClient initialProducts={products} />;
}