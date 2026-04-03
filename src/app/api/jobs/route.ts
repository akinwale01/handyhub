import { NextResponse } from "next/server";
import {connectDB} from "../../../lib/mongodb";
import Job from "../../../models/Jobs";
import Notification from "../../../models/Notification";
import User from "../../../models/User";

export async function POST(req: Request) {
  await connectDB();

  const { customerId, providerId, title, price } = await req.json();

  const job = await Job.create({
    customerId,
    providerId,
    title,
    price,
  });

  // 🔥 CREATE NOTIFICATION
  await Notification.create({
    userId: providerId.toString(),
    message: `New job request: ${title}`,
  });

  // 🔥 INCREMENT unread count
  await User.findByIdAndUpdate(providerId, {
    $inc: { unreadNotifications: 1 },
  });

  return NextResponse.json(job);
}