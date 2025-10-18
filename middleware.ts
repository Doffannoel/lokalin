import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ✅ Skip middleware untuk assets (favicon, logo, images, next static)
  const isPublicAsset =
    pathname.startsWith("/_next") ||
    pathname.startsWith("/assets") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/logo.png") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/fonts");

  if (isPublicAsset) {
    return NextResponse.next();
  }

  // Misal: cek auth token
  const isAuthenticated = req.cookies.get("token");

  if (!isAuthenticated && pathname !== "/login" && pathname !== "/register") {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}
