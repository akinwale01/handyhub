import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { connectDB } from "../../../lib/mongodb";
import Job from "../../../models/Jobs";
import Notification from "../../../models/Notification";
import User from "../../../models/User";

/* =========================
   CREATE JOB
========================= */
export async function POST(req: Request) {
  await connectDB();

  const { customerId, providerId, title, price, description, location } =
    await req.json();

  const job = await Job.create({
    customerId,
    providerId,
    title,
    price,
    description,
    location,
    status: "PENDING",
  });

  await Notification.create({
    userId: providerId,
    message: `New job request: ${title}`,
  });

  await User.findByIdAndUpdate(providerId, {
    $inc: { unreadNotifications: 1 },
  });

  return NextResponse.json(job);
}

/* =========================
   GET JOBS (ROLE BASED)
========================= */
export async function GET(req: Request) {
  await connectDB();

  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const { searchParams } = new URL(req.url);

  const status = searchParams.get("status");
  const role = searchParams.get("role"); // provider | customer

  const query: any = {};

  if (role === "customer") query.customerId = userId;
  else query.providerId = userId;

  if (status) query.status = status;

  const jobs = await Job.find(query)
    .sort({ createdAt: -1 })
    .populate("customerId providerId", "firstName lastName category");

  return NextResponse.json(jobs);
}

/* =========================
   PATCH JOB (STATE MACHINE + NOTIFICATIONS)
========================= */
export async function PATCH(req: Request) {
  await connectDB();

  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  const { jobId, action } = await req.json();

  const job = await Job.findById(jobId);

  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  const isCustomer = job.customerId.toString() === userId;
  const isProvider = job.providerId.toString() === userId;

  if (!isCustomer && !isProvider) {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  }

  /* =========================
     STATE MACHINE
  ========================= */
  const transitions: Record<
    string,
    { from: string[]; to: string; role: "customer" | "provider" }
  > = {
    ACCEPT: {
      from: ["PENDING"],
      to: "ACTIVE",
      role: "provider",
    },
    REQUEST_COMPLETION: {
      from: ["ACTIVE"],
      to: "PENDING_COMPLETION",
      role: "provider",
    },
    CONFIRM_COMPLETION: {
      from: ["PENDING_COMPLETION"],
      to: "COMPLETED",
      role: "customer",
    },
  };

  const transition = transitions[action];

  if (!transition) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  /* =========================
     ROLE CHECK
  ========================= */
  if (transition.role === "provider" && !isProvider) {
    return NextResponse.json(
      { error: "Only provider can perform this action" },
      { status: 403 }
    );
  }

  if (transition.role === "customer" && !isCustomer) {
    return NextResponse.json(
      { error: "Only customer can perform this action" },
      { status: 403 }
    );
  }

  /* =========================
     STATE VALIDATION
  ========================= */
  if (!transition.from.includes(job.status)) {
    return NextResponse.json(
      {
        error: `Cannot perform ${action} from status ${job.status}`,
      },
      { status: 400 }
    );
  }

  /* =========================
     UPDATE JOB
  ========================= */
  job.status = transition.to;
  await job.save();

  /* =========================
     NOTIFICATIONS SYSTEM
  ========================= */

  const notify = async (userId: string, message: string) => {
    await Notification.create({
      userId,
      message,
    });

    await User.findByIdAndUpdate(userId, {
      $inc: { unreadNotifications: 1 },
    });
  };

  if (action === "ACCEPT") {
    await notify(job.customerId, `Provider accepted your job "${job.title}"`);
  }

  if (action === "REQUEST_COMPLETION") {
    await notify(
      job.customerId,
      `Provider marked "${job.title}" as completed`
    );
  }

  if (action === "CONFIRM_COMPLETION") {
    await notify(job.providerId, `Job "${job.title}" fully completed`);

    // optional future hook:
    // trigger payment release here
  }

  return NextResponse.json(job);
}