"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import PageLoader from "../../components/PageLoader";

export default function AuthRedirectPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    // ❌ Not logged in
    if (!session?.user) {
      router.replace("/auth/login");
      return;
    }

    const { role, profileCompleted } = session.user;

    // 1️⃣ No role
    if (!role) {
      router.replace("/auth/select-role");
      return;
    }

    // 2️⃣ Not onboarded
    if (!profileCompleted) {
      router.replace(`/onboarding/${role}`);
      return;
    }

    // 3️⃣ Done
    router.replace(`/dashboard/${role}`);

  }, [session, status, router]);

  return <PageLoader />;
}