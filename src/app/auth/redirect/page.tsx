"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import PageLoader from "../../components/PageLoader";
export default function AuthRedirectPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status !== "authenticated" || !session?.user) return;

    const { role, onboardingStep } = session.user;

    // 1️⃣ No role selected yet
    if (!role) {
      router.replace("/auth/select-role");
      return;
    }

    // 2️⃣ Onboarding not complete
    if (onboardingStep !== "done") {
      if (role === "customer") {
        router.replace("/onboarding/customer");
      } else if (role === "provider") {
        router.replace("/onboarding/provider");
      }
      return;
    }

    // 3️⃣ Fully onboarded → dashboard
    if (role === "customer") {
      router.replace("/dashboard/customer");
    } else if (role === "provider") {
      router.replace("/dashboard/provider");
    }

  }, [session, status, router]);

  return <PageLoader />;
}