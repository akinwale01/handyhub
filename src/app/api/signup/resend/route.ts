import { NextResponse } from "next/server";
import { connectDB } from "../../../../lib/mongodb";
import Otp from "../../../../models/Otp";
import { generateOtp } from "../../../../lib/generateOtp";
import { sendOtpEmail } from "../../../../lib/mailer";
import { checkRateLimit } from "../../../../lib/rateLimit";

export async function POST(req: Request) {
  const { email } = await req.json();
  await connectDB();

  await Otp.deleteMany({ email });

  const otp = generateOtp();

  const ip = req.headers.get("x-forwarded-for") || "unknown";

if (!checkRateLimit(ip)) {
  return NextResponse.json(
    { message: "Too many requests. Try again later." },
    { status: 429 }
  );
}

  await Otp.create({
    email,
    otp,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000),
  });

    await sendOtpEmail(email, otp);
  
    return NextResponse.json({ success: true });
  }