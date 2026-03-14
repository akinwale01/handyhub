import { NextResponse } from "next/server";
import crypto from "crypto";
import { connectDB } from "../../../lib/mongodb";
import User from "../../../models/User";
import Otp from "../../../models/Otp";
import { transporter } from "../../../lib/mailer";

function generateResetCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";

  for (let i = 0; i < 6; i++) {
    result += chars.charAt(
      crypto.randomInt(0, chars.length)
    );
  }

  return result;
}

function hashCode(code: string) {
  return crypto
    .createHash("sha256")
    .update(code)
    .digest("hex");
}

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 }
      );
    }

    await connectDB();

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail });

    // 🔒 Security best practice:
    // Do NOT reveal if user exists or not
    if (!user) {
      return NextResponse.json({
        message: "If this email exists, a reset code has been sent.",
      });
    }

    // 🔥 Delete any existing reset OTP for this email
    await Otp.deleteMany({
      email: normalizedEmail,
      type: "reset",
    });

    const rawCode = generateResetCode();
    const hashedCode = hashCode(rawCode);

    // 🔥 Save new OTP
    await Otp.create({
      email: normalizedEmail,
      otp: hashedCode,
      type: "reset",
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 mins
    });

    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: normalizedEmail,
      subject: "Your HandyHub Password Reset Code",
      html: `
        <div style="font-family:sans-serif; text-align:center;">
          <h2>Password Reset Code</h2>
          <p>Your reset code is:</p>
          <p style="font-size:28px; font-weight:bold; letter-spacing:4px;">
            ${rawCode}
          </p>
          <p>This expires in 5 minutes.</p>
        </div>
      `,
    });

    return NextResponse.json({
      message: "If this email exists, a reset code has been sent.",
    });

  } catch (err) {
    console.error("Forgot password error:", err);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}