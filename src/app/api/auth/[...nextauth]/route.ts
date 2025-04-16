import NextAuth from "next-auth";
// import GoogleProvider from "next-auth/providers/google";
import { authConfig } from "@/lib/auth.config";

const handler = NextAuth(authConfig);

export { handler as GET, handler as POST };