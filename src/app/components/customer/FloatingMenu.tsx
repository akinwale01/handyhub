"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  CreditCard,
  ShoppingCart,
  LifeBuoy,
  Settings,
  Star,
  Search,
  X,
} from "lucide-react";

export default function FloatingMenu({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const items = [
    { label: "Browse", href: "/browse", icon: Search },
    { label: "My Jobs", href: "/jobs", icon: ShoppingCart },
    { label: "Payments", href: "/payments", icon: CreditCard },
    { label: "Reviews", href: "/reviews", icon: Star },
    { label: "Support", href: "/support", icon: LifeBuoy },
  ];

  const radius = 130;
  const angleStep = (2 * Math.PI) / items.length;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black z-40"
          />

          {/* Menu */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-4 left-0 w-full px-6 z-50"
          >
            <div className="bg-[#111827] border border-white/10 rounded-3xl pt-20 pb-16 flex flex-col items-center shadow-2xl">

              <div className="relative w-96 h-60">

                {/* Center */}
                <MenuItem
                  label="Account"
                  href="/customer/settings"
                  icon={Settings}
                  large
                  style={{
                    left: "50%",
                    top: "50%",
                    transform: "translate(-50%, -50%)",
                  }}
                />

                {/* Circle */}
                {items.map((item, index) => {
                  const angle = index * angleStep - Math.PI / 2;
                  const x = radius * Math.cos(angle);
                  const y = radius * Math.sin(angle);

                  return (
                    <MenuItem
                      key={item.label}
                      {...item}
                      style={{
                        left: `calc(50% + ${x}px)`,
                        top: `calc(50% + ${y}px)`,
                        transform: "translate(-50%, -50%)",
                      }}
                    />
                  );
                })}
              </div>

              {/* Close */}
              <button onClick={onClose} className="mt-16">
                <div className="w-24 h-24 rounded-full border border-white/20 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-red-900 flex items-center justify-center">
                    <X size={36} className="text-white" />
                  </div>
                </div>
              </button>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function MenuItem({
  label,
  href,
  icon: Icon,
  style,
  large,
}: any) {
  return (
    <Link href={href}>
      <div
        style={style}
        className={`absolute ${
          large ? "w-24 h-24" : "w-20 h-20"
        } rounded-full bg-white/5 border border-white/10 flex flex-col items-center justify-center text-[11px] text-white hover:bg-white/10`}
      >
        <Icon
          size={large ? 26 : 20}
          className="mb-1 text-blue-400"
        />
        {label}
      </div>
    </Link>
  );
}