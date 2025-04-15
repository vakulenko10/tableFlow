import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { randomUUID } from "crypto";
import { sendConfirmationEmail } from "@/lib/mailer"; // ← use nodemailer-based function

export async function POST(req: Request) {
  const body = await req.json();
  const { name, email, date, startTime, endTime, tableIds } = body;

  if (!name || !email || !date || !startTime || !endTime || !tableIds?.length) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const token = randomUUID();

  try {
    const reservation = await prisma.reservation.create({
      data: {
        name,
        email,
        token,
        date: new Date(date),
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        status: "PENDING",
        tables: {
          create: tableIds.map((id: string) => ({ tableId: id })),
        },
      },
    });

    await sendConfirmationEmail(email, token);

    return NextResponse.json({ success: true, reservationId: reservation.id });
  } catch (error) {
    console.error("Reservation failed:", error);
    return NextResponse.json({ error: "Reservation failed" }, { status: 500 });
  }
}
