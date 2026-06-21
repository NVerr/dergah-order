import { cookies } from "next/headers";

const COOKIE_NAME = "dergah_admin";

/**
 * Prüft, ob der aktuelle Request ein gültiges Admin-Cookie mitbringt.
 * Nur in Server Components/Route Handlers nutzbar (greift auf cookies() zu).
 */
export async function isAdminAuthenticated(): Promise<boolean> {
  const correctPassword = process.env.ADMIN_PASSWORD;
  if (!correctPassword) return false;

  const cookieStore = await cookies();
  const cookie = cookieStore.get(COOKIE_NAME);

  return cookie?.value === correctPassword;
}
