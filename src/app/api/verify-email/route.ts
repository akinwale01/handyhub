import { NextResponse } from "next/server";
import { connectDB } from "../../../lib/mongodb";
import User from "../../../models/User";

export async function POST(req: Request) {
  const { token } = await req.json();

  await connectDB();

  const user = await User.findOne({
    emailVerificationToken: token,
    emailVerificationExpires: { $gt: Date.now() },
  });

  if (!user) {
    return NextResponse.json({ message: "Invalid token" }, { status: 400 });
  }

  user.emailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save();

  return NextResponse.json({ message: "Email verified successfully" });
}