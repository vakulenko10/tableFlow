// route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { prisma } from "@/lib/db";
import { sendCancellationEmail } from "@/lib/mailer";

export async function PATCH(req: Request) {
  const session = await getServerSession(authConfig);
  const allowedAdmins = (process.env.ADMIN_EMAILS ?? "").split(",");

  if (!session || !allowedAdmins.includes(session.user?.email ?? "")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const id = body?.id;

    if (!id) {
      return NextResponse.json({ error: "Reservation ID is required" }, { status: 400 });
    }

    const reservation = await prisma.reservation.update({
      where: { id },
      data: { status: "CANCELLED" },
    });

    await sendCancellationEmail(reservation.email, reservation.id);

    return NextResponse.json({ message: "Reservation cancelled", reservation });
  } catch (error) {
    console.error("Cancel error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
