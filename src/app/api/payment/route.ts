import { NextResponse } from "next/server";
import {connectDB} from "../../../lib/mongodb";
import Payment from "../../../models/Payment";
import Notification from "../../../models/Notification";
import User from "../../../models/User";

export async function POST(req: Request) {
  await connectDB();

  const { customerId, providerId, jobId, amount, jobTitle } =
    await req.json();

  const payment = await Payment.create({
    customerId,
    providerId,
    jobId,
    amount,
    jobTitle,
  });

  // 🔥 NOTIFY PROVIDER
  await Notification.create({
    userId: providerId.toString(),
    message: `Payment received for ${jobTitle} 💰`,
  });

  await User.findByIdAndUpdate(providerId, {
    $inc: { unreadNotifications: 1 },
  });

    await Notification.create({
    userId: customerId.toString(),
    message: "Your job has been accepted ✅",
    });

    await User.findByIdAndUpdate(customerId, {
    $inc: { unreadNotifications: 1 },
    });

  return NextResponse.json(payment);
}