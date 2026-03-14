import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "../../../lib/mongodb";
import User from "../../../models/User";
import Otp from "../../../models/Otp";
import { generateOtp } from "../../../lib/generateOtp";
import { sendOtpEmail } from "../../../lib/mailer";
import { checkRateLimit } from "../../../lib/rateLimit";

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

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      // If user exists but NOT verified → resend OTP instead of blocking
      if (!existingUser.emailVerified) {
        const otp = generateOtp();

        await Otp.deleteMany({ email });

        await Otp.create({
          email,
          otp,
          expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        });

        await sendOtpEmail(email, otp);

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

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role: null,
      onboardingStep: "role",
      emailVerified: false,
      profileCompleted: false,
    });

    const otp = generateOtp();

    await Otp.create({
      email,
      otp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    await sendOtpEmail(email, otp);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Signup error:", error);

    return NextResponse.json(
      { message: "Failed to create user or send OTP" },
      { status: 500 }
    );
  }
}