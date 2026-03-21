"use client";

import { useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import {
  Home,
  Search,
  ShoppingCart,
  CreditCard,
  Star,
  Settings,
  LifeBuoy,
  X,
} from "lucide-react";

export default function Sidebar() {
  const [logoutOpen, setLogoutOpen] = useState(false);

  const handleLogout = async () => {
    setLogoutOpen(false);
    await signOut({ callbackUrl: "/" });
  };

  const items = [
    { href: "/customer", label: "Dashboard", icon: Home },
    { href: "/customer/browse", label: "Browse Services", icon: Search },
    { href: "/customer/jobs", label: "My Jobs", icon: ShoppingCart },
    { href: "/customer/payments", label: "Payments", icon: CreditCard },
    { href: "/customer/reviews", label: "Reviews", icon: Star },
    { href: "/customer/support", label: "Support", icon: LifeBuoy },
    { href: "/customer/settings", label: "Account", icon: Settings },
  ];

  return (
    <>
      {/* Sidebar */}
      <div className="h-full w-64 bg-[#111827] border-r border-white/10 p-6 flex flex-col gap-8">

        {/* Title */}
        <div className="text-2xl font-bold text-blue-400 tracking-wide">
          Customer
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-6 flex-1 pt-10">
          {items.map((item) => (
            <SidebarItem key={item.label} {...item} />
          ))}
        </nav>

        {/* Logout */}
        <button
          onClick={() => setLogoutOpen(true)}
          className="px-4 py-3 rounded-2xl bg-red-900 hover:bg-red-800 flex items-center justify-center text-white font-semibold"
        >
          Logout
        </button>
      </div>

      {/* Modal */}
      {logoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-[#111827] rounded-2xl p-6 w-80 relative border border-white/10 flex flex-col gap-4">

            <button
              onClick={() => setLogoutOpen(false)}
              className="absolute top-3 right-3"
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
                className="px-4 py-2 rounded-xl bg-white/5"
              >
                Cancel
              </button>

              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-xl bg-red-900 text-white"
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

function SidebarItem({ href, label, icon: Icon }: any) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/5 hover:bg-white/10"
    >
      <Icon className="text-blue-400" size={18} />
      <span className="text-white text-sm">{label}</span>
    </Link>
  );
}