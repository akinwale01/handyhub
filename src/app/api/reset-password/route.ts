import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { connectDB } from "../../../lib/mongodb";
import User from "../../../models/User";

const passwordRegex =
  /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export async function POST(req: Request) {
  try {
    const { resetToken, password } = await req.json();

    if (!resetToken || !password) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    // 🔐 Validate password strength
    if (!passwordRegex.test(password)) {
      return NextResponse.json(
        {
          message:
            "Password must be at least 8 characters long, include one uppercase letter, one number, and one special character.",
        },
        { status: 400 }
      );
    }

    // 🔐 Verify reset token
    let decoded: any;

    try {
      decoded = jwt.verify(
        resetToken,
        process.env.NEXTAUTH_SECRET!
      );
    } catch (err) {
      return NextResponse.json(
        { message: "Invalid or expired reset session" },
        { status: 401 }
      );
    }

    if (decoded.purpose !== "reset") {
      return NextResponse.json(
        { message: "Invalid reset token" },
        { status: 401 }
      );
    }

    await connectDB();

    const user = await User.findOne({ email: decoded.email });

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    // 🔐 Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    await user.save();

    return NextResponse.json({
      message: "Password updated successfully",
    });

  } catch (err) {
    console.error("Reset password error:", err);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}