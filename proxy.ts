import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

// Both the apex domain and "www" show the personal portfolio at "/" — the
// actual Fluenta product lives at "/fluenta" instead (aliased below), so
// every other real path (/chat, /login, /admin, ...) is completely
// unaffected and keeps working exactly as it always has.
const PORTFOLIO_HOSTS = new Set(["fluenta.website", "www.fluenta.website"]);
const FLUENTA_ALIAS = "/fluenta";

export default async function proxy(req: NextRequest) {
  const host = req.headers.get("host") || "";
  const isPortfolioHost = PORTFOLIO_HOSTS.has(host);
  const { pathname } = req.nextUrl;

  if (isPortfolioHost && pathname === "/") {
    const url = req.nextUrl.clone();
    url.pathname = "/roshan";
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-portfolio-shell", "1");
    return NextResponse.rewrite(url, { request: { headers: requestHeaders } });
  }

  // "/fluenta" (and anything under it) is an alias for the app's real,
  // unprefixed routes — /fluenta -> /, /fluenta/chat -> /chat, etc. The
  // auth logic below runs against this real path, not the external one.
  const isFluentaAlias =
    isPortfolioHost &&
    (pathname === FLUENTA_ALIAS || pathname.startsWith(FLUENTA_ALIAS + "/"));
  const realPathname = isFluentaAlias
    ? pathname.slice(FLUENTA_ALIAS.length) || "/"
    : pathname;

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
  const isAdminRoute = realPathname.startsWith("/admin");
  const isProtected =
    realPathname.startsWith("/dashboard") ||
    realPathname.startsWith("/chat") ||
    isAdminRoute;

  if (isProtected && !isLoggedIn) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", realPathname);
    return NextResponse.redirect(loginUrl);
  }

  if (realPathname === "/" && isLoggedIn) {
    return NextResponse.redirect(new URL("/chat", req.nextUrl.origin));
  }

  if (isAdminRoute && token?.role !== "admin") {
    return NextResponse.redirect(new URL("/chat", req.nextUrl.origin));
  }

  if (isFluentaAlias) {
    const url = req.nextUrl.clone();
    url.pathname = realPathname;
    return NextResponse.rewrite(url);
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/auth).*)"],
};
