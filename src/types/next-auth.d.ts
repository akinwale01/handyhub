import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "customer" | "provider" | null;
      onboardingStep: "role" | "profile" | "done";
      profileCompleted: boolean;
      emailVerified: boolean;
      firstName: string;
      lastName: string;
      image?: string;
      isOnline: boolean;
      unreadNotifications: number;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: "customer" | "provider" | null;
    onboardingStep?: "role" | "profile" | "done";
    profileCompleted?: boolean;
    emailVerified?: boolean;
    firstName?: string;
    lastName?: string;
    image?: string | null;
    isOnline?: boolean;
    unreadNotifications?: number;
  }
}