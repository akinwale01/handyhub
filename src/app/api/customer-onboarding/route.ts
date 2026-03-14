import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import { connectDB } from "../../../lib/mongodb";
import User from "../../../models/User";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();

    const {
      firstName,
      lastName,
      phone,
      address,
      location,
      avatarUrl, // DiceBear URL from frontend
    } = body;

    if (!avatarUrl) {
      return NextResponse.json(
        { error: "Avatar selection required" },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findOne({
      email: session.user.email,
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Upload remote avatar URL to Cloudinary
    const upload = await cloudinary.uploader.upload(
      avatarUrl,
      {
        folder: "customers/avatars",
      }
    );

    user.firstName = firstName;
    user.lastName = lastName;
    user.phone = phone;
    user.address = address;
    user.location = location;

    user.avatar = {
      url: upload.secure_url,
      publicId: upload.public_id,
    };

    user.onboardingStep = "done";
    user.profileCompleted = true;

    await user.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Customer onboarding error:", error);

    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}