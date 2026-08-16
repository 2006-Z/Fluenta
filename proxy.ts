import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
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

  if (isAdminRoute && req.auth?.user.role !== "admin") {
    return NextResponse.redirect(new URL("/chat", req.nextUrl.origin));
  }
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/auth).*)"],
};
