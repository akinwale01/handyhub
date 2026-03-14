import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      role?: "customer" | "provider" | null;
      emailVerified: boolean;
      profileCompleted: boolean;
      firstName: string;
      lastName: string;
      image?: string;
      isOnline?: boolean;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: "customer" | "provider" | null;
    emailVerified?: boolean;
    profileCompleted?: boolean;
    firstName?: string;
    lastName?: string;
    image?: string;
    isOnline?: boolean;
  }
}