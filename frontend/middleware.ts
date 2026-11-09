import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// All routes that require authentication
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/assets",
  "/departments",
  "/users",
  "/locations",
  "/maintenance",
  "/transfers",
  "/audits",
  "/licenses",
  "/inventory",
  "/vendors",
  "/purchase-orders",
  "/reports",
  "/audit-log",
  "/settings",
];

// Routes only accessible when NOT authenticated
const AUTH_PAGES = ["/login", "/register", "/forgot-password"];

export const middleware = (req: NextRequest) => {
  // The auth store sets this cookie on login (accessToken)
  const token =
    req.cookies.get("accessToken")?.value ||
    req.cookies.get("auth-token")?.value;

  const { pathname } = req.nextUrl;

  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
  const isAuthPage = AUTH_PAGES.some((p) => pathname === p);

  // Not logged in, trying to access protected page → redirect to login
  if (isProtected && !token) {
    const url = new URL("/login", req.url);
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // Already logged in, trying to access auth pages → redirect to dashboard
  if (isAuthPage && token) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
};

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/assets/:path*",
    "/departments/:path*",
    "/users/:path*",
    "/locations/:path*",
    "/maintenance/:path*",
    "/transfers/:path*",
    "/audits/:path*",
    "/licenses/:path*",
    "/inventory/:path*",
    "/vendors/:path*",
    "/purchase-orders/:path*",
    "/reports/:path*",
    "/audit-log/:path*",
    "/settings/:path*",
    "/login",
    "/register",
    "/forgot-password",
  ],
};
