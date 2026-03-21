import { NextResponse } from "next/server";
import { connectDB } from "../../../lib/mongodb";
import Job from "../../../models/Jobs";
import Payment from "../../../models/Payment";
import Review from "../../../models/Review";
import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/route";

export async function GET() {
  await connectDB();

  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const customerId = session.user.id;

  /* ==================== */
  /* 💸 Spending          */
  /* ==================== */
  const payments = await Payment.find({ customerId });

  const totalSpent = payments.reduce((sum, p) => sum + (p.amount ?? 0), 0);

  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const monthSpent = payments
    .filter((p) => p.createdAt >= firstDayOfMonth)
    .reduce((sum, p) => sum + (p.amount ?? 0), 0);

  /* ==================== */
  /* 📊 Jobs Stats        */
  /* ==================== */
  const activeJobs = await Job.countDocuments({
    customerId,
    status: "ACTIVE",
  });

  const pendingJobs = await Job.countDocuments({
    customerId,
    status: "PENDING",
  });

  const completedJobs = await Job.countDocuments({
    customerId,
    status: "COMPLETED",
  });

  /* ==================== */
  /* ⭐ Reviews Given     */
  /* ==================== */
  const reviews = await Review.find({ customerId });

  const reviewsGiven = reviews.length;

  /* ==================== */
  /* 📝 Recent Activity   */
  /* ==================== */
  const activity: any[] = [];

  // Payments (spending)
  payments
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 3)
    .forEach((p) => {
      activity.push({
        title: "Payment made",
        subtitle: p.jobTitle ?? "Service payment",
        amount: `-$${p.amount ?? 0}`,
        createdAt: p.createdAt,
      });
    });

  // Jobs
  const recentJobs = await Job.find({ customerId })
    .sort({ createdAt: -1 })
    .limit(3);

  recentJobs.forEach((job) => {
    activity.push({
      title:
        job.status === "PENDING"
          ? "Requested a job"
          : job.status === "ACTIVE"
          ? "Job in progress"
          : "Job completed",
      subtitle: job.title ?? "No title",
      createdAt: job.createdAt,
    });
  });

  const recentActivity = activity
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5);

  /* ==================== */
  /* 📈 Spending Chart    */
  /* ==================== */
  const spendingChart = Array.from({ length: 7 }).map((_, i) => {
    const day = new Date();
    day.setDate(day.getDate() - i);

    const dayPayments = payments.filter(
      (p) =>
        p.createdAt.getDate() === day.getDate() &&
        p.createdAt.getMonth() === day.getMonth() &&
        p.createdAt.getFullYear() === day.getFullYear()
    );

    return {
      date: day.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      spent: dayPayments.reduce((sum, p) => sum + (p.amount ?? 0), 0),
      transactions: dayPayments.length,
    };
  }).reverse();

  /* ==================== */
  /* ✅ Response          */
  /* ==================== */
  return NextResponse.json({
    totalSpent,
    monthSpent,
    activeJobs,
    pendingJobs,
    completedJobs,
    reviewsGiven,
    recentActivity,
    spendingChart,
  });
}