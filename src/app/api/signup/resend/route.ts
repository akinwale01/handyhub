import { NextResponse } from "next/server";
import { connectDB } from "../../../../lib/mongodb";
import Otp from "../../../../models/Otp";
import { generateOtp } from "../../../../lib/generateOtp";
import { sendOtpEmail } from "../../../../lib/mailer";
import { checkRateLimit } from "../../../../lib/rateLimit";
import { hashOtp } from "../../../../lib/hashOtp";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    const ip =
      req.headers.get("x-forwarded-for") ||
      req.headers.get("x-real-ip") ||
      "unknown";

    // ✅ Rate limit FIRST
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { message: "Too many requests. Try again later." },
        { status: 429 }
      );
    }

    if (!email) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 }
      );
    }

    await connectDB();

    const normalizedEmail = email.toLowerCase().trim();

    // 🧹 Delete old OTPs
    await Otp.deleteMany({ email: normalizedEmail, type: "signup" });

    // 🔢 Generate + hash OTP
    const otp = generateOtp();
    const hashedOtp = hashOtp(otp);

    await Otp.create({
      email: normalizedEmail,
      otp: hashedOtp,
      type: "signup",
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    await sendOtpEmail(normalizedEmail, otp);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Resend OTP error:", error);

    return NextResponse.json(
      { message: "Failed to resend OTP" },
      { status: 500 }
    );
  }
}