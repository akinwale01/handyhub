import mongoose, { Schema, models } from "mongoose";

/**
 * Reusable image sub-schema
 */
const ImageSchema = new Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
  },
  { _id: false }
);

const UserSchema = new Schema(
  {
    // =========================
    // Core identity
    // =========================
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      default: null, // null for OAuth users
    },

    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },

    passwordResetToken: String,
    passwordResetExpires: Date,

    googleId: {
      type: String,
      default: null,
    },

    isOnline: {
    type: Boolean,
    default: false,
    },

    emailVerified: {
      type: Boolean,
      default: false,
    },

    emailVerificationToken: String,
    emailVerificationExpires: Date,

    // =========================
    // Role & onboarding
    // =========================
    role: {
      type: String,
      enum: ["customer", "provider"],
      default: null, // must be chosen
    },

    onboardingStep: {
      type: String,
      enum: ["role", "profile", "done"],
      default: "role",
    },

    profileCompleted: {
      type: Boolean,
      default: false,
    },

    // =========================
    // Shared profile (customer + provider)
    // =========================
    firstName: {
      type: String,
      trim: true,
      default: "",
    },

    lastName: {
      type: String,
      trim: true,
      default: "",
    },

    phone: {
      type: String,
      trim: true,
      default: "",
    },

    address: {
      type: String,
      trim: true,
      default: "",
    },

    location: {
      type: String,
      trim: true,
      default: "",
    },

    avatar: {
      type: ImageSchema,
      default: null, // customer avatar (optional)
    },

    // =========================
    // Provider profile (only if role === provider)
    // =========================
    businessName: {
      type: String,
      trim: true,
      default: "",
    },

    category: {
      type: String,
      trim: true,
      default: "",
    },

    bio: {
      type: String,
      trim: true,
      default: "",
    },

    providerProfilePhoto: {
      type: ImageSchema,
      default: null, // REQUIRED during provider onboarding
    },

    businessImage: {
      type: ImageSchema,
      default: null, // optional
    },

    gallery: {
      type: [ImageSchema],
      default: [],
    },

    services: {
      type: [String],
      default: [],
    },

    availability: {
      type: String,
      trim: true,
      default: "",
    },

    providerVerified: {
      type: Boolean,
      default: false,
    },

    idVerificationStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default models.User || mongoose.model("User", UserSchema);