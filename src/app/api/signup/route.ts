import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "../../../lib/mongodb";
import User from "../../../models/User";
import Otp from "../../../models/Otp";
import { generateOtp } from "../../../lib/generateOtp";
import { sendOtpEmail } from "../../../lib/mailer";
import { checkRateLimit } from "../../../lib/rateLimit";
import { hashOtp } from "../../../lib/hashOtp";

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "unknown";

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { message: "Too many requests. Try again later." },
        { status: 429 }
      );
    }

    const { firstName, lastName, email, password } = await req.json();

    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    await connectDB();

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({ email: normalizedEmail });

    // 🔁 RESEND OTP if user exists but not verified
    if (existingUser) {
      if (!existingUser.emailVerified) {
        const otp = generateOtp();
        const hashedOtp = hashOtp(otp);

        await Otp.deleteMany({ email: normalizedEmail });

        await Otp.create({
          email: normalizedEmail,
          otp: hashedOtp,
          type: "signup",
          expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        });

        await sendOtpEmail(normalizedEmail, otp);

        return NextResponse.json({
          success: true,
          message: "OTP resent",
        });
      }

      return NextResponse.json(
        { message: "User already exists" },
        { status: 400 }
      );
    }

    // ✅ CREATE USER
    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      firstName,
      lastName,
      email: normalizedEmail,
      password: hashedPassword,
      role: null,
      onboardingStep: "role",
      emailVerified: false,
      profileCompleted: false,
    });

    // ✅ CREATE OTP
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
    console.error("Signup error:", error);

    return NextResponse.json(
      { message: "Failed to create user or send OTP" },
      { status: 500 }
    );
  }
}