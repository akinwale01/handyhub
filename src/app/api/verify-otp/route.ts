import { NextResponse } from "next/server";
import { connectDB } from "../../../lib/mongodb";
import User from "../../../models/User";
import Otp from "../../../models/Otp";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { checkRateLimit } from "../../../lib/rateLimit";

function hashOtp(otp: string) {
  return crypto
    .createHash("sha256")
    .update(otp)
    .digest("hex");
}

export async function POST(req: Request) {
  try {
    const { email, otp, type } = await req.json();

    const ip =
      req.headers.get("x-forwarded-for") ||
      req.headers.get("x-real-ip") ||
      "unknown";

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { message: "Too many requests. Try again later." },
        { status: 429 }
      );
    }

    if (!email || !otp || !type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!["signup", "reset"].includes(type)) {
      return NextResponse.json(
        { error: "Invalid verification type" },
        { status: 400 }
      );
    }

    await connectDB();

    const normalizedEmail = email.toLowerCase().trim();
    const formattedOtp = otp.toUpperCase().trim(); // 🔠 force uppercase
    const hashedOtp = hashOtp(formattedOtp); // 🔒 hash before lookup

    const otpRecord = await Otp.findOne({
      email: normalizedEmail,
      otp: hashedOtp,
      type,
    });

    if (!otpRecord) {
      return NextResponse.json(
        { error: "Invalid code" },
        { status: 400 }
      );
    }

    if (otpRecord.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "Code expired" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // 🔹 SIGNUP FLOW
    if (type === "signup") {
      user.emailVerified = true;
      await user.save();

      await Otp.deleteOne({ _id: otpRecord._id });

      const token = jwt.sign(
        { email: user.email, id: user._id.toString() },
        process.env.NEXTAUTH_SECRET!,
        { expiresIn: "15m" }
      );

      return NextResponse.json({ success: true, token });
    }

    // 🔹 RESET PASSWORD FLOW
    if (type === "reset") {
      await Otp.deleteOne({ _id: otpRecord._id });

      const resetToken = jwt.sign(
        {
          email: user.email,
          id: user._id.toString(),
          purpose: "reset",
        },
        process.env.NEXTAUTH_SECRET!,
        { expiresIn: "10m" }
      );

      return NextResponse.json({ success: true, resetToken });
    }

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 400 }
    );

  } catch (error) {
    console.error("Verify OTP error:", error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}