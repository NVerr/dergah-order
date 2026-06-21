import OrderClient from "@/components/OrderClient";
import { prisma } from "@/lib/prisma";

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