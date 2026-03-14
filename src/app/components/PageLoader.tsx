"use client";

import { motion } from "framer-motion";
import {
  Scissors,
  Paintbrush,
  Wrench,
  Sparkles,
  Brush,
  Hammer,
} from "lucide-react";

const icons = [
  Scissors,
  Paintbrush,
  Wrench,
  Sparkles,
  Brush,
  Hammer,
];

export default function Loading() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed inset-0 z-[999] bg-[#0b0b0f] flex items-center justify-center overflow-hidden"
    >
      {/* Rotating Tool Ring */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
        className="absolute w-72 h-72"
      >
        {icons.map((Icon, i) => {
          const angle = (i / icons.length) * 2 * Math.PI;
          const radius = 120;

          return (
            <div
              key={i}
              className="absolute"
              style={{
                top: "50%",
                left: "50%",
                transform: `translate(-50%, -50%)
                            translate(${Math.cos(angle) * radius}px, ${
                  Math.sin(angle) * radius
                }px)`,
              }}
            >
              <Icon className="w-10 h-10 text-white/80" />
            </div>
          );
        })}
      </motion.div>

      {/* Center Core */}
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute w-28 h-28 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-400 blur-xl opacity-30"
      />

      {/* Brand */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="relative text-5xl font-semibold text-white tracking-tight"
      >
        Handy<span className="text-orange-500">Hub</span>
      </motion.h1>
    </motion.div>
  );
}