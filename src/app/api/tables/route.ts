import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/tables
 * Returns all tables with their current and future reservation status
 */
export async function GET() {
  const now = new Date();

  // Fetch tables with reservations that are either ongoing or in the future
  const tables = await prisma.table.findMany({
    include: {
      reservedIn: {
        where: {
          reservation: {
            status: "CONFIRMED",
            OR: [
              {
                startTime: { lte: now },
                endTime: { gt: now },
              }, // Currently active
              {
                startTime: { gt: now },
              }, // Future
            ],
          },
        },
        include: {
          reservation: true,
        },
      },
    },
  });

  // Format data for frontend
  const formattedTables = tables.map((table) => {
    const activeNow = table.reservedIn.some(
      (rt) =>
        new Date(rt.reservation.startTime) <= now &&
        new Date(rt.reservation.endTime) > now
    );

    const tableReservations = table.reservedIn.map((rt) => ({
      id: rt.reservation.id,
      startTime: rt.reservation.startTime,
      endTime: rt.reservation.endTime,
      status: rt.reservation.status,
    }));

    return {
      id: table.id,
      label: table.label,
      x: table.x,
      y: table.y,
      width: table.width,
      height: table.height,
      capacity: table.capacity,
      reserved: activeNow,
      reservations: tableReservations,
    };
  });

  return NextResponse.json(formattedTables);
}
