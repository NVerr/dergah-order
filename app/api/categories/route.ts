import { prisma } from "@/lib/prisma";

export async function GET() {
  const categories = await prisma.category.findMany({
    orderBy: {
      sortOrder: "asc",
    },
  });

  return Response.json(categories);
}

export async function POST(req: Request) {
  const body = await req.json();

  const category = await prisma.category.create({
    data: {
      name: body.name,
      sortOrder: 0,
    },
  });

  return Response.json(category);
}