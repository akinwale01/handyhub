"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
    "Work",
    "Action",
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

  const sections = [
    {
      title: "Main",
      items: [
        { href: "/dashboard/provider", label: "Home", icon: Home },

      ],
    },
    {
      title: "Work",
      items: [
        { href: "/dashboard/provider/jobs", label: "Jobs", icon: Star },
        { href: "/dashboard/provider/earnings", label: "Earnings", icon: Wallet },
      ],
    },
    {
      title: "Action",
      items: [
        { href: "/dashboard/provider/analytics", label: "Analytics", icon: BarChart3 },
        { href: "/dashboard/provider/chats", label: "Chats", icon: MessageCircle },
      ],
    },
    {
      title: "Account",
      items: [
        { href: "/dashboard/provider/support", label: "Support", icon: LifeBuoy },
        { href: "/dashboard/provider/verification", label: "Verification", icon: ShieldCheck },
        { href: "/dashboard/provider/settings", label: "Account", icon: Settings },
      ],
    },
  ];

  return (
    <>
      <div
        className={`h-full ${
          collapsed ? "w-20" : "w-64"
        } bg-[#111827] border-r border-white/10 p-4 pt-30 flex flex-col gap-6 transition-all duration-300`}
      >
        {/* Top */}
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="text-2xl font-bold">
              Navigation
            </div>
          )}

          {/* Collapse toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-xl hover:bg-white/10 transition"
          >
            <PanelLeft size={18} />
          </button>
        </div>

        {/* Sections */}
        <nav className="flex flex-col gap-6 flex-1">
          {sections.map((section) => {
            const isOpen = openSections.includes(section.title);

            return (
              <div key={section.title} className="flex flex-col gap-4">

                {/* Section Header */}
                {!collapsed && (
                  <button
                    onClick={() => toggleSection(section.title)}
                    className="flex items-center justify-between px-2 text-xs text-gray-600 uppercase tracking-wider font-bold"
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
                        href={item.href}
                        label={item.label}
                        Icon={item.icon}
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

      </div>


    </>
  );
}

/* ========================= */
/* Sidebar Item              */
/* ========================= */

function SidebarItem({
  href,
  label,
  Icon,
  collapsed,
  active,
}: {
  href: string;
  label: string;
  Icon: any;
  collapsed: boolean;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 p-3 rounded-xl transition-all group
        ${
          active
            ? "bg-emerald-500/20 text-emerald-400"
            : "bg-white/5 hover:bg-white/10"
        }`}
    >
      <Icon
        size={18}
        className={`${
          active ? "text-emerald-400" : "text-gray-400 group-hover:text-white"
        }`}
      />

      {!collapsed && (
        <span className="text-sm font-medium">{label}</span>
      )}
    </Link>
  );
}