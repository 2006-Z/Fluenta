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
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const username = credentials?.username;
        const password = credentials?.password;

        if (typeof username !== "string" || typeof password !== "string") {
          return null;
        }

        const user = await prisma.user.findUnique({ where: { username } });
        console.log("[auth][debug]", {
          username,
          found: !!user,
          emailVerified: user?.emailVerified,
          hashPrefix: user?.passwordHash?.slice(0, 7),
        });
        if (!user) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        console.log("[auth][debug] password valid:", valid);
        if (!valid) return null;

        if (!user.emailVerified) return null;

        return {
          id: user.id,
          name: user.name ?? user.username,
          username: user.username,
          role: user.role,
          subscribed: user.subscribed,
        };
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id;
        token.username = user.username as string;
        token.role = user.role ?? "user";
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
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
