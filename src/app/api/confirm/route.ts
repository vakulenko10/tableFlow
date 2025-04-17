import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const token = body.token;

  if (!token) {
    return new Response(JSON.stringify({ status: "error", message: "Token missing" }), {
      status: 400,
    });
  }

  const reservation = await prisma.reservation.findUnique({
    where: { token },
  });

  if (!reservation) {
    return new Response(JSON.stringify({ status: "error", message: "Invalid token" }), {
      status: 404,
    });
  }

  const now = new Date();
  const createdAt = new Date(reservation.createdAt);
  const minutesPassed = (now.getTime() - createdAt.getTime()) / 1000 / 60;

  if (minutesPassed > 15 && reservation.status === "PENDING") {
    await prisma.reservation.update({
      where: { token },
      data: { status: "CANCELLED" },
    });

    return new Response(JSON.stringify({ status: "expired" }), { status: 200 });
  }

  if (reservation.status === "PENDING") {
    await prisma.reservation.update({
      where: { token },
      data: { status: "CONFIRMED" },
    });
  }

  return new Response(JSON.stringify({ status: "confirmed" }), { status: 200 });
}
