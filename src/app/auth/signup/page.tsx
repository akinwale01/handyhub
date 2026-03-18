"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Eye, EyeClosed } from "lucide-react";
import PageLoader from "../../components/PageLoader";

export default function SignupPage() {
  const router = useRouter();

  const [pageLoading, setPageLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showGenerator, setShowGenerator] = useState(false);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const [passwordRules, setPasswordRules] = useState({
    minLength: false,
    hasUppercase: false,
    hasNumber: false,
    hasSpecial: false,
  });

  // Intro Loader
  useEffect(() => {
    const t = setTimeout(() => setPageLoading(false), 2000);
    return () => clearTimeout(t);
  }, []);

  // Password validation
  useEffect(() => {
    const pwd = form.password;
    setPasswordRules({
      minLength: pwd.length >= 8,
      hasUppercase: /[A-Z]/.test(pwd),
      hasNumber: /[0-9]/.test(pwd),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
    });
  }, [form.password]);

  const generatePassword = () => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+{}[]";
    let pwd = "";
    for (let i = 0; i < 12; i++) {
      pwd += chars[Math.floor(Math.random() * chars.length)];
    }
    setForm({ ...form, password: pwd });
  };

  const handleEmailSignup = async () => {
    setError("");

    if (!form.firstName || !form.lastName || !form.email || !form.password) {
      setError("All fields are required");
      return;
    }

    if (!Object.values(passwordRules).every(Boolean)) {
      setError("Password does not meet requirements");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Signup failed");
        return;
      }

      router.push(`/auth/verify-email?email=${form.email}`);
    } catch {
      setError("Network error. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignup = () => {
    signIn("google", { callbackUrl: "/auth/select-role" });
  };

  if (pageLoading) return <PageLoader />;

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-linear-to-br from-black via-zinc-900 to-black px-4 py-12 overflow-hidden">

      {/* Floating Glow Background */}
      <div className="absolute w-125 h-125 bg-purple-600/20 blur-3xl rounded-full -top-37.5 -left-37.5 animate-pulse" />
      <div className="absolute w-100 h-100 bg-indigo-500/20 blur-3xl rounded-full -bottom-30 -right-30 animate-pulse" />

      {submitting && (
        <div className="absolute inset-0 z-50">
          <PageLoader />
        </div>
      )}

      <div className="relative w-full max-w-md bg-zinc-900/70 backdrop-blur-2xl border border-zinc-800 rounded-3xl p-8 shadow-2xl animate-[fadeIn_0.6s_ease-out] flex flex-col gap-6">

        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-bold text-white tracking-tight text-center">
            Create your account
          </h1>
          <p className="text-zinc-400 text-sm text-center">
            Join and start connecting with services
          </p>
        </div>

        {/* Google Button */}
        <button
          onClick={handleGoogleSignup}
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

        {/* Name Fields */}
        <div className="grid grid-cols-2 gap-3">
          <input
            placeholder="First name"
            className="signup-input"
            onChange={(e) =>
              setForm({ ...form, firstName: e.target.value })
            }
          />
          <input
            placeholder="Last name"
            className="signup-input"
            onChange={(e) =>
              setForm({ ...form, lastName: e.target.value })
            }
          />
        </div>

        <input
          placeholder="Email"
          className="signup-input"
          onChange={(e) =>
            setForm({ ...form, email: e.target.value })
          }
        />

        {/* Password */}
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={form.password}
            className="signup-input pr-20"
            onChange={(e) =>
              setForm({ ...form, password: e.target.value })
            }
            onFocus={() => setShowGenerator(true)}
            onBlur={() =>
              setTimeout(() => setShowGenerator(false), 200)
            }
          />

          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition cursor-pointer"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeClosed size={20} /> : <Eye size={20} />}
          </button>

          {showGenerator && (
            <button
              type="button"
              className="absolute right-12 top-1/2 -translate-y-1/2 text-xs text-indigo-400 hover:text-indigo-300 transition cursor-pointer"
              onClick={generatePassword}
            >
              Generate
            </button>
          )}
        </div>

        {/* Password Rules */}
        <div className="text-xs px-2 flex flex-col gap-1">
          <p className={passwordRules.minLength ? "text-green-400" : "text-red-500"}>• Minimum of 8 characters</p>
          <p className={passwordRules.hasUppercase ? "text-green-400" : "text-red-500"}>• At least one capital letter</p>
          <p className={passwordRules.hasNumber ? "text-green-400" : "text-red-500"}>• At least one number</p>
          <p className={passwordRules.hasSpecial ? "text-green-400" : "text-red-500"}>• At least one special character</p>
        </div>

        {error && (
          <p className="text-red-400 text-sm text-center">
            {error}
          </p>
        )}

        {/* Create Account Button */}
        <button
          onClick={handleEmailSignup}
          className="w-full bg-linear-to-r from-indigo-500 via-purple-600 to-pink-500 py-3 rounded-xl font-semibold text-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer shadow-lg"
        >
          Create account
        </button>

        {/* Login Link */}
        <p className="text-center text-sm text-zinc-400">
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="text-indigo-400 hover:text-indigo-300 transition cursor-pointer font-medium"
          >
            Login
          </Link>
        </p>
      </div>

      {/*Input Styling */}
      <style jsx>{`
        .signup-input {
          background: #18181b;
          border: 1px solid #27272a;
          padding: 12px 14px;
          border-radius: 14px;
          color: white;
          font-size: 14px;
          transition: all 0.3s ease;
          outline: none;
        }

        .signup-input:focus {
          border-color: #6366f1;
          box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.3);
        }
      `}</style>
    </div>
  );
}