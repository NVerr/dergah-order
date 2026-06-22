import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();

  const availableDays: string[] | undefined = body.availableDays;

  const product = await prisma.product.update({
    where: { id },
    data: {
      name: body.name,
      description: body.description || null,
      price: Number(body.price),
      categoryId: body.categoryId,
      image: body.image ?? undefined,
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

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Produkte werden nicht hart gelöscht, sondern deaktiviert – sonst
  // würden vergangene Bestellungen, die auf dieses Produkt verweisen,
  // ihre Datengrundlage verlieren.
  await prisma.product.update({
    where: { id },
    data: { active: false },
  });

  return Response.json({ ok: true });
}
