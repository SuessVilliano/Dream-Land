import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Routes that require authentication
const PROTECTED_PATHS = [
  "/dashboard",
  "/properties",
  "/map",
  "/explore",
  "/saved",
  "/calculator",
  "/sources",
];

// Routes that should redirect to dashboard if already logged in
const AUTH_PATHS = ["/login", "/signup"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET || "landscout-dev-secret-change-in-production",
  });

  // If accessing a protected route without auth → redirect to login
  const isProtected = PROTECTED_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
  if (isProtected && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If accessing login/signup while already logged in → redirect to dashboard
  const isAuthPage = AUTH_PATHS.some((p) => pathname === p);
  if (isAuthPage && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/properties/:path*",
    "/map/:path*",
    "/explore/:path*",
    "/saved/:path*",
    "/calculator/:path*",
    "/sources/:path*",
    "/login",
    "/signup",
  ],
};
