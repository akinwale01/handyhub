import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../api/auth/[...nextauth]/route"; // adjust path if needed
import { connectDB } from "../../../lib/mongodb";
import User from "../../../models/User";

export async function POST(req: Request) {
  try {
    // Connect to MongoDB
    await connectDB();

    // Get session if user logged in via NextAuth (Google)
    const session = await getServerSession(authOptions);

    const body = await req.json();
    const { email, role } = body;

    // Check role is valid
    if (!role || !["customer", "provider"].includes(role)) {
      return NextResponse.json(
        { message: "Invalid role" },
        { status: 400 }
      );
    }

    // Determine email: either from session (Google) or request body (email/password)
    const userEmail = session?.user?.email || email;
    if (!userEmail) {
      return NextResponse.json(
        { message: "Email not found" },
        { status: 400 }
      );
    }

    // Update user
    const user = await User.findOneAndUpdate(
      { email: userEmail },
      { role, onboardingStep: "profile" }, // move to next onboarding step
      { new: true }
    );

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, role: user.role });
  } catch (err) {
    console.error("Set role error:", err);
    return NextResponse.json(
      { message: "Failed to set role" },
      { status: 500 }
    );
  }
}