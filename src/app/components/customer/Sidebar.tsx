"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  MessageCircle,
  ChevronDown,
  PanelLeft,
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  const [logoutOpen, setLogoutOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [openSections, setOpenSections] = useState<string[]>([
    "Main",
    "Activity",
  ]);

  const toggleSection = (title: string) => {
    setOpenSections((prev) =>
      prev.includes(title)
        ? prev.filter((s) => s !== title)
        : [...prev, title]
    );
  };

  const handleLogout = async () => {
    setLogoutOpen(false);
    await signOut({ callbackUrl: "/" });
  };

  // 💙 Grouped sections
  const sections = [
    {
      title: "Main",
      items: [
        { href: "/dashboard/customer", label: "Dashboard", icon: Home },
      ],
    },
    {
      title: "Activity",
      items: [
        { href: "/dashboard/customer/browse", label: "Find A Provider", icon: Search },
        { href: "/dashboard/customer/jobs", label: "My Jobs", icon: ShoppingCart },
        { href: "/dashboard/customer/payments", label: "Payments", icon: CreditCard },
        { href: "/dashboard/customer/reviews", label: "Reviews", icon: Star },

        { href: "/dashboard/customer/chats", label: "Chats", icon: MessageCircle },
      ],
    },
    {
      title: "Support",
      items: [
        { href: "/dashboard/customer/support", label: "Support", icon: LifeBuoy },
        { href: "/dashboard/customer/settings", label: "Account", icon: Settings },
      ],
    },
  ];

  return (
    <>
      {/* Sidebar */}
      <div
        className={`h-full ${
          collapsed ? "w-20" : "w-64"
        } bg-[#111827] border-r border-white/10 p-4 pt-30 flex flex-col gap-6 transition-all duration-300`}
      >
        {/* Top */}
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="text-xl font-bold">
              Navigation
            </div>
          )}

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-xl hover:bg-white/10 transition"
          >
            <PanelLeft size={18} />
          </button>
        </div>

        {/* Sections */}
        <nav className="flex flex-col gap-4 flex-1">
          {sections.map((section) => {
            const isOpen = openSections.includes(section.title);

            return (
              <div key={section.title} className="flex flex-col gap-4">

                {/* Section Header */}
                {!collapsed && (
                  <button
                    onClick={() => toggleSection(section.title)}
                    className="flex items-center justify-between px-2 text-xs text-gray-600 uppercase tracking-wider"
                  >
                    {section.title}
                    <ChevronDown
                      size={20}
                      className={`transition ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                )}

                {/* Items */}
                {(isOpen || collapsed) && (
                  <div className="flex flex-col gap-5">
                    {section.items.map((item) => (
                      <SidebarItem
                        key={item.label}
                        {...item}
                        collapsed={collapsed}
                        active={pathname === item.href}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Logout */}
        <button
          onClick={() => setLogoutOpen(true)}
          className="px-3 py-2 rounded-xl bg-red-900 hover:bg-red-800 flex items-center justify-center text-white text-sm font-semibold"
        >
          {!collapsed && "Logout"}
        </button>
      </div>

      {/* Modal */}
      {logoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-[#111827] rounded-2xl p-6 w-80 relative border border-white/10 flex flex-col gap-4">

            <button
              onClick={() => setLogoutOpen(false)}
              className="absolute top-3 right-3 p-1 rounded-full hover:bg-white/10"
            >
              <X size={18} />
            </button>

            <h2 className="text-lg font-semibold text-white">
              Confirm Logout
            </h2>

            <p className="text-sm text-gray-400">
              Are you sure you want to log out?
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setLogoutOpen(false)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10"
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

/* ========================= */
/* Sidebar Item              */
/* ========================= */

function SidebarItem({
  href,
  label,
  icon: Icon,
  collapsed,
  active,
}: any) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 p-3 rounded-xl transition-all group
        ${
          active
            ? "bg-blue-500/20 text-blue-400"
            : "bg-white/5 hover:bg-white/10"
        }`}
    >
      <Icon
        size={18}
        className={`${
          active ? "text-blue-400" : "text-gray-400 group-hover:text-white"
        }`}
      />

      {!collapsed && (
        <span className="text-sm font-medium">{label}</span>
      )}
    </Link>
  );
}