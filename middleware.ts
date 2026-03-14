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

  const authRoutes = [
    "/auth/signup",
    "/auth/login",
    "/auth/forgot-password",
    "/auth/verify-email",
  ];

  const roleSelectRoute = "/auth/select-role";

  const providerDashboard = "/dashboard/provider";
  const customerDashboard = "/dashboard/customer";

  const providerOnboarding = "/onboarding/provider";
  const customerOnboarding = "/onboarding/customer";

  const isPublicRoute = publicRoutes.includes(pathname);
  const isAuthRoute = authRoutes.includes(pathname);

  /* =========================
     0️⃣ ALLOW PUBLIC ROUTES
  ==========================*/
  if (isPublicRoute) {
    // If user already logged in, don't allow returning to auth pages
    if (token && isAuthRoute) {
      return NextResponse.redirect(new URL("/auth/redirect", req.url));
    }

    return NextResponse.next();
  }

  /* =========================
     1️⃣ NOT LOGGED IN
  ==========================*/
  if (!token) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  const role = token.role as "provider" | "customer" | null;
  const onboardingStep = token.onboardingStep;

  /* =========================
     2️⃣ ROLE NOT SELECTED
  ==========================*/
  if (!role) {
    if (pathname === roleSelectRoute) {
      return NextResponse.next();
    }

    return NextResponse.redirect(new URL(roleSelectRoute, req.url));
  }

  /* =========================
     3️⃣ ONBOARDING NOT COMPLETE
  ==========================*/
  if (onboardingStep !== "done") {
    const correctOnboarding =
      role === "provider"
        ? providerOnboarding
        : customerOnboarding;

    if (pathname === correctOnboarding) {
      return NextResponse.next();
    }

    return NextResponse.redirect(
      new URL(correctOnboarding, req.url)
    );
  }

  /* =========================
     4️⃣ ONBOARDING COMPLETE
  ==========================*/

  // Block access to select-role + onboarding once done
  if (
    pathname === roleSelectRoute ||
    pathname === providerOnboarding ||
    pathname === customerOnboarding
  ) {
    return NextResponse.redirect(
      new URL(
        role === "provider"
          ? providerDashboard
          : customerDashboard,
        req.url
      )
    );
  }

  /* =========================
     5️⃣ DASHBOARD PROTECTION
  ==========================*/
  if (pathname.startsWith("/dashboard")) {
    if (
      role === "provider" &&
      !pathname.startsWith(providerDashboard)
    ) {
      return NextResponse.redirect(
        new URL(providerDashboard, req.url)
      );
    }

    if (
      role === "customer" &&
      !pathname.startsWith(customerDashboard)
    ) {
      return NextResponse.redirect(
        new URL(customerDashboard, req.url)
      );
    }
  }

  /* =========================
     6️⃣ DEFAULT
  ==========================*/
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};