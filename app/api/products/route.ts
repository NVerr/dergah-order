import { prisma } from "@/lib/prisma";

export async function GET() {
  const products = await prisma.product.findMany({
    where: { active: true },
    include: {
      category: true,
      toppings: {
        where: { active: true },
        orderBy: { sortOrder: "asc" },
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  return Response.json(products);
}

export async function POST(req: Request) {
  const body = await req.json();

  // availableDays kommt als Array von Wochentagen (z. B. ["TUESDAY"])
  // oder leer/fehlend für "jeden Tag verfügbar".
  const availableDays: string[] | undefined = body.availableDays;

  const product = await prisma.product.create({
    data: {
      name: body.name,
      description: body.description || null,
      price: Number(body.price),
      categoryId: body.categoryId,
      active: true,
      availableDays:
        availableDays && availableDays.length > 0
          ? availableDays.join(",")
          : null,
    },
    include: {
      category: true,
      toppings: true,
    },
  });

  return Response.json(product);
}