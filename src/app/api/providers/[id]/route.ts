import { NextResponse } from "next/server";
import { connectDB } from "../../../../lib/mongodb";
import User from "../../../../models/User";
import Job from "../../../../models/Jobs";
import Review from "../../../../models/Review";

/* =========================
   GET SINGLE PROVIDER PROFILE
========================= */
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  await connectDB();

  const providerId = params.id;

  if (!providerId) {
    return NextResponse.json(
      { error: "Provider ID is required" },
      { status: 400 }
    );
  }

  /* =========================
     FETCH PROVIDER
  ========================= */
  const provider = await User.findOne({
    _id: providerId,
    role: "provider",
  }).select(
    "firstName lastName skills services location availability averageRating totalReviews providerProfilePhoto businessName bio createdAt"
  );

  if (!provider) {
    return NextResponse.json(
      { error: "Provider not found" },
      { status: 404 }
    );
  }

  /* =========================
     JOB STATS
  ========================= */
  const jobs = await Job.find({ providerId });

  const activeJobs = jobs.filter((j) => j.status === "ACTIVE").length;
  const completedJobs = jobs.filter((j) => j.status === "COMPLETED").length;
  const pendingJobs = jobs.filter((j) => j.status === "PENDING").length;

  /* =========================
     RECENT JOBS (FOR MODAL UI)
  ========================= */
  const recentJobs = await Job.find({ providerId })
    .sort({ createdAt: -1 })
    .limit(5)
    .select("title status location createdAt description");

  /* =========================
     REVIEWS PREVIEW
  ========================= */
  const reviews = await Review.find({ providerId })
    .sort({ createdAt: -1 })
    .limit(5)
    .select("rating comment customerName createdAt");

  const rating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  /* =========================
     RESPONSE OBJECT
  ========================= */
  return NextResponse.json({
    provider: {
      id: provider._id,
      name: `${provider.firstName} ${provider.lastName}`,
      businessName: provider.businessName,
      services: provider.services,
      location: provider.location,
      availability: provider.availability,
      bio: provider.bio,
      profilePhoto: provider.providerProfilePhoto,
      rating: Number(rating.toFixed(1)),
      totalReviews: reviews.length,
      joinedAt: provider.createdAt,
    },

    stats: {
      activeJobs,
      pendingJobs,
      completedJobs,
    },

    recentJobs,
    reviews,
  });
}