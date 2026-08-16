import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        otp: { label: "One-time code", type: "text" },
      },
      authorize: async (credentials) => {
        const email = credentials?.email;
        const password = credentials?.password;
        const otp = credentials?.otp;

        if (typeof email !== "string") return null;

        const user = await prisma.user.findUnique({
          where: { email: email.toLowerCase() },
        });
        if (!user || !user.emailVerified) return null;

        if (typeof otp === "string" && otp.length > 0) {
          const otpRow = await prisma.otpCode.findFirst({
            where: { userId: user.id, purpose: "login" },
            orderBy: { createdAt: "desc" },
          });
          if (!otpRow || otpRow.code !== otp || otpRow.expiresAt < new Date()) {
            return null;
          }
          await prisma.otpCode.deleteMany({
            where: { userId: user.id, purpose: "login" },
          });
        } else if (typeof password === "string") {
          const valid = await bcrypt.compare(password, user.passwordHash);
          if (!valid) return null;
        } else {
          return null;
        }

        return {
          id: user.id,
          name: user.name ?? user.email,
          role: user.role,
          subscribed: user.subscribed,
        };
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id!;
        token.role = user.role ?? "user";
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;

        // Re-read subscribed status on every session check so admin changes
        // take effect immediately, without waiting for the JWT to expire.
        const freshUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { subscribed: true, preferredLanguage: true },
        });
        session.user.subscribed = freshUser?.subscribed ?? false;
        session.user.preferredLanguage = freshUser?.preferredLanguage ?? "English";
      }
      return session;
    },
  },
});
