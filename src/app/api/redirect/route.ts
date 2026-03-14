import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function GET(req: Request) {
  const token = await getToken({ req: req as any });

  if (!token) {
    return NextResponse.redirect(new URL("/auth/signup", req.url));
  }

  const role = token.role;
  const onboardingStep = token.onboardingStep;

  if (!role) {
    return NextResponse.redirect(new URL("/auth/select-role", req.url));
  }

  if (onboardingStep !== "done") {
    return NextResponse.redirect(
      new URL(`/onboarding/${role}`, req.url)
    );
  }

  return NextResponse.redirect(
    new URL(`/dashboard/${role}`, req.url)
  );
}