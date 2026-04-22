import mongoose from "mongoose";

const JobSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "ACTIVE", "COMPLETED", "PENDING_COMPLETION"],
      default: "PENDING",
      index: true,
    },
    price: {
      type: Number,
      required: true,
    },

    description: String,
    location: String,
    scheduledDate: Date,
  },
  { timestamps: true }
);

export default mongoose.models.Job || mongoose.model("Job", JobSchema);