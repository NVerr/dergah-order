import { prisma } from "@/lib/prisma";

export async function GET() {
  const products = await prisma.product.findMany({
    include: {
      category: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  console.log("PRODUCTS API COUNT:", products.length);

  return Response.json(products);
}

export async function POST(req: Request) {
  const body = await req.json();

  const product = await prisma.product.create({
    data: {
      name: body.name,
      description: body.description || null,
      price: Number(body.price),
      categoryId: body.categoryId,
      active: true,
    },
    include: {
      category: true,
    },
  });

  return Response.json(product);
}