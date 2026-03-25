import { NextResponse } from "next/server";
import {connectDB} from "../../../../lib/mongodb";
import Notification from "../../../../models/Notification";
import User from "../../../../models/User"

export async function POST(req: Request) {
  try {
    await connectDB();

    const { userId, message } = await req.json();

    const notification = await Notification.create({
      userId,
      message,
    });

    // 🔥 INCREMENT unread count
    await User.findByIdAndUpdate(userId, {
      $inc: { unreadNotifications: 1 },
    });

    return NextResponse.json(notification);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create notification" },
      { status: 500 }
    );
  }
}