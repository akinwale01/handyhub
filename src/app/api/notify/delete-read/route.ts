import { NextResponse } from "next/server";
import { connectDB } from "../../../../lib/mongodb";
import Notification from "../../../../models/Notification";

export async function DELETE() {
  try {
    await connectDB();
    const result = await Notification.deleteMany({ read: true });
    return NextResponse.json({ success: true, deletedCount: result.deletedCount });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to delete read notifications" }, { status: 500 });
  }
}