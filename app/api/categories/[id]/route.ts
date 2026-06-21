import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();

  const category = await prisma.category.update({
    where: { id },
    data: {
      name: body.name,
    },
  });

  return Response.json(category);
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const activeProductCount = await prisma.product.count({
    where: { categoryId: id, active: true },
  });

  if (activeProductCount > 0) {
    return Response.json(
      {
        error:
          "Bu kategoride hâlâ ürün var. Önce ürünleri silin veya başka bir kategoriye taşıyın.",
      },
      { status: 400 }
    );
  }

  // Kategorie nicht hart löschen, sondern deaktivieren – genau wie bei
  // Produkten. Ein hartes Löschen würde an bereits deaktivierten
  // Produkten scheitern, die weiterhin per categoryId auf sie verweisen
  // (wegen vergangener Bestellungen, die diese Produkte referenzieren).
  await prisma.category.update({
    where: { id },
    data: { active: false },
  });

  return Response.json({ ok: true });
}
