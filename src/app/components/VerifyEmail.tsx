"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

const OTP_LENGTH = 6;
const RESEND_TIME = 60;

export default function VerifyEmailPage() {
  const params = useSearchParams();
  const router = useRouter();
  const email = params.get("email");

  const inputsRef = useRef<HTMLInputElement[]>([]);
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [verifying, setVerifying] = useState(false);
  const [timer, setTimer] = useState(RESEND_TIME);

  // Bounce back if no email
  useEffect(() => {
    if (!email) router.replace("/auth/signup");
  }, [email, router]);

  // Countdown timer for resend
  useEffect(() => {
    if (timer <= 0) return;
    const t = setTimeout(() => setTimer((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timer]);

  // Auto verify when filled
  useEffect(() => {
    if (otp.every((d) => d !== "") && !verifying && status !== "success") {
      verifyOtp();
    }
  }, [otp, verifying, status]);

  const handleChange = (value: string, index: number) => {
    if (!/^\d?$/.test(value) || verifying) return;
    const arr = [...otp];
    arr[index] = value;
    setOtp(arr);
    if (value && index < OTP_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (verifying) return;
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    if (verifying) return;
    const paste = e.clipboardData.getData("Text").trim();
    if (!/^\d+$/.test(paste)) return;

    const digits = paste.split("").slice(0, OTP_LENGTH);
    const newOtp = Array(OTP_LENGTH).fill("");
    digits.forEach((d, i) => (newOtp[i] = d));
    setOtp(newOtp);

    inputsRef.current[Math.min(digits.length, OTP_LENGTH - 1)]?.focus();
  };

  const verifyOtp = async () => {
    if (!email || verifying) return;
    setVerifying(true);
    setStatus("idle");

    try {
      const res = await fetch("/api/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otp.join("") }),
      });

      if (!res.ok) throw new Error();

      const data = await res.json();

      // ✅ Automatically sign in after OTP verification
      if (data?.token) {
        await signIn("credentials", {
          redirect: false,
          email,
          token: data.token, // this token comes from API
        });
      }
      setStatus("success");
      setTimeout(() => router.push(`/auth/select-role?email=${email}`), 2000);

    } catch {
      setStatus("error");
      setOtp(Array(OTP_LENGTH).fill(""));
      inputsRef.current[0]?.focus();
    } finally {
      setVerifying(false);
    }
  };

  const resendOtp = async () => {
    if (!email) return;
    setTimer(RESEND_TIME);
    setOtp(Array(OTP_LENGTH).fill(""));
    setStatus("idle");

    await fetch("/api/signup/resend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    inputsRef.current[0]?.focus();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-black via-zinc-900 to-zinc-950 px-4 relative">
      {/* Success toast */}
      {status === "success" && (
        <div className="fixed top-2 right-2 z-50 bg-green-500/10 border border-green-500/30 text-green-400 text-sm rounded-xl px-4 py-3 shadow-lg backdrop-blur-md animate-fadeIn">
          <p className="font-medium">Email verified successfully 🎉</p>
          <div className="mt-2 h-1 bg-green-500/20 rounded overflow-hidden">
            <div className="h-full bg-green-500 animate-progress" />
          </div>
        </div>
      )}

      <div className="w-full max-w-md bg-zinc-900/80 backdrop-blur-xl rounded-2xl p-8 shadow-xl animate-fadeIn flex flex-col gap-6 text-center">
        <h1 className="text-2xl font-bold text-white">Verify your email</h1>
        <p className="text-zinc-400">Enter the 6-digit code sent to your email</p>

        <div className={`flex justify-center gap-3 ${status === "error" ? "animate-shake" : ""}`}>
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { if (el) inputsRef.current[i] = el; }}
              maxLength={1}
              value={digit}
              disabled={verifying}
              onChange={(e) => handleChange(e.target.value, i)}
              onKeyDown={(e) => handleKeyDown(e, i)}
              onPaste={handlePaste}
              className={`w-12 h-14 text-center text-xl font-bold rounded-lg bg-zinc-800 text-white outline-none
                ${status === "success"
                  ? "ring-2 ring-green-500"
                  : status === "error"
                  ? "ring-2 ring-red-500"
                  : "focus:ring-2 focus:ring-indigo-500"
                } ${verifying ? "opacity-50 cursor-not-allowed" : ""}`}
            />
          ))}
        </div>

        {status === "error" && (
          <p className="text-red-400 text-sm">Incorrect code. Please try again.</p>
        )}

        <div className="text-sm text-zinc-400">
          {timer > 0 ? (
            <>Resend code in <span className="text-white font-semibold">{timer}s</span></>
          ) : (
            <button onClick={resendOtp} className="text-indigo-400 hover:text-indigo-300 cursor-pointer font-bold">
              Resend OTP
            </button>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }
        .animate-progress {
          animation: progress 2s linear forwards;
        }
      `}</style>
    </div>
  );
}