import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";

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

  // 🔥 WebSocket broadcast after confirmation
  try {
    const tables = await prisma.table.findMany({
      include: {
        reservedIn: {
          include: {
            reservation: true,
          },
        },
      },
    });

    const formattedTables = tables.map((table) => {
      const reservations = table.reservedIn.map((rt) => rt.reservation);
      const isReserved = reservations.some((res) =>
        res.status !== "CANCELLED" &&
        res.startTime <= now &&
        res.endTime >= now
      );

      return {
        id: table.id,
        label: table.label,
        x: table.x,
        y: table.y,
        width: table.width,
        height: table.height,
        capacity: table.capacity,
        reserved: isReserved,
        reservations: reservations.map((res) => ({
          id: res.id,
          startTime: res.startTime,
          endTime: res.endTime,
          status: res.status,
        })),
      };
    });

    await fetch(`${SOCKET_URL}/broadcast`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formattedTables),
    });
  } catch (error) {
    console.warn("WebSocket update failed:", error);
  }

  return new Response(JSON.stringify({ status: "confirmed" }), { status: 200 });
}
