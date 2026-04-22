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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();

    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const phone = formData.get("phone") as string;
    const address = formData.get("address") as string;

    const state = formData.get("state") as string;
    const area = formData.get("area") as string;

    const businessName = formData.get("businessName") as string;
    const services = JSON.parse(formData.get("services") as string);
    const pricing = JSON.parse(formData.get("pricing") as string);
    const bio = formData.get("bio") as string;

    const profilePhoto = formData.get("profilePhoto");

    if (!(profilePhoto instanceof File)) {
      return NextResponse.json({ error: "Profile photo is required" }, { status: 400 });
    }

    if (!services || services.length === 0) {
      return NextResponse.json({ error: "Select at least one service" }, { status: 400 });
    }

    if (!state || !area) {
      return NextResponse.json({ error: "Location is required" }, { status: 400 });
    }

    await connectDB();

    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const bytes = await profilePhoto.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const upload = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ folder: "providers/profile" }, (error, result) => {
          if (error) reject(error);
          else resolve(result);
        })
        .end(buffer);
    });

    await User.findByIdAndUpdate(user._id, {
      firstName,
      lastName,
      phone,
      address,

      location: {
        state,
        area,
      },

      businessName,
      bio,
      services,
      pricing, // 🔥 NOW SAVED

      providerProfilePhoto: {
        url: upload.secure_url,
        publicId: upload.public_id,
      },

      role: "provider",
      onboardingStep: "done",
      profileCompleted: true,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Provider onboarding error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}