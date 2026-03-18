"use client";

import { useState } from "react";
import { SWRConfig } from "swr";

import TopNavbar from "../../components/provider/TopNav";
import BottomNav from "../../components/provider/BottomNav";
import FloatingMenu from "../../components/provider/FloatingMenu";
import Sidebar from "../../components/provider/Sidebar";
import {
  TopNavbarSkeleton,
  BottomNavSkeleton,
  SidebarSkeleton,
  PageSkeleton,
} from "../../components/provider/Skeletons";


const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error("Failed to fetch");
    return res.json();
  });

export default function ProviderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [menuOpen, setMenuOpen] = useState(false);


  return (
    <SWRConfig
      value={{
        fetcher,
        refreshInterval: 100000,
        revalidateOnFocus: true,
        revalidateOnReconnect: true,
        dedupingInterval: 5000,
      }}
    >

    <div className="min-h-screen bg-[#0B1220] text-white flex">

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

  </SWRConfig>
);
}
