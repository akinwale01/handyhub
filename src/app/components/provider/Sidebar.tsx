"use client";

import { useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import {
  Wallet,
  BarChart3,
  LifeBuoy,
  ShieldCheck,
  Settings,
  Star,
  Home,
  X,
} from "lucide-react";

export default function Sidebar() {
  const [logoutOpen, setLogoutOpen] = useState(false);

  const handleLogout = async () => {
    setLogoutOpen(false);
    await signOut({ callbackUrl: "/" });
  };

  // Sidebar items with icons
  const items = [
    { href: "/provider", label: "Home", icon: Home },
    { href: "/provider/jobs", label: "Jobs", icon: Star },
    { href: "/provider/earnings", label: "Earnings", icon: Wallet },
    { href: "/provider/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/provider/support", label: "Support", icon: LifeBuoy },
    { href: "/provider/verification", label: "Verification", icon: ShieldCheck },
    { href: "/provider/settings", label: "Account", icon: Settings },
  ];

  return (
    <>
      {/* Sidebar */}
      <div className="h-screen w-64 bg-[#111827] border-r border-white/10 p-6 flex flex-col gap-8 shadow-lg">
        {/* Title */}
        <div className="text-2xl font-bold text-emerald-400 tracking-wide">
          Provider
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-6 flex-1 pt-10">
          {items.map((item) => (
            <SidebarItem
              key={item.label}
              href={item.href}
              label={item.label}
              Icon={item.icon}
            />
          ))}
        </nav>

        {/* Logout Button */}
        <button
          onClick={() => setLogoutOpen(true)}
          className="px-4 py-3 rounded-2xl bg-red-900 hover:bg-red-800 shadow-md flex items-center justify-center gap-2 text-white font-semibold transition-all cursor-pointer"
        >
          Logout
        </button>
      </div>

      {/* Logout Confirmation Modal */}
      {logoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-[#111827] rounded-2xl p-6 w-80 relative border border-white/10 shadow-2xl flex flex-col gap-4">
            <button
              onClick={() => setLogoutOpen(false)}
              className="absolute top-3 right-3 p-1 rounded-full hover:bg-white/10 transition"
            >
              <X size={18} className="text-white" />
            </button>

            <h2 className="text-lg font-semibold text-white">
              Confirm Logout
            </h2>
            <p className="text-sm text-gray-400">
              Are you sure you want to log out?
            </p>

            <div className="flex justify-end gap-3 mt-2">
              <button
                onClick={() => setLogoutOpen(false)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-xl bg-red-900 hover:bg-red-800 text-white transition cursor-pointer"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function SidebarItem({
  href,
  label,
  Icon,
}: {
  href: string;
  label: string;
  Icon: any;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/5 hover:bg-white/10 shadow-sm transition-all group"
    >
      <Icon className="text-emerald-400 group-hover:text-emerald-300" size={18} />
      <span className="text-white font-medium text-sm">{label}</span>
    </Link>
  );
}