import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import {connectDB} from "../../../../lib/mongodb";
import Notification from "../../../../models/Notification";
import User from "../../../../models/User"
import { authOptions } from "../../../api/auth/[...nextauth]/route";

export async function PATCH() {
  await connectDB();

  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({}, { status: 401 });

  await Notification.updateMany(
    { userId: session.user.id, read: false },
    { read: true }
  );

  await User.findByIdAndUpdate(session.user.id, {
    unreadNotifications: 0,
  });

  return NextResponse.json({ success: true });
}