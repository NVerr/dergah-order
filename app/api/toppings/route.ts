import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.json();

  const topping = await prisma.topping.create({
    data: {
      name: body.name,
      price: Number(body.price) || 0,
      productId: body.productId,
    },
  });

  return Response.json(topping);
}
