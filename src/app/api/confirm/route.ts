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
    include: {
      tables: true, // Include related tables
    },
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

  // 🔥 Notify only affected tables via /update-table
  try {
    for (const tableRef of reservation.tables) {
      const table = await prisma.table.findUnique({
        where: { id: tableRef.tableId },
        include: {
          reservedIn: {
            include: {
              reservation: true,
            },
          },
        },
      });

      if (!table) continue;

      const formattedTable = {
        id: table.id,
        label: table.label,
        x: table.x,
        y: table.y,
        width: table.width,
        height: table.height,
        capacity: table.capacity,
        reservations: table.reservedIn.map((rt) => ({
          id: rt.reservation.id,
          startTime: rt.reservation.startTime,
          endTime: rt.reservation.endTime,
          status: rt.reservation.status,
        })),
      };

      await fetch(`${SOCKET_URL}/update-table`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formattedTable),
      });
    }
  } catch (error) {
    console.warn("WebSocket update failed:", error);
  }

  return new Response(JSON.stringify({ status: "confirmed" }), { status: 200 });
}
