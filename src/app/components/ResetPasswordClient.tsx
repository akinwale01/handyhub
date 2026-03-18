"use client";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

const CODE_LENGTH = 6;

export default function ResetPasswordClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email") || "";

  const [step, setStep] = useState<"otp" | "password" | "success">("otp");
  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const [error, setError] = useState(false);
  const [successVerify, setSuccessVerify] = useState(false);
  const [resetToken, setResetToken] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);

  const passwordValid =
    /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/.test(password);

  useEffect(() => {
    if (countdown === 0) return;
    const timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  useEffect(() => {
  if (!email) router.push("/auth/forgot-password");
}, [email]);

  const handleCodeChange = (value: string, index: number) => {
    const upper = value.toUpperCase().slice(-1);
    const newCode = [...code];
    newCode[index] = upper;
    setCode(newCode);

    if (upper && index < CODE_LENGTH - 1) {
      document.getElementById(`code-${index + 1}`)?.focus();
    }

    if (newCode.every((digit) => digit !== "")) {
      verifyCode(newCode.join(""));
    }
  };

  const verifyCode = async (enteredCode: string) => {
    setLoading(true);

    const res = await fetch("/api/verify-otp", {
      method: "POST",
      body: JSON.stringify({
        email,
        otp: enteredCode,
        type: "reset",
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(true);
      setTimeout(() => setError(false), 500);
      setCode(Array(CODE_LENGTH).fill(""));
    } else {
      setSuccessVerify(true);
      setResetToken(data.resetToken);
      setTimeout(() => setStep("password"), 800);
    }
  };

  const resendCode = async () => {
    if (countdown !== 0) return;

    await fetch("/api/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });

    setCountdown(60);
  };

  const handleResetPassword = async () => {
    if (!passwordValid) return;

    setLoading(true);

    const res = await fetch("/api/reset-password", {
      method: "POST",
      body: JSON.stringify({ resetToken, password }),
    });

    setLoading(false);

    if (res.ok) {
      setStep("success");
      setTimeout(() => router.push("/auth/login"), 2000);
    }
  };

  return (<div className="min-h-screen flex items-center justify-center bg-black px-6">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-lg text-black">

        {/* ---------------- OTP STEP ---------------- */}
        {step === "otp" && (
          <>
            <h2 className="text-2xl text-center text-black font-bold">
              Enter Reset Code
            </h2>

            <div
              className={`flex justify-center gap-3 mt-6 ${
                error ? "animate-shake" : ""
              }`}
            >
              {code.map((digit, index) => (
                <input
                  key={index}
                  id={`code-${index}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) =>
                    handleCodeChange(e.target.value, index)
                  }
                  className={`w-12 h-12 text-center text-lg font-semibold rounded-xl border transition ${
                    successVerify
                      ? "border-green-500"
                      : error
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />
              ))}
            </div>

            {loading && (
              <p className="text-sm text-center mt-4 text-gray-500">
                Verifying...
              </p>
            )}

            <div className="text-center mt-6 text-sm">
              {countdown > 0 ? (
                <p className="text-gray-400">
                  Resend code in {countdown}s
                </p>
              ) : (
                <button
                  onClick={resendCode}
                  className="text-black font-medium hover:underline hover:text-red-600 cursor-pointer"
                >
                  Resend Code
                </button>
              )}
            </div>
          </>
        )}

        {/* ---------------- PASSWORD STEP ---------------- */}
        {step === "password" && (
          <>
            <h2 className="text-2xl font-semibold text-center text-green-950">
              Create New Password
            </h2>

            <div className="pt-6 flex flex-col gap-4">

              {/* Floating Label Input */}
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="peer w-full px-3 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black text-black"
                  placeholder=" New Password"
                />
                <label className="absolute left-4 top-3 text-gray-400 text-sm transition-all
                  peer-placeholder-shown:top-3 peer-placeholder-shown:text-base
                  peer-focus:-top-2 peer-focus:text-sm peer-focus:text-black
                 bg-white px-1">

                </label>
              </div>

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-sm text-gray-600 text-right cursor-pointer"
              >
                {showPassword ? "Hide Password" : "Show Password"}
              </button>

              {/* Password Rules */}
              <div className="text-sm space-y-1">
                <p className={password.length >= 8 ? "text-green-600" : "text-red-400"}>
                  • Minimum 8 characters
                </p>
                <p className={/[A-Z]/.test(password) ? "text-green-600" : "text-red-400"}>
                  • At least one uppercase
                </p>
                <p className={/\d/.test(password) ? "text-green-600" : "text-red-400"}>
                  • At least one number
                </p>
                <p className={/[@$!%*?&]/.test(password) ? "text-green-600" : "text-red-400"}>
                  • At least one special character
                </p>
              </div>

              <button
                onClick={handleResetPassword}
                disabled={!passwordValid || loading}
                className="py-3 rounded-xl bg-black text-white disabled:opacity-50 cursor-pointer hover:opacity-90 transition"
              >
                {loading ? "Updating..." : "Update Password"}
              </button>
            </div>
          </>
        )}

        {/* ---------------- SUCCESS STEP ---------------- */}
        {step === "success" && (
          <div className="text-center">
            <div className="text-green-500 text-5xl animate-bounce">
              ✓
            </div>
            <h2 className="text-xl font-semibold mt-4">
              Password Updated!
            </h2>
            <p className="text-gray-500 text-sm mt-2">
              Redirecting to login...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}