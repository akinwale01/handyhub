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

  const providerId = session.user.id;

  /* ==================== */
  /* 💰 Payments & Balance */
  /* ==================== */
  const payments = await Payment.find({ providerId });

  const balance = payments.reduce((sum, p) => sum + (p.amount ?? 0), 0);

  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const monthEarnings = payments
    .filter((p) => p.createdAt >= firstDayOfMonth)
    .reduce((sum, p) => sum + (p.amount ?? 0), 0);

  /* ==================== */
  /* 📊 Jobs Stats        */
  /* ==================== */
  const activeJobs = await Job.countDocuments({ providerId, status: "ACTIVE" });
  const pendingRequests = await Job.countDocuments({ providerId, status: "PENDING" });
  const completed = await Job.countDocuments({ providerId, status: "COMPLETED" });

  /* ==================== */
  /* ⭐ Reviews & Rating  */
  /* ==================== */
  const reviews = await Review.find({ providerId });
  const rating =
    reviews.length === 0
      ? 0
      : reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  /* ==================== */
  /* 📝 Recent Activity   */
  /* ==================== */
  type ActivityItem = {
    title: string;
    subtitle: string;
    amount?: string;
    createdAt: Date;
  };
  const activity: ActivityItem[] = [];

  // Recent payments
  payments
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 3)
    .forEach((p) => {
      activity.push({
        title: "Payment received",
        subtitle: p.jobTitle ?? "Completed job",
        amount: `+$${p.amount ?? 0}`,
        createdAt: p.createdAt,
      });
    });

  // Recent jobs
  const recentJobs = await Job.find({ providerId })
    .sort({ createdAt: -1 })
    .limit(3);

  recentJobs.forEach((job) => {
    activity.push({
      title:
        job.status === "PENDING"
          ? "New job request"
          : job.status === "ACTIVE"
          ? "Job started"
          : "Job completed",
      subtitle: job.title ?? "No title",
      createdAt: job.createdAt,
    });
  });

  const recentActivity = activity
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5);

  /* ==================== */
  /* 📈 Earnings Chart    */
  /* ==================== */
  // Last 7 days earnings
  const earningsChart = Array.from({ length: 7 }).map((_, i) => {
    const day = new Date();
    day.setDate(day.getDate() - i);

    const dayPayments = payments.filter(
      (p) =>
        p.createdAt.getDate() === day.getDate() &&
        p.createdAt.getMonth() === day.getMonth() &&
        p.createdAt.getFullYear() === day.getFullYear()
    );

    return {
      date: day.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      earnings: dayPayments.reduce((sum, p) => sum + (p.amount ?? 0), 0),
      jobs: dayPayments.length,
    };
  }).reverse(); // oldest to newest

  /* ==================== */
  /* ✅ Return Response   */
  /* ==================== */
  return NextResponse.json({
    balance,
    monthEarnings,
    activeJobs,
    pendingRequests,
    completed,
    rating: Number(rating.toFixed(1)),
    recentActivity,
    earningsChart,
  });
}