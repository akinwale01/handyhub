"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { User, Briefcase, Loader2 } from "lucide-react";

export default function SelectRolePage() {
  const router = useRouter();
  const params = useSearchParams();
  const { data: session, status, update } = useSession();

  const [loadingRole, setLoadingRole] = useState<"customer" | "provider" | null>(null);

  // Email source:
  // 1. Session (Google or Credentials)
  // 2. Verify-email redirect
  const email = session?.user?.email || params.get("email");

  const firstName = session?.user?.firstName || "";

  // =========================
  // Guards & auto redirects
  // =========================

  // Wait until session resolves
  useEffect(() => {
    if (status === "loading") return;

    if (!session && !email) {
      router.replace("/auth/signup");
      return;
    }

    // Only redirect if NOT already on correct path
    if (session?.user?.role) {
      const target = `/onboarding/${session.user.role}`;
      if (window.location.pathname !== target) {
        router.replace(target);
      }
    }
  }, [status, session, email, router]);

  // =========================
  // Role selection
  // =========================
  const selectRole = async (role: "customer" | "provider") => {
  if (!email || loadingRole) return;

  setLoadingRole(role);

  try {
    const res = await fetch("/api/role", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, role }),
    });

    if (!res.ok) {
      alert("Failed to save role");
      setLoadingRole(null);
      return;
    }

    await update(); // Refresh session with new role


    router.push(`/onboarding/${role}`);
  } catch {
    alert("Something went wrong");
    setLoadingRole(null);
  }
};

  // =========================
  // Loading screen
  // =========================
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <Loader2 className="animate-spin text-white" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-black via-zinc-900 to-zinc-950 px-4">
      <div className="w-full max-w-3xl bg-zinc-900/80 backdrop-blur-xl rounded-3xl p-10 shadow-2xl flex flex-col gap-10 animate-fadeIn">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-white">
            {firstName ? `Welcome,  ${firstName} ` : "Welcome "}
          </h1>
          <p className="text-zinc-400">
            Tell us how you want to use the platform
          </p>
        </div>

        {/* Role cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Customer */}
          <button
            disabled={!!loadingRole}
            onClick={() => selectRole("customer")}
            className="group rounded-2xl border border-zinc-800 bg-zinc-900 hover:bg-indigo-600/10 hover:border-indigo-500 transition-all p-8 text-left flex flex-col gap-4 disabled:opacity-50 cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                <User size={24} />
              </div>
              {loadingRole === "customer" && (
                <Loader2 className="animate-spin text-indigo-400" size={20} />
              )}
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-semibold text-white">
                I’m a Customer
              </h2>
              <p className="text-sm text-zinc-400">
                Find and connect with trusted service providers for your needs.
              </p>
            </div>
          </button>

          {/* Provider */}
          <button
            disabled={!!loadingRole}
            onClick={() => selectRole("provider")}
            className="group rounded-2xl border border-zinc-800 bg-zinc-900 hover:bg-purple-600/10 hover:border-purple-500 transition-all p-8 text-left flex flex-col gap-4 disabled:opacity-50 cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                <Briefcase size={24} />
              </div>
              {loadingRole === "provider" && (
                <Loader2 className="animate-spin text-purple-400" size={20} />
              )}
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-semibold text-white">
                I’m a Service Provider
              </h2>
              <p className="text-sm text-zinc-400">
                Offer your services, manage clients, and grow your business.
              </p>
            </div>
          </button>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-zinc-500">
          You’ll complete your profile in the next step
        </p>
      </div>
    </div>
  );
}