import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.json();

  const items = body.items as {
    productId: string;
    quantity: number;
  }[];

  if (!items || items.length === 0) {
    return Response.json({ error: "Keine Produkte ausgewählt." }, { status: 400 });
  }

  const products = await prisma.product.findMany({
    where: {
      id: {
        in: items.map((item) => item.productId),
      },
      active: true,
    },
  });

  const orderItems = items.map((item) => {
    const product = products.find((p) => p.id === item.productId);

    if (!product) {
      throw new Error("Produkt nicht gefunden.");
    }

    return {
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: item.quantity,
    };
  });

  const total = orderItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const lastOrder = await prisma.order.findFirst({
    orderBy: {
      orderNumber: "desc",
    },
  });

  const nextOrderNumber = lastOrder ? lastOrder.orderNumber + 1 : 1;

  const order = await prisma.order.create({
    data: {
      orderNumber: nextOrderNumber,
      total,
      status: "OPEN",
      items: {
        create: orderItems,
      },
    },
    include: {
      items: true,
    },
  });

  return Response.json(order);
}

export async function GET() {
  const orders = await prisma.order.findMany({
    include: {
      items: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return Response.json(orders);
}