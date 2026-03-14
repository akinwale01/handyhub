import mongoose, { Schema, models } from "mongoose";

const OtpSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    otp: {
      type: String,
      required: true,
    },

    expiresAt: {
      type: Date,
      required: true,
    },

  type: {
  type: String,
  enum: ["signup", "reset"],
  required: true,
},

  },
  { timestamps: true }
);

OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default models.Otp || mongoose.model("Otp", OtpSchema);