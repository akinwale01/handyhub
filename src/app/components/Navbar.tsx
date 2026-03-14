"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const links = [
  { label: "Services", href: "#services" },
  { label: "Why HandyHub", href: "#why" },
  { label: "Testimonials", href: "#testimonials" },
  { label: "FAQs", href: "#faq" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string>("#hero");
  const [scrolled, setScrolled] = useState(false);

  /* ---------- Lock body scroll on mobile menu ---------- */
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [open]);

  /* ---------- Scroll spy + navbar morph ---------- */
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      const sections = ["hero", "services", "why", "testimonials", "faq"];

      for (const id of sections) {
        const el = document.getElementById(id);
        if (!el) continue;

        const rect = el.getBoundingClientRect();
        if (rect.top <= 120 && rect.bottom >= 120) {
          setActive(`#${id}`);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* ---------- Smooth scroll handler ---------- */
  const goTo = (href: string) => {
    setOpen(false);

    setTimeout(() => {
      const el = document.querySelector(href);
      el?.scrollIntoView({ behavior: "smooth" });
    }, 120);
  };

  return (
    <>
      {/* ================= NAVBAR ================= */}
      <nav className="fixed top-2 left-0 w-full z-50 px-4">
        <motion.div
          animate={{
            backgroundColor: scrolled
              ? "rgba(0,0,0,0.65)"
              : "rgba(0,0,0,0.4)",
            backdropFilter: "blur(16px)",
          }}
          className="max-w-7xl mx-auto flex items-center justify-between rounded-2xl px-5 py-3 border border-white/10"
        >
          {/* Logo */}
          <button
            onClick={() => goTo("#hero")}
            className="text-white font-extrabold text-xl md:text-2xl tracking-tight cursor-pointer"
          >
            Handy<span className="text-orange-500">Hub</span>
          </button>

          {/* Desktop */}
          <ul className="hidden md:flex items-center gap-6 font-medium">
            {links.map((l) => (
              <button
                key={l.href}
                onClick={() => goTo(l.href)}
                className={`transition-colors cursor-pointer ${
                  active === l.href
                    ? "text-orange-500"
                    : "text-white hover:text-orange-400"
                }`}
              >
                {l.label}
              </button>
            ))}

            <a
              href="/auth/login"
              className="px-4 py-2 rounded-lg bg-white text-black font-semibold"
            >
              Login
            </a>
          </ul>

          {/* Mobile button */}
          <button
            onClick={() => setOpen(true)}
            className="md:hidden text-white text-2xl"
            aria-label="Open menu"
          >
            ☰
          </button>
        </motion.div>
      </nav>

      {/* ================= MOBILE MENU ================= */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-60 bg-linear-to-br from-zinc-900 to-black text-white flex flex-col gap-8 px-6 py-6"
          >
            <div className="flex items-center justify-between">
              <button
                onClick={() => goTo("#hero")}
                className="text-xl font-extrabold"
              >
                Handy<span className="text-orange-500">Hub</span>
              </button>

              <button
                onClick={() => setOpen(false)}
                className="text-2xl"
                aria-label="Close menu"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-5 text-lg font-medium">
              {links.map((l) => (
                <button
                  key={l.href}
                  onClick={() => goTo(l.href)}
                  className={`text-left transition-colors ${
                    active === l.href
                      ? "text-orange-500"
                      : "hover:text-orange-400"
                  }`}
                >
                  {l.label}
                </button>
              ))}

              <a
                href="/auth/login"
                className="bg-white text-black px-4 py-3 rounded-lg font-semibold text-center"
                onClick={() => setOpen(false)}
              >
                Login
              </a>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}