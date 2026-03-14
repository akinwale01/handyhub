"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Eye, EyeClosed } from "lucide-react";
import PageLoader from "../../components/PageLoader";

export default function LoginPage() {
  const router = useRouter();

  const [pageLoading, setPageLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  // Intro Loader
  useEffect(() => {
    const t = setTimeout(() => setPageLoading(false), 1500);
    return () => clearTimeout(t);
  }, []);

  // =========================
  // Google Login
  // =========================
  const handleGoogleLogin = async () => {
    setSubmitting(true);
    await signIn("google", {
      callbackUrl: "/auth/redirect", // we’ll route users based on role here
    });
  };

  // =========================
  // Email + Password Login
  // =========================
  const handleEmailLogin = async () => {
    setError("");

    if (!form.email || !form.password) {
      setError("Email and password required");
      return;
    }

    setSubmitting(true);

    try {
      // Step 1: request login token from backend
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Login failed");
        return;
      }

      // Step 2: pass token to NextAuth Credentials
      const result = await signIn("credentials", {
        email: form.email,
        token: data.token,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid login credentials");
        return;
      }

      // Step 3: redirect logic
      router.push("/auth/redirect");
    } catch {
      setError("Network error. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (pageLoading) return <PageLoader />;

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-linear-to-br from-black via-zinc-900 to-black px-4 py-12 overflow-hidden">

      {/* Glow Background */}
      <div className="absolute w-125 h-125 bg-indigo-600/20 blur-3xl rounded-full -top-37.5 -left-37.5 animate-pulse" />
      <div className="absolute w-100 h-100 bg-purple-500/20 blur-3xl rounded-full -bottom-30 -right-30 animate-pulse" />

      {submitting && (
        <div className="absolute inset-0 z-50">
          <PageLoader />
        </div>
      )}

      <div className="relative w-full max-w-md bg-zinc-900/70 backdrop-blur-2xl border border-zinc-800 rounded-3xl p-8 shadow-2xl flex flex-col gap-6">

        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-bold text-white tracking-tight text-center">
            Welcome back
          </h1>
          <p className="text-zinc-400 text-sm text-center">
            Login to continue using the platform
          </p>
        </div>

        {/* Google */}
        <button
          onClick={handleGoogleLogin}
          className="w-full bg-white text-black py-3 rounded-xl font-semibold hover:bg-zinc-200 transition-all duration-300 cursor-pointer"
        >
          Continue with Google
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="h-px bg-zinc-700 flex-1" />
          <span className="text-xs text-zinc-500">OR</span>
          <div className="h-px bg-zinc-700 flex-1" />
        </div>

        {/* Email */}
        <input
          placeholder="Email"
          className="login-input"
          onChange={(e) =>
            setForm({ ...form, email: e.target.value })
          }
        />

        {/* Password */}
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            className="login-input pr-14"
            onChange={(e) =>
              setForm({ ...form, password: e.target.value })
            }
          />

          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeClosed size={20} /> : <Eye size={20} />}
          </button>
        </div>

        {/* Keep logged in + Forgot */}
        <div className="flex flex-col gap-6 text-sm">
          <label className="flex items-center gap-2 text-zinc-400 cursor-pointer">
            <input
              type="checkbox"
              checked={keepLoggedIn}
              onChange={() => setKeepLoggedIn(!keepLoggedIn)}
              className="accent-indigo-500"
            />
            Keep me logged in for 7 days
          </label>

          <Link
            href="/auth/forgot-password"
            className="text-indigo-400 hover:text-indigo-300"
          >
            <span className="hover:underline">Forgot password?</span>
          </Link>
        </div>

        {error && (
          <p className="text-red-400 text-sm text-center">
            {error}
          </p>
        )}

        {/* Login Button */}
        <button
          onClick={handleEmailLogin}
          className="w-full bg-linear-to-r from-indigo-500 via-purple-600 to-pink-500 py-3 rounded-xl font-semibold text-white transition-all duration-300 cursor-pointer hover:scale-[1.02] active:scale-[0.98] shadow-lg"
        >
          Login
        </button>

        {/* Signup */}
        <p className="text-center text-sm text-zinc-400">
          Don’t have an account?{" "}
          <Link
            href="/auth/signup"
            className="text-indigo-400 hover:text-indigo-300 font-medium"
          >
            Sign up
          </Link>
        </p>
      </div>

      <style jsx>{`
        .login-input {
          background: #18181b;
          border: 1px solid #27272a;
          padding: 12px 14px;
          border-radius: 14px;
          color: white;
          font-size: 14px;
          transition: all 0.3s ease;
          outline: none;
        }

        .login-input:focus {
          border-color: #6366f1;
          box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.3);
        }
      `}</style>
    </div>
  );
}