import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username: string;
      role: string;
      subscribed: boolean;
      preferredLanguage: string;
    } & DefaultSession["user"];
  }

  interface User {
    username?: string;
    role?: string;
    subscribed?: boolean;
    preferredLanguage?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    username: string;
    role: string;
  }
}
