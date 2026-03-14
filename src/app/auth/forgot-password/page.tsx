"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) return;

    setLoading(true);
    setMessage("");

    const res = await fetch("/api/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });

    const data = await res.json();

    setLoading(false);
    setMessage(data.message);

    if (res.ok) {
      setTimeout(() => {
        router.push(`/auth/reset-password?email=${encodeURIComponent(email)}`);
      }, 1200);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-6">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm">
        <h2 className="text-2xl font-semibold text-gray-800 text-center">
          Forgot Password
        </h2>

        <p className="text-sm text-gray-500 text-center mt-2">
          Enter your email and we’ll send you a reset code.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <input
            type="email"
            placeholder="Enter your email"
            className="w-full px-4 py-3 rounded-xl border border-blue-600 focus:outline-none focus:ring-2 focus:ring-black transition text-black"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-black text-white font-medium hover:opacity-90 transition disabled:opacity-60 cursor-pointer"
          >
            {loading ? "Sending..." : "Send Code"}
          </button>
        </form>

        {message && (
          <p className="text-sm text-center mt-4 text-green-600">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}