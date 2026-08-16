import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function GET(request: Request) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  const tokenSecure = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie: true,
  });
  return NextResponse.json({
    hasCookieHeader: !!request.headers.get("cookie"),
    cookieNames: (request.headers.get("cookie") ?? "")
      .split(";")
      .map((c) => c.trim().split("=")[0])
      .filter(Boolean),
    token,
    tokenSecure,
  });
}
