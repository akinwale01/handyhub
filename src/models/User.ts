import mongoose, { Schema, models } from "mongoose";

/* =========================
   IMAGE SCHEMA
========================= */
const ImageSchema = new Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
  },
  { _id: false }
);

/* =========================
   LOCATION SCHEMA (FIXED)
========================= */
const LocationSchema = new Schema(
  {
    state: {
      type: String,
      required: true,
      index: true,
    },
    area: {
      type: String,
      required: true,
      index: true,
    },
  },
  { _id: false }
);

/* =========================
   USER SCHEMA
========================= */
const UserSchema = new Schema(
  {
    /* =========================
       CORE IDENTITY
    ========================= */
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      default: null,
    },

    googleId: {
      type: String,
      default: null,
    },

    emailVerified: {
      type: Boolean,
      default: false,
    },

    isOnline: {
      type: Boolean,
      default: false,
    },

    /* =========================
       ROLE SYSTEM
    ========================= */
    role: {
      type: String,
      enum: ["customer", "provider"],
      default: null,
      index: true,
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

    /* =========================
       BASIC PROFILE
    ========================= */
    firstName: { type: String, default: "" },
    lastName: { type: String, default: "" },
    phone: { type: String, default: "" },

    avatar: {
      type: ImageSchema,
      default: null,
    },

    /* =========================
       LOCATION
    ========================= */
    location: {
      type: LocationSchema,
      required: function (this: any): boolean {
        return this.role === "provider";
      },
      default: undefined,
    },

    /* =========================
       PROVIDER CORE
    ========================= */
    businessName: {
      type: String,
      default: "",
    },

    bio: {
      type: String,
      default: "",
    },

    services: {
      type: [String],
      default:undefined,
      validate: {
        validator: function (val: string[]) {
          if (this.role !== "provider") return true;
          return val.length > 0 && val.length <= 3;
        },
        message: "Providers must select 1 to 3 services",
      },
      index: true,
    },

    providerProfilePhoto: {
      type: ImageSchema,
      default: null,
    },

    gallery: {
      type: [ImageSchema],
      default: [],
    },

    availability: {
      type: String,
      enum: ["available", "busy", "offline"],
      default: "available",
      index: true,
    },

    /* =========================
       TRUST & QUALITY
    ========================= */
    averageRating: {
      type: Number,
      default: 0,
    },

    totalReviews: {
      type: Number,
      default: 0,
    },

    /* =========================
       CUSTOMER FEATURES
    ========================= */
    savedProviders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    recentlyViewed: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    /* =========================
       SYSTEM
    ========================= */
    unreadNotifications: {
      type: Number,
      default: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    isSuspended: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default models.User || mongoose.model("User", UserSchema);