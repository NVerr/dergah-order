import { prisma } from "@/lib/prisma";

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
