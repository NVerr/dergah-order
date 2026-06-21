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

  const productCount = await prisma.product.count({
    where: { categoryId: id, active: true },
  });

  if (productCount > 0) {
    return Response.json(
      {
        error:
          "Bu kategoride hâlâ ürün var. Önce ürünleri silin veya başka bir kategoriye taşıyın.",
      },
      { status: 400 }
    );
  }

  await prisma.category.delete({
    where: { id },
  });

  return Response.json({ ok: true });
}
