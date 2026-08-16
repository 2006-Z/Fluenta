import { getToken } from "next-auth/jwt";

/**
 * Cheap admin-role check for API routes: decodes the JWT directly instead
 * of going through auth()'s full session pipeline, which re-hits the
 * database (session callback re-fetches subscribed/preferredLanguage) on
 * every single call. Role and id already live in the JWT, so admin routes
 * never needed that DB round trip in the first place — and pages like
 * /admin/deployments fire several of these API calls per load, so the
 * saved round trip multiplies.
 */
export async function requireAdminToken(request: Request) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (token?.role !== "admin") return null;
  return token;
}
