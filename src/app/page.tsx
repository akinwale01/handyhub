"use client";

import { useEffect, useState, useRef } from "react";
import { motion, easeInOut, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import PageLoader from "./components/PageLoader";
import ScrollProgress from "./components/ScrollProgress";
import terms from "./data/terms.json";
import * as Accordion from "@radix-ui/react-accordion";

/* ---------------- ANIMATIONS ---------------- */
const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0 },
};

const fastFloat = {
  animate: { y: [0, -8, 0] },
  transition: { duration: 3.5, repeat: Infinity, ease: easeInOut },
};

/* ---------------- DATA ---------------- */
const stats = [
  { value: 10000, label: "Verified Providers" },
  { value: 50000, label: "Jobs Completed" },
  { value: 48, label: "Average Rating" },
  { value: 20, label: "Cities Covered" },
];

const services = [
  { name: "Plumbers", desc: "Fix leaks, pipes, and water systems near you" },
  { name: "Electricians", desc: "Wiring, installations, and repairs" },
  { name: "Barbers", desc: "Professional home grooming services" },
  { name: "Cleaners", desc: "Home and office deep cleaning" },
  { name: "Painters", desc: "Interior & exterior painting experts" },
  { name: "Mechanics", desc: "Vehicle diagnostics and repairs" },
  { name: "AC Technicians", desc: "Cooling system repairs & servicing" },
  { name: "Carpenters", desc: "Furniture, fittings, and woodwork" },
];

const cities = [
  "Lagos",
  "Abuja",
  "Ibadan",
  "Port Harcourt",
  "Benin",
  "Abeokuta",
  "Ilorin",
  "Uyo",
];

const testimonials = [
  "I booked a plumber in less than 10 minutes. Smooth experience.",
  "Very reliable professionals. No stress at all.",
  "HandyHub saved me from unreliable roadside technicians.",
];

const faqs = [
  { q: "Are service providers verified?", a: "Yes. Every provider goes through identity and skill verification." },
  { q: "Do you handle payments?", a: "Payments are processed securely and transparently." },
  { q: "What if I’m not satisfied?", a: "We provide support and dispute resolution when needed." },
];

/* ---------------- COUNTER ---------------- */


/* ---------------- TYPING SEQUENCE ---------------- */
function TypingSequence({
  heading,
  onTypingComplete,
  typingSpeed = 120,
}: {
  heading: string;
  onTypingComplete?: (done: boolean) => void;
  typingSpeed?: number;
}) {
  const [displayH, setDisplayH] = useState("");
  const [hIndex, setHIndex] = useState(0);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (hIndex < heading.length) {
      onTypingComplete?.(false);
      timeout = setTimeout(() => {
        setDisplayH((prev) => prev + heading[hIndex]);
        setHIndex(hIndex + 1);
      }, typingSpeed);
    } else {
      onTypingComplete?.(true);
    }

    return () => clearTimeout(timeout);
  }, [hIndex, heading, typingSpeed, onTypingComplete]);

  return (
    <h1 className="text-left md:text-center text-5xl lg:text-7xl font-extrabold leading-tight min-h-30">
      {displayH.split("Trusted Professionals").map((part, i) =>
        i === 1 ? (
          <span key={i}>
            <span className="text-orange-500">Trusted Professionals </span>
            <span className="text-shadow-white">Nearby</span>
          </span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
      {hIndex < heading.length && <span className="animate-blink">|</span>}
      <style jsx>{`
        .animate-blink {
          display: inline-block;
          width: 1ch;
          animation: blink 1s step-start infinite;
        }
        @keyframes blink {
          0%, 50%, 100% { opacity: 1; }
          25%, 75% { opacity: 0; }
        }
      `}</style>
    </h1>
  );
}

/* ---------------- TERMS MODAL ---------------- */
function TermsModal({ onAccept, onReject }: any) {
  const [canAccept, setCanAccept] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center px-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-zinc-900 rounded-3xl max-w-3xl w-full p-8 flex flex-col gap-6"
      >
        <h2 className="text-2xl font-bold text-center">Terms & Conditions</h2>
        <div
          ref={ref}
          onScroll={() => {
            if (!ref.current) return;
            const { scrollTop, scrollHeight, clientHeight } = ref.current;
            if (scrollTop + clientHeight >= scrollHeight - 10) setCanAccept(true);
          }}
          className="max-h-[50vh] overflow-y-auto border border-white/10 rounded-xl p-4 text-zinc-300 flex flex-col gap-6"
        >
          {terms.map((s, i) => (
            <div key={i}>
              <p className="font-semibold text-white">{s.title}</p>
              {s.items.map((t: string, j: number) => (
                <p key={j}>{t}</p>
              ))}
            </div>
          ))}
        </div>
        <div className="flex justify-between gap-4">
          <button onClick={onReject} className="border border-red-500 text-red-500 px-6 py-3 rounded-xl cursor-pointer font-semibold">
            Reject
          </button>
          <button
            disabled={!canAccept}
            onClick={onAccept}
            className={`px-6 py-3 rounded-xl font-semibold ${canAccept ? "bg-green-500 text-black cursor-pointer" : "bg-green-500/30"}`}
          >
            Accept
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* ---------------- ACCORDION CONTENT ---------------- */


/* ---------------- PAGE ---------------- */
export default function HomePage() {
  const [loading, setLoading] = useState(true);
  const [showTerms, setShowTerms] = useState(false);
  const [showHeroContent, setShowHeroContent] = useState(false);

  useEffect(() => {
    setTimeout(() => setLoading(false), 5000);
  }, []);

  useEffect(() => {
    if (!loading && !localStorage.getItem("handyhub_terms_accepted")) setShowTerms(true);
  }, [loading]);

  return (
    <main className="bg-linear-to-br from-black via-zinc-900 to-black text-white overflow-x-hidden flex flex-col gap-0">
      {loading && <PageLoader />}
      <ScrollProgress />
      <Navbar />
      {showTerms && (
        <TermsModal
          onAccept={() => {
            localStorage.setItem("handyhub_terms_accepted", "true");
            setShowTerms(false);
          }}
          onReject={() => window.location.reload()}
        />
      )}

      {/* ================= HERO ================= */}
      <section id="hero" className="relative min-h-screen flex flex-col items-start md:items-center justify-center gap-6 px-6 text-left md:text-center py-20 md:py-40">
        {!loading && (
          <>
          <div className="w-full max-w-4xl text-left md:text-center">
            <TypingSequence
              heading="Find Local Trusted Professionals Nearby"
              typingSpeed={120}
              onTypingComplete={(done) => setShowHeroContent(done)}
            />
            </div>
            <AnimatePresence>
              {showHeroContent && (
                <motion.div
                  key="hero-subtext-buttons"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.5 }}
                  className="flex flex-col gap-6 items-center"
                >
                  <p className="text-zinc-300 text-base sm:text-lg md:text-lg lg:text-xl leading-relaxed max-w-2xl text-left md:text-center">
                    Book verified experts around you — plumbers, electricians, cleaners, technicians, painters, and more — fast, reliable, and stress-free.
                  </p>
                  <div className="flex flex-row gap-4 flex-wrap pt-4 items-center justify-center w-full max-w-md">
                    <Link href="/auth/signup" className="bg-orange-500 px-4 py-4 rounded-xl text-black font-semibold flex-1 text-center">
                      Find a Professional
                    </Link>
                    <Link href="/auth/signup" className="border border-white/30 px-4 py-4 rounded-xl flex-1 text-center">
                      Become a Provider
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </section>

      {/* ================= STATS ================= */}
      <section id="stats" className="py-20 bg-black/40">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 max-w-6xl mx-auto px-6">
          {stats.map((s, i) => (
            <motion.div key={`stat-${i}`} {...fastFloat} className="text-center">
              <p className="text-4xl font-bold text-orange-500">{s.value.toLocaleString()}+</p>
              <p className="text-zinc-400">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ================= SERVICES ================= */}
      <section id="services" className="py-28 px-6">
        <h2 className="text-4xl font-bold text-center mb-12">Services Available</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {services.map((s, i) => (
            <motion.div
              key={`service-${i}`}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              transition={{ duration: 0.35, delay: i * 0.05 }}
              whileHover={{ scale: 1.05 }}
              className="p-6 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-3"
            >
              <p className="font-semibold">{s.name}</p>
              <p className="text-zinc-400 text-sm">{s.desc}</p>
              <span className="text-xs text-orange-500">Available in your city</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ================= WHY HANDYHUB ================= */}
      <section id="why" className="py-28 px-6 bg-black/40">
        <h2 className="text-4xl font-bold text-center mb-16">Why HandyHub?</h2>
        <div className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto">
          {[
            "Verified professionals only",
            "Transparent pricing",
            "Secure payments",
            "Real reviews from real users",
            "Fast booking process",
            "Customer support you can trust",
          ].map((t, i) => (
            <motion.div
              key={`why-${i}`}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="p-8 bg-white/5 rounded-3xl"
            >
              <p className="font-semibold">{t}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ================= TESTIMONIALS ================= */}
      <section id="testimonials" className="py-28 px-6">
        <h2 className="text-4xl font-bold text-center mb-16">What Users Say</h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((t, i) => (
            <motion.div
              key={`test-${i}`}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="p-8 bg-white/5 rounded-3xl"
            >
              <p className="text-zinc-300">“{t}”</p>
              <p className="text-sm text-zinc-500 mt-4">— John Doe</p>
            </motion.div>
          ))}
        </div>
      </section>

 {/* ================= FAQ ================= */}
      <section id="faq" className="py-28 px-6 bg-black/40">
        <h2 className="text-4xl font-bold text-center mb-16">FAQs</h2>

        <Accordion.Root
          type="single"
          collapsible
          className="max-w-4xl mx-auto flex flex-col gap-4"
        >
          {faqs.map((f, i) => (
            <Accordion.Item
              key={i}
              value={`item-${i}`}
              className="bg-white/5 rounded-xl"
            >
              <Accordion.Trigger className="w-full px-6 py-4 text-left font-semibold flex justify-between">
                {f.q}
                <span>+</span>
              </Accordion.Trigger>

              <Accordion.Content className="px-6 pb-4 text-zinc-400">
                {f.a}
              </Accordion.Content>
            </Accordion.Item>
          ))}
        </Accordion.Root>
      </section>

      {/* ================= CITIES MARQUEE ================= */}
      <section id="cities" className="py-16 overflow-hidden">
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          className="flex gap-16 whitespace-nowrap text-zinc-400 text-lg"
        >
          {[...cities, ...cities].map((c, i) => (
            <span key={`city-${i}`}>📍 {c}</span>
          ))}
        </motion.div>
      </section>

      {/* ================= CTA ================= */}
      <section id="cta" className="py-28 px-6 text-center">
        <motion.h2 className="text-4xl font-bold mb-6" {...fastFloat}>
          Ready to Book with Confidence?
        </motion.h2>
        <p className="text-zinc-300 max-w-2xl mx-auto mb-8">
          Join thousands of Nigerians using HandyHub every day.
        </p>
        <Link href="/auth/signup" className="bg-orange-500 px-10 py-4 rounded-xl text-black font-semibold">
          Get Started Now
        </Link>
      </section>

      <Footer />
    </main>
  );
}