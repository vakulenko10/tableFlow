import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/tables
 * Returns all tables with their reservation status
 */
export async function GET() {
  const now = new Date(); // Current time reference

  // Get tables with their active reservations
  const tables = await prisma.table.findMany({
    include: {
      reservedIn: {
        where: {
          reservation: {
            status: "CONFIRMED", // Only confirmed bookings
            endTime: { gt: now }, // Not yet ended
          },
        },
        include: {
          reservation: true, // Include full reservation details
        },
      },
    },
  });

  // Format data for frontend
  const formattedTables = tables.map((table) => {
    // Check if table is currently reserved
    const activeNow = table.reservedIn.some(
      (rt) =>
        rt.reservation.status === "CONFIRMED" &&
        new Date(rt.reservation.startTime) <= now &&
        new Date(rt.reservation.endTime) > now
    );

    // Extract reservation info
    const tableReservations = table.reservedIn.map((rt) => ({
      id: rt.reservation.id,
      startTime: rt.reservation.startTime,
      endTime: rt.reservation.endTime,
      status: rt.reservation.status,
    }));

    return {
      id: table.id,
      label: table.label, // Table number/name
      x: table.x, // Position coordinates
      y: table.y, // for floor map
      width: table.width,
      height: table.height,
      capacity: table.capacity, // Number of seats
      reserved: activeNow, // Active booking flag (now)
      reservations: tableReservations, // Upcoming bookings
    };
  });

  return NextResponse.json(formattedTables);
}
