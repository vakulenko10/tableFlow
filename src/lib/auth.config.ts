import GoogleProvider from "next-auth/providers/google";
import type { NextAuthOptions } from "next-auth";
const allowedAdmins = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((email) => email.trim());
export const authConfig: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
        return allowedAdmins.includes(user.email ?? "");
    },
    async session({ session }) {
      return session;
    },
  },
};