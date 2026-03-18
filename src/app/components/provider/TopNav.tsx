"use client";

import { useMemo } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { Bell, Settings } from "lucide-react";

export default function TopNavbar() {
  const { data: session } = useSession();

  const firstName = session?.user?.firstName || "Guest";
  const image = session?.user?.image;
  const isOnline = session?.user?.isOnline ?? false;

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Good Morning";
    if (hour >= 12 && hour < 17) return "Good Afternoon";
    if (hour >= 17 && hour < 21) return "Good Evening";
    return "Good night";
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full z-40 bg-[#111827] backdrop-blur-xl border-b border-white/10">
      <div className="flex items-center justify-between px-4 py-4 md:px-8">

        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-11 h-11 rounded-full overflow-hidden border border-emerald-400/40 bg-emerald-500/20 flex items-center justify-center text-sm font-semibold">
              {image ? (
                <Image
                  src={image}
                  alt={firstName}
                  width={44}
                  height={44}
                  className="object-cover w-full h-full"
                />
              ) : (
                <span className="text-white">
                  {firstName[0]?.toUpperCase()}
                </span>
              )}
            </div>

            <span
              className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#0B1220] ${
                isOnline ? "bg-emerald-400" : "bg-gray-500"
              }`}
            />
          </div>

          <div className="flex flex-col leading-tight">
            <span className="text-xs text-gray-400">
              {greeting}
            </span>
            <span className="font-semibold">
              {firstName}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-5">
          <button className="relative p-2 rounded-full hover:bg-white/10 transition-colors">
            <Bell size={20} className="text-white" />
          </button>

          <button className="p-2 rounded-full hover:bg-white/10 transition-colors">
            <Settings size={20} className="text-white" />
          </button>
        </div>

      </div>
    </div>
  );
}