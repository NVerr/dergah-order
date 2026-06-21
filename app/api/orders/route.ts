import { prisma } from "@/lib/prisma";
import { printOrder } from "@/lib/printer";

type SelectedTopping = {
  name: string;
  price: number;
};

export async function POST(req: Request) {
  const body = await req.json();

  const items = body.items as {
    productId: string;
    quantity: number;
    toppings?: SelectedTopping[];
  }[];

  if (!items || items.length === 0) {
    return Response.json({ error: "Ürün seçilmedi." }, { status: 400 });
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
    const product = products.find((p: { id: string }) => p.id === item.productId);

    if (!product) {
      throw new Error("Ürün bulunamadı.");
    }

    const toppings = item.toppings ?? [];
    const toppingsTotal = toppings.reduce((sum, t) => sum + t.price, 0);

    return {
      productId: product.id,
      name: product.name,
      price: product.price + toppingsTotal,
      quantity: item.quantity,
      toppings: toppings.length > 0 ? JSON.stringify(toppings) : null,
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

  // Druck im Hintergrund anstoßen: der Besucher soll nicht auf den
  // Druckvorgang warten müssen, und ein Druckfehler darf die Bestellung
  // (die bereits sicher in der Datenbank liegt) nicht gefährden.
  printOrder({
    orderNumber: order.orderNumber,
    items: order.items.map(
      (item: { name: string; quantity: number; toppings: string | null }) => ({
        name: item.name,
        quantity: item.quantity,
        toppings: item.toppings
          ? (JSON.parse(item.toppings) as SelectedTopping[]).map((t) => t.name)
          : [],
      })
    ),
  }).catch((error) => {
    console.error("[orders] Unerwarteter Fehler beim Druck:", error);
  });

  return Response.json(order);
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const statusParam = searchParams.get("status");
  const statuses = statusParam ? statusParam.split(",") : null;

  const orders = await prisma.order.findMany({
    where: statuses ? { status: { in: statuses } } : undefined,
    include: {
      items: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  return Response.json(orders);
}