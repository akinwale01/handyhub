"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import AvatarSelector from "../../components/AvatarSelector";
import { CheckCircle2, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { nigeriaLocations } from "../../../lib/nigeriaLocations";

export default function CustomerOnboarding() {
  const router = useRouter();
  const { data: session, status, update } = useSession(); // ✅ IMPORTANT

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [state, setState] = useState("");
  const [area, setArea] = useState("");

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
  });

  const [avatarUrl, setAvatarUrl] = useState("");

  /* =========================
     PREFILL FROM SESSION
  ========================== */
  useEffect(() => {
    if (session?.user) {
      setForm((prev) => ({
        ...prev,
        firstName: session.user.firstName || "",
        lastName: session.user.lastName || "",
      }));
    }
  }, [session]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        Loading...
      </div>
    );
  }

  /* =========================
     HANDLERS
  ========================== */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    // ✅ VALIDATION
    if (!form.firstName || !form.lastName || !form.phone || !form.address) {
      toast.error("Please fill all fields");
      return;
    }

    if (!state || !area) {
      toast.error("Select your location");
      return;
    }

    if (!avatarUrl) {
      toast.error("Please select an avatar");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/customer-onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          avatarUrl,
          state,
          area,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Something went wrong");
      }

      // ✅ CRITICAL FIX (refresh session so avatar shows instantly)
      await update();

      setSuccess(true);

      setTimeout(() => {
        router.replace("/dashboard/customer");
      }, 1500);
    } catch (err: any) {
      toast.error(err.message || "Failed to complete onboarding");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     SUCCESS UI
  ========================== */
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden">

        {/* glow */}
        <div className="absolute w-[500px] h-[500px] bg-green-500/20 rounded-full blur-3xl animate-pulse" />

        <div className="relative bg-zinc-900/80 backdrop-blur-xl p-12 rounded-3xl border border-green-500/30 shadow-2xl flex flex-col items-center gap-6 text-center">

          <CheckCircle2 size={90} className="text-green-400 animate-bounce" />

          <h2 className="text-3xl font-bold text-white">
            You're All Set 🚀
          </h2>

          <p className="text-zinc-400 max-w-sm">
            Your profile is ready. Taking you to your dashboard...
          </p>

          {/* progress bar */}
          <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden mt-2">
            <div className="h-full bg-green-500 animate-progress" />
          </div>

        </div>

        <style jsx>{`
          .animate-progress {
            animation: progress 1.5s linear forwards;
          }

          @keyframes progress {
            from { width: 0%; }
            to { width: 100%; }
          }
        `}</style>
      </div>
    );
  }

  /* =========================
     MAIN UI
  ========================== */
  return (
    <div className="min-h-screen bg-black relative flex items-center justify-center px-4 py-12">

      <div className="relative w-full max-w-3xl bg-zinc-900/80 backdrop-blur-xl border border-zinc-700 rounded-3xl shadow-2xl p-10 flex flex-col gap-8">

        <div className="text-center">
          <h1 className="text-4xl font-bold text-white">
            Let’s Build Your Profile
          </h1>
          <p className="text-zinc-400 mt-2">
            Personalize your experience
          </p>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <FloatingInput name="firstName" label="First Name" value={form.firstName} onChange={handleChange} />
          <FloatingInput name="lastName" label="Last Name" value={form.lastName} onChange={handleChange} />
        </div>

        <FloatingInput name="phone" label="Phone Number" value={form.phone} onChange={handleChange} />
        <FloatingInput name="address" label="Address" value={form.address} onChange={handleChange} />

        {/* Location */}
        <div className="grid grid-cols-2 gap-4">
          <select
            value={state}
            onChange={(e) => {
              setState(e.target.value);
              setArea("");
            }}
            className="bg-zinc-800 text-white p-3 rounded-xl border border-zinc-700"
          >
            <option value="">State</option>
            {Object.keys(nigeriaLocations).map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <select
            value={area}
            onChange={(e) => setArea(e.target.value)}
            disabled={!state}
            className="bg-zinc-800 text-white p-3 rounded-xl border border-zinc-700"
          >
            <option value="">Area</option>
            {state &&
              nigeriaLocations[state].map((l: string) => (
                <option key={l} value={l}>{l}</option>
              ))}
          </select>
        </div>

        {/* Avatar */}
        <div className="flex flex-col gap-4">
          <h3 className="text-white font-semibold">Choose Avatar</h3>

          <AvatarSelector onSelect={setAvatarUrl} />

          {avatarUrl && (
            <div className="flex justify-center">
              <img
                src={avatarUrl}
                className="w-28 h-28 rounded-full border-4 border-indigo-500"
              />
            </div>
          )}
        </div>

        {/* Button */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="
            pt-6 w-full py-4 rounded-xl font-medium text-white bg-indigo-600 shadow-sm shadow-indigo-900/30 hover:bg-indigo-500 active:bg-indigo-700 transition-colors duration-200 flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer
          "
        >
          {loading && <Loader2 size={18} className="animate-spin" />}
          Finish Setup
        </button>

      </div>
    </div>
  );
}

/* Floating Input */
function FloatingInput({ name, label, value, onChange }: any) {
  return (
    <div className="relative">
      <input
        name={name}
        value={value}
        onChange={onChange}
        className="peer w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 pt-6 pb-2 text-white focus:border-indigo-500"
      />
      <label
        className={`absolute left-4 text-zinc-400 transition-all ${
          value ? "top-2 text-xs text-indigo-400" : "top-4 text-sm"
        }`}
      >
        {label}
      </label>
    </div>
  );
}