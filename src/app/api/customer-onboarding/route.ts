import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import { connectDB } from "../../../lib/mongodb";
import User from "../../../models/User";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export async function POST(req: Request) {
  try {
    /* =========================
       AUTH CHECK
    ========================= */
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    /* =========================
       BODY PARSE
    ========================= */
    const body = await req.json();

    const {
      firstName,
      lastName,
      phone,
      address,
      state,
      area,
      avatarUrl,
    } = body;

    if (!avatarUrl) {
      return NextResponse.json(
        { error: "Avatar selection required" },
        { status: 400 }
      );
    }

    /* =========================
       DB CONNECT
    ========================= */
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

    /* =========================
       AVATAR UPLOAD (SAFE)
    ========================= */
    let uploadedAvatar = user.avatar;

    // Only upload if it's a DiceBear or external URL
    if (avatarUrl && avatarUrl !== user.avatar?.url) {
      try {
        const upload = await cloudinary.uploader.upload(
          avatarUrl,
          {
            folder: "customers/avatars",
          }
        );

        uploadedAvatar = {
          url: upload.secure_url,
          publicId: upload.public_id,
        };
      } catch (err) {
        console.error("Cloudinary upload failed:", err);
        return NextResponse.json(
          { error: "Avatar upload failed" },
          { status: 500 }
        );
      }
    }

    /* =========================
       UPDATE USER
    ========================= */
    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.phone = phone || "";
    user.address = address || "";

    user.location = {
      state: state || "",
      area: area || "",
    };

    user.avatar = uploadedAvatar;

    user.onboardingStep = "done";
    user.profileCompleted = true;

    await user.save();

    /* =========================
       RESPONSE
    ========================= */
    return NextResponse.json({
      success: true,
    });

  } catch (error) {
    console.error("Customer onboarding error:", error);

    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}