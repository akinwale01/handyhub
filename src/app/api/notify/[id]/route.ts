import { NextResponse } from "next/server";
import {connectDB} from "../../../../lib/mongodb";
import Notification from "../../../../models/Notification";
import User from "../../../../models/User"

export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();

    // ✅ Await the params promise
    const { id } = await context.params;

    const notification = await Notification.findById(id);
    if (!notification) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (!notification.read) {
      notification.read = true;
      await notification.save();

      // 🔥 decrement unread count
      await User.findByIdAndUpdate(notification.userId, {
        $inc: { unreadNotifications: -1 },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to update notification" },
      { status: 500 }
    );
  }
}