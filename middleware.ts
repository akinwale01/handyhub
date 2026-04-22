import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req });
  const { pathname } = req.nextUrl;

  /* =========================
     ROUTE GROUPS
  ==========================*/

  const publicRoutes = [
    "/",
    "/auth/signup",
    "/auth/login",
    "/auth/forgot-password",
    "/auth/verify-email",
  ];

  const isPublicRoute = publicRoutes.some(route =>
    pathname.startsWith(route)
  );

  /* =========================
     0️⃣ PUBLIC ROUTES
  ==========================*/
  if (isPublicRoute) {
    if (token) {
      return NextResponse.redirect(
        new URL("/auth/redirect", req.url)
      );
    }

    return NextResponse.next();
  }

  /* =========================
     1️⃣ NOT LOGGED IN
  ==========================*/
  if (!token) {
    return NextResponse.redirect(
      new URL("/auth/login", req.url)
    );
  }


  /* =========================
     3️⃣ ALLOW REDIRECT PAGE
  ==========================*/
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};