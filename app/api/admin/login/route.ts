import { cookies } from "next/headers";

const COOKIE_NAME = "dergah_admin";

export async function POST(req: Request) {
  const body = await req.json();
  const password = body.password as string;

  const correctPassword = process.env.ADMIN_PASSWORD;

  if (!correctPassword) {
    return Response.json(
      { error: "Sunucuda yönetici şifresi ayarlanmamış." },
      { status: 500 }
    );
  }

  if (password !== correctPassword) {
    return Response.json({ error: "Şifre yanlış." }, { status: 401 });
  }

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, correctPassword, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    // 12 Stunden – passt zu "Passwort bei jedem Besuch neu eingeben",
    // ohne dass es während eines laufenden Events erneut abläuft.
    maxAge: 60 * 60 * 12,
  });

  return Response.json({ ok: true });
}
