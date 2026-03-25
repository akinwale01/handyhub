import NextAuth, { AuthOptions, DefaultSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import jwt from "jsonwebtoken";
import { connectDB } from "../../../../lib/mongodb";
import User from "../../../../models/User";

/* =========================
   TYPE EXTENSIONS
========================= */

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
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
    };
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
  }
}

/* =========================
   AUTH OPTIONS
========================= */

export const authOptions: AuthOptions = {
  providers: [
    /* -------------------------
       GOOGLE OAUTH
    -------------------------- */
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    /* -------------------------
       OTP LOGIN VIA JWT TOKEN
    -------------------------- */
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        token: { label: "Token", type: "text" },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.token) return null;

        await connectDB();

        const user = await User.findOne({ email: credentials.email });
        if (!user) return null;

        try {
          const decoded = jwt.verify(
            credentials.token,
            process.env.NEXTAUTH_SECRET!
          ) as any;

          if (decoded.email !== user.email) return null;
        } catch {
          return null;
        }

        if (!user.emailVerified) return null;

        return user;
      },
    }),
  ],

  /* =========================
     EVENTS
  ========================== */
  events: {
    async signOut({ token }) {
      if (!token?.email) return;
      await connectDB();
      await User.findOneAndUpdate({ email: token.email }, { isOnline: false });
    },
  },

  /* =========================
     CALLBACKS
  ========================== */
  callbacks: {
    /* -------------------------
       GOOGLE SIGN-IN HANDLER
    -------------------------- */
    async signIn({ user, account }) {
      try {
        await connectDB();

        if (account?.provider === "google") {
          let dbUser = await User.findOne({ email: user.email });

          if (!dbUser) {
            // NEW USER → onboarding
            dbUser = await User.create({
              email: user.email,
              googleId: user.id,
              emailVerified: true,
              role: null,
              onboardingStep: "role",
              profileCompleted: false,
              firstName: user.name?.split(" ")[0] || "",
              lastName: user.name?.split(" ").slice(1).join(" ") || "",
            });
          } else {
            // EXISTING USER → mark online
            dbUser.isOnline = true;
            await dbUser.save();
          }
        }

        return true;
      } catch (error) {
        console.error("NextAuth signIn error:", error);
        return false;
      }
    },



    /* -------------------------
       JWT SESSION PIPELINE
    -------------------------- */
    async jwt({ token, user, trigger }) {
      await connectDB();

      // FIRST LOGIN
      if (user) {
        const dbUser = await User.findOne({ email: user.email });
        if (!dbUser) return token;

        dbUser.isOnline = true;
        await dbUser.save();

        token.id = dbUser._id.toString();
        token.email = dbUser.email;
        token.role = dbUser.role ?? null;
        token.onboardingStep = dbUser.onboardingStep ?? "role";
        token.profileCompleted = dbUser.profileCompleted ?? false;
        token.emailVerified = dbUser.emailVerified ?? false;
        token.firstName = dbUser.firstName ?? "";
        token.lastName = dbUser.lastName ?? "";
        token.unreadNotifications = dbUser.unreadNotifications ?? 0;

        token.image =
          dbUser.role === "provider"
            ? dbUser.providerProfilePhoto?.url ?? undefined
            : dbUser.avatar?.url ?? undefined;

        token.isOnline = dbUser.isOnline ?? false;

        return token;
      }

      // HANDLES SESSION UPDATE
      if (trigger === "update" && token.email) {
        const dbUser = await User.findOne({ email: token.email });

        if (dbUser) {
          token.id = dbUser._id.toString();
          token.role = dbUser.role ?? null;
          token.onboardingStep = dbUser.onboardingStep ?? "role";
          token.profileCompleted = dbUser.profileCompleted ?? false;
          token.emailVerified = dbUser.emailVerified ?? false;
          token.firstName = dbUser.firstName ?? "";
          token.lastName = dbUser.lastName ?? "";
          token.unreadNotifications = dbUser.unreadNotifications ?? 0;

          token.image =
            dbUser.role === "provider"
              ? dbUser.providerProfilePhoto?.url ?? undefined
              : dbUser.avatar?.url ?? undefined;

          token.isOnline = dbUser.isOnline ?? false; // ✅ KEEP THIS
        }

        return token;
      }



      // REFRESH / PAGE RELOAD SYNC
      if (!token.email) return token;

      const dbUser = await User.findOne({ email: token.email });
      if (!dbUser) return token;

      token.id = dbUser._id.toString();
      token.role = dbUser.role ?? null;
      token.onboardingStep = dbUser.onboardingStep ?? "role";
      token.profileCompleted = dbUser.profileCompleted ?? false;
      token.emailVerified = dbUser.emailVerified ?? false;
      token.firstName = dbUser.firstName ?? "";
      token.lastName = dbUser.lastName ?? "";
      token.unreadNotifications = dbUser.unreadNotifications ?? 0;

      token.image =
        dbUser.role === "provider"
          ? dbUser.providerProfilePhoto?.url ?? undefined
          : dbUser.avatar?.url ?? undefined;

      token.isOnline = dbUser.isOnline ?? false;

      return token;
    },

    /* -------------------------
       SESSION OBJECT
    -------------------------- */
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role ?? null;
        session.user.onboardingStep = token.onboardingStep as
          | "role"
          | "profile"
          | "done";
        session.user.profileCompleted = token.profileCompleted ?? false;
        session.user.emailVerified = token.emailVerified ?? false;
        session.user.firstName = token.firstName ?? "";
        session.user.lastName = token.lastName ?? "";
        session.user.image = token.image ?? undefined;
        session.user.isOnline = token.isOnline ?? false;
        session.user.unreadNotifications = token.unreadNotifications ?? 0;

        session.user.name = `${session.user.firstName} ${session.user.lastName}`.trim();
      }

      return session;
    },
  },

  /* =========================
     CUSTOM PAGES
  ========================== */
  pages: {
    signIn: "/auth/signup",
  },

  /* =========================
     SESSION
  ========================== */
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };