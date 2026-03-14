"use client";

import { motion, useScroll, useTransform } from "framer-motion";

export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <motion.div
      style={{ scaleX }}
      className="
        fixed
        top-0
        left-0
        right-0
        h-0.75
        bg-orange-500
        z-60
        origin-left
      "
    />
  );
}