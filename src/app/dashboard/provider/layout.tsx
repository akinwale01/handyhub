"use client";

import { useState } from "react";
import { SWRConfig } from "swr";

import TopNavbar from "../../components/provider/TopNav";
import BottomNav from "../../components/provider/BottomNav";
import FloatingMenu from "../../components/provider/FloatingMenu";
import Sidebar from "../../components/provider/Sidebar";
import useSWR from "swr";

/* ✅ GLOBAL FETCHER */
const fetcher = (url: string) =>
  fetch(url, {
    credentials: "include",
  }).then((res) => {
    if (!res.ok) throw new Error("Failed to fetch");
    return res.json();
  });

export default function ProviderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SWRConfig
      value={{
        fetcher,
        revalidateOnFocus: false,
        refreshInterval: 0,
      }}
    >
      <LayoutContent>{children}</LayoutContent>
    </SWRConfig>
  );
}

/* ✅ MOVE SWR HERE */
function LayoutContent({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const { data, error } = useSWR("/api/providers/analytic", {
    keepPreviousData: true,
  });

  /* 🚨 handle error (important) */
  if (error) {
    return (
      <div className="text-white p-10">
        Failed to load dashboard. Check auth or API.
      </div>
    );
  }

  /* 🦴 skeleton */
  if (!data) {
    return <FullPageSkeleton />;
  }

  /* ✅ real UI */
return (
  <div className="min-h-screen bg-[#0B1220] text-white flex ">
      <div className="hidden md:block">
        <Sidebar />
      </div>

      <div className="flex-1 relative">
        <TopNavbar />

        <main className="pt-24 pb-28 px-5 md:px-10 lg:px-16 max-w-7xl mx-auto">
          {children}
        </main>

        <div className="md:hidden">
          <BottomNav onMenuClick={() => setMenuOpen(true)} />
        </div>

        <FloatingMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
      </div>
    </div>
);
}

function FullPageSkeleton() {
  return (
    <div className="min-h-screen bg-[#0B1220] flex animate-pulse text-white">

      {/* Sidebar Skeleton */}
      <div className="hidden md:flex w-64 flex-col gap-4 p-6 bg-white/5">
        <div className="h-6 w-32 bg-white/10 rounded" />
        <div className="h-6 w-40 bg-white/10 rounded" />
        <div className="h-6 w-28 bg-white/10 rounded" />
        <div className="h-6 w-36 bg-white/10 rounded" />
      </div>

      {/* Main Area */}
      <div className="flex-1 flex flex-col">

        {/* TopNav Skeleton */}
        <div className="h-20 bg-white/5 flex items-center px-6">
          <div className="h-8 w-40 bg-white/10 rounded" />
        </div>

        {/* Content Skeleton */}
        <div className="p-6 flex flex-col gap-6">
          <div className="h-10 w-48 bg-white/10 rounded" />
          <div className="h-48 bg-white/10 rounded-3xl" />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="h-24 bg-white/10 rounded-2xl" />
            <div className="h-24 bg-white/10 rounded-2xl" />
            <div className="h-24 bg-white/10 rounded-2xl" />
            <div className="h-24 bg-white/10 rounded-2xl" />
          </div>

          <div className="h-56 bg-white/10 rounded-3xl" />
        </div>
      </div>
    </div>
  );
}