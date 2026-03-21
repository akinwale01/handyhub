"use client";

import { motion } from "framer-motion";
import { Home, Package, Plus } from "lucide-react";

export default function BottomNav({
  onMenuClick,
}: {
  onMenuClick: () => void;
}) {
  return (
    <div className="fixed bottom-0 left-0 w-full bg-[#0B1220]/90 backdrop-blur-xl border-t border-white/10 z-40">
      <div className="flex items-center justify-around py-3">

        {/* Home */}
        <button className="flex flex-col items-center text-xs text-gray-400">
          <Home className="w-6 h-6 mb-1" />
          Home
        </button>

        {/* Center Floating Menu */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onMenuClick}
          className="relative -mt-8 w-16 h-16 rounded-full bg-linear-to-br from-blue-400 to-indigo-600 flex items-center justify-center shadow-[0_0_25px_rgba(59,130,246,0.5)]"
        >
          <Plus className="text-white w-8 h-8" />
        </motion.button>

        {/* Orders (instead of Jobs) */}
        <button className="flex flex-col items-center text-xs text-gray-400">
          <Package className="w-6 h-6 mb-1" />
          Orders
        </button>

      </div>
    </div>
  );
}