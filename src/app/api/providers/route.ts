import { NextResponse } from "next/server";
import { connectDB } from "../../../lib/mongodb";
import User from "../../../models/User";

export async function GET(req: Request) {
  await connectDB();

  const { searchParams } = new URL(req.url);

  const service = searchParams.get("service");
  const state = searchParams.get("state");
  const area = searchParams.get("area");
  const search = searchParams.get("search");
  const availability = searchParams.get("availability");
  const sort = searchParams.get("sort");

  const query: any = {
    role: "provider",
    isSuspended: false,
    isActive: true,
  };

  /* =========================
     FILTER: SERVICES
  ========================= */
  if (service) {
    query.services = { $in: [new RegExp(service, "i")] };
  }

  /* =========================
     FILTER: LOCATION (OBJECT)
  ========================= */
  if (state) {
    query["location.state"] = state;
  }

  if (area) {
    query["location.area"] = area;
  }

  /* =========================
     FILTER: AVAILABILITY
  ========================= */
  if (availability) {
    query.availability = availability;
  }

  /* =========================
     SEARCH (NAME + SERVICES)
  ========================= */
  if (search) {
    query.$or = [
      { firstName: { $regex: search, $options: "i" } },
      { lastName: { $regex: search, $options: "i" } },
      { services: { $in: [new RegExp(search, "i")] } },
    ];
  }

  /* =========================
     SORTING
  ========================= */
  let sortOption: any = { createdAt: -1 };

  if (sort === "rating") sortOption = { averageRating: -1 };
  if (sort === "reviews") sortOption = { totalReviews: -1 };

  const providers = await User.find(query)
    .select(
      "firstName lastName services location availability averageRating totalReviews providerProfilePhoto businessName"
    )
    .sort(sortOption)
    .limit(50);

  return NextResponse.json(providers);
}