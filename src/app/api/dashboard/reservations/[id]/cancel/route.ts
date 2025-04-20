import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { prisma } from "@/lib/db";
import { sendCancellationEmail } from "@/lib/mailer";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authConfig);
  const allowedAdmins = (process.env.ADMIN_EMAILS ?? "").split(",");

  if (!session || !allowedAdmins.includes(session.user?.email ?? "")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const reservation = await prisma.reservation.update({
      where: { id: params.id },
      data: { status: "CANCELLED" },
    });

    await sendCancellationEmail(reservation.email, reservation.id);

    return NextResponse.json({ message: "Reservation cancelled", reservation });
  } catch (error) {
    console.error("Cancel error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
