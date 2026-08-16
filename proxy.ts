import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

export default async function proxy(req: NextRequest) {
  // Middleware only needs to know "logged in?" and "role?" — both live in the
  // JWT already, so decode the token directly instead of going through
  // auth()'s full session pipeline (which re-hits the database on every
  // request via the session callback). Page components still call auth()
  // for the fields they actually need.
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
    // Without this, getToken() falls back to the non-`__Secure-`-prefixed
    // cookie name — in production (always https) that's the wrong cookie,
    // and if an old non-secure cookie happens to still be sitting in the
    // browser (e.g. from testing before NEXTAUTH_URL was fixed to https),
    // it silently reads that stale session instead of the real one.
    secureCookie: process.env.NODE_ENV === "production",
  });
  const isLoggedIn = !!token;
  const { pathname } = req.nextUrl;
  const isAdminRoute = pathname.startsWith("/admin");
  const isProtected =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/chat") ||
    isAdminRoute;

  if (isProtected && !isLoggedIn) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname === "/" && isLoggedIn) {
    return NextResponse.redirect(new URL("/chat", req.nextUrl.origin));
  }

  if (isAdminRoute && token?.role !== "admin") {
    return NextResponse.redirect(new URL("/chat", req.nextUrl.origin));
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/auth).*)"],
};
