import { prisma } from "@/lib/db";
import { authConfig } from "@/lib/auth.config";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

// Use this type instead of raw `{ params: { id: string } }`
type Context = {
  params: {
    id: string;
  };
};

export async function POST(req: NextRequest, context: Context) {
  const session = await getServerSession(authConfig);
  const allowedAdmins = (process.env.ADMIN_EMAILS ?? "").split(",");

  if (!session || !allowedAdmins.includes(session.user?.email ?? "")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const reservationId = context.params.id;

  await prisma.reservation.update({
    where: { id: reservationId },
    data: { status: "CANCELLED" },
  });

  return NextResponse.json({ success: true });
}
