import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getServerSession(authConfig);

  if (!session) {
    redirect("/api/auth/signin");
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <p>Welcome, {session.user?.email}</p>
    </div>
  );
}