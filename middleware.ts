import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define protected routes
const protectedRoutes = ["/profile", "/orders", "/checkout"];
const adminBase = "/admin";
const adminLogin = "/admin/login";
const authRoutes = ["/auth/login", "/auth/signup"];

function decodeBase64Url(input: string) {
  // JWT uses base64url: -_, no padding. Convert to standard base64.
  const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  // atob is available in the Edge runtime
  return atob(padded);
}

// Simple token verification without importing the full auth lib
function verifyTokenSimple(token: string): any {
  try {
    if (!token || typeof token !== "string") return null;
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const payloadJson = decodeBase64Url(parts[1]);
    const payload = JSON.parse(payloadJson);

    if (payload?.exp && payload.exp < Date.now() / 1000) return null;
    return payload;
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const token = request.cookies.get("auth-token")?.value;
  const user = token ? verifyTokenSimple(token) : null;

  // Redirect authenticated users away from auth pages
  if (user && authRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL("/profile", request.url));
  }

  const isAdminPath = pathname.startsWith(adminBase);
  const isAdminLogin = pathname === adminLogin;
  // Protect admin routes
  if (isAdminPath && !isAdminLogin) {
    if (!user) {
      const url = new URL(adminLogin, request.url);
      url.searchParams.set("redirect", pathname + (search || ""));
      return NextResponse.redirect(url);
    }
    if (!user.is_admin) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // Protect user routes
  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    if (!user) {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|public|images).*)",
    "/admin/:path*",
    "/auth/:path*",
    "/profile",
    "/orders/:path*",
    "/checkout/:path*",
  ],
};
