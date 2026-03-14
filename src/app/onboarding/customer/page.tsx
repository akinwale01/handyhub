"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import AvatarSelector from "../../components/AvatarSelector";
import { CheckCircle2, Loader2 } from "lucide-react";

export default function CustomerOnboarding() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    location: "",
  });

  const [avatarUrl, setAvatarUrl] = useState("");

  // ✅ Prefill from signup session
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!avatarUrl) {
      alert("Please select an avatar");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/customer-onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, avatarUrl }),
    });

    setLoading(false);

    if (res.ok) {
      setSuccess(true);
      setTimeout(() => {
        router.replace("/dashboard/customer");
      }, 2000);
    } else {
      alert("Something went wrong");
    }
  };

  // 🎉 Success Screen
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden">
        <div className="absolute w-100 h-100 bg-indigo-600 rounded-full blur-3xl opacity-20 animate-pulse" />
        <div className="relative bg-zinc-900/80 backdrop-blur-xl p-12 rounded-3xl shadow-2xl border border-zinc-700 flex flex-col items-center gap-6 animate-slideUp">
          <CheckCircle2 size={80} className="text-green-400 animate-bounce" />
          <h2 className="text-3xl font-bold text-white text-center">
            Profile Created Successfully 🎉
          </h2>
          <p className="text-zinc-400 text-center">
            Redirecting you to your dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center px-4 py-12">
      {/* Background glow effects */}
      <div className="absolute w-125 h-125 bg-indigo-600 rounded-full blur-3xl opacity-20 -top-25 left-25" />
      <div className="absolute w-100 h-100 bg-pink-600 rounded-full blur-3xl opacity-20 -bottom-25 -right-25" />

      <div className="relative w-full max-w-3xl bg-zinc-900/80 backdrop-blur-xl border border-zinc-700 rounded-3xl shadow-2xl p-10 flex flex-col gap-8 animate-slideUp">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white">
            Let’s Build Your Profile
          </h1>
          <p className="text-zinc-400 mt-2">
            Personalize your experience in seconds
          </p>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <FloatingInput
            name="firstName"
            label="First Name"
            value={form.firstName}
            onChange={handleChange}
          />
          <FloatingInput
            name="lastName"
            label="Last Name"
            value={form.lastName}
            onChange={handleChange}
          />
        </div>

        <FloatingInput
          name="phone"
          label="Phone Number"
          value={form.phone}
          onChange={handleChange}
        />

        <FloatingInput
          name="address"
          label="Address"
          value={form.address}
          onChange={handleChange}
        />

        <FloatingInput
          name="location"
          label="Location"
          value={form.location}
          onChange={handleChange}
        />

        {/* Avatar Section */}
        <div className="flex flex-col gap-4">
          <h3 className="text-white font-semibold text-lg">
            Choose Your Avatar
          </h3>

          <AvatarSelector onSelect={setAvatarUrl} />

          {avatarUrl && (
            <div className="flex justify-center animate-fadeIn">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-indigo-500 shadow-[0_0_30px_rgba(99,102,241,0.6)] transition-transform hover:scale-105">
                <img
                  src={avatarUrl}
                  alt="Selected Avatar"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="mt-4 w-full py-4 rounded-xl font-semibold text-white bg-linear-to-r from-indigo-600 to-pink-600 hover:scale-105 transition-transform flex justify-center items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {loading && <Loader2 size={18} className="animate-spin" />}
          Finish Setup
        </button>
      </div>
    </div>
  );
}

/* Floating Input Component */
function FloatingInput({
  name,
  label,
  value,
  onChange,
}: {
  name: string;
  label: string;
  value: string;
  onChange: any;
}) {
  return (
    <div className="relative">
      <input
        name={name}
        value={value}
        onChange={onChange}
        className="peer w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 pt-6 pb-2 text-white focus:outline-none focus:border-indigo-500 transition"
      />
      <label
        className={`absolute left-4 transition-all text-zinc-400
        ${
          value
            ? "top-2 text-xs text-indigo-400"
            : "top-4 text-sm peer-focus:top-2 peer-focus:text-xs peer-focus:text-indigo-400"
        }`}
      >
        {label}
      </label>
    </div>
  );
}