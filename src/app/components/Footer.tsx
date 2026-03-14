"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="relative px-6 py-24 bg-black/60 overflow-hidden">
      {/* Big transparent brand */}
      <h2 className="absolute inset-x-0 top-10 text-center text-[6rem] sm:text-[8rem] md:text-[10rem] font-extrabold text-white/5 pointer-events-none">
        HandyHub
      </h2>

      <div className="relative max-w-7xl mx-auto flex flex-col gap-16">
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-12">
          <div className="flex flex-col gap-4">
            <span className="font-bold text-xl">HandyHub</span>
            <p className="text-zinc-400">
              Connecting trusted local professionals with people who need their skills.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <span className="font-semibold">Platform</span>
            <Link href="#why" className="text-zinc-400 hover:text-white">Why HandyHub</Link>
            <Link href="#services" className="text-zinc-400 hover:text-white">Services</Link>
          </div>

          <div className="flex flex-col gap-3">
            <span className="font-semibold">Company</span>
            <Link href="#" className="text-zinc-400 hover:text-white">About</Link>
            <Link href="#" className="text-zinc-400 hover:text-white">Contact</Link>
          </div>

          <div className="flex flex-col gap-3">
            <span className="font-semibold">Get Started</span>
            <Link href="/auth/signup" className="text-zinc-400 hover:text-white">Sign Up</Link>
            <Link href="/auth/login" className="text-zinc-400 hover:text-white">Login</Link>
          </div>
        </div>

        <div className="text-center text-zinc-500 text-sm">
          © {new Date().getFullYear()} HandyHub. All rights reserved.
        </div>
      </div>
    </footer>
  );
}