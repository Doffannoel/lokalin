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
    pathname.startsWith("/fonts") ||
    pathname.startsWith("/api"); // API routes tidak perlu redirect

  if (isPublicAsset) {
    return NextResponse.next();
  }

  // Cek auth token dari cookies
  const token = req.cookies.get("token");
  const isAuthenticated = !!token;

  // Public routes yang bisa diakses tanpa login
  const publicRoutes = ["/login", "/register", "/forgot"];
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Auth routes (halaman login/register)
  const isAuthRoute =
    pathname === "/login" || pathname === "/register" || pathname === "/forgot";

  // Protected routes (perlu login)
  const protectedRoutes = ["/homepage", "/community", "/event", "/calender"];
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Root path
  const isRootPath = pathname === "/";

  // ✅ Jika di root path, biarkan page.tsx yang handle redirect
  if (isRootPath) {
    return NextResponse.next();
  }

  // ✅ Jika sudah login dan mencoba akses halaman auth (login/register), redirect ke homepage
  if (isAuthenticated && isAuthRoute) {
    return NextResponse.redirect(new URL("/homepage", req.url));
  }

  // ✅ Jika belum login dan mencoba akses protected route, redirect ke login
  if (!isAuthenticated && isProtectedRoute) {
    const loginUrl = new URL("/login", req.url);
    // Optional: simpan intended URL untuk redirect setelah login
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// Config untuk matcher - tentukan path mana yang akan di-check middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, other public files
     */
    "/((?!api|_next/static|_next/image|favicon.ico|assets|images|fonts).*)",
  ],
};
