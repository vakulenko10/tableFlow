import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { randomUUID } from "crypto";
import { sendConfirmationEmail } from "@/lib/mailer";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";
export async function POST(req: Request) {
  const body = await req.json();
  const { name, email, date, startTime, endTime, tableIds } = body;

  if (!name || !email || !date || !startTime || !endTime || !tableIds?.length) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const token = randomUUID();

  try {
    // Check for conflicts
    const conflictingReservations = await prisma.reservationTable.findMany({
      where: {
        tableId: { in: tableIds },
        reservation: {
          date: new Date(date),
          status: { in: ["PENDING", "CONFIRMED"] },
          OR: [
            {
              startTime: { lt: new Date(endTime) },
              endTime: { gt: new Date(startTime) },
            },
          ],
        },
      },
      include: {
        reservation: true,
      },
    });

    if (conflictingReservations.length > 0) {
      return NextResponse.json(
        { error: "One or more tables are already reserved for this time." },
        { status: 409 }
      );
    }

    // Create reservation
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

    // Fetch updated tables
    const tables = await prisma.table.findMany({
      include: {
        reservedIn: {
          include: {
            reservation: true,
          },
        },
      },
    });

    const now = new Date();

    const formattedTables = tables.map((table) => {
      const reservations = table.reservedIn.map((rt) => rt.reservation);
      const isReserved = reservations.some(
        (res) =>
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

    // Send to WebSocket server
    try {
      await fetch(`${SOCKET_URL}/broadcast`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formattedTables),
      });
    } catch (socketError) {
      console.warn("WebSocket server not reachable:", socketError);
    }

    return NextResponse.json({ success: true, reservationId: reservation.id });
  } catch (error) {
    console.error("Reservation failed:", error);
    return NextResponse.json({ error: "Reservation failed" }, { status: 500 });
  }
}

// DELETE /api/reservations/:tableId — Remove all reservations for a table
export async function DELETE(
  req: Request,
  { params }: { params: { tableId: string } }
) {
  const { tableId } = params;

  if (!tableId) {
    return NextResponse.json({ error: "Missing tableId" }, { status: 400 });
  }

  try {
    // Get all reservationTable entries with this table
    const reservationTables = await prisma.reservationTable.findMany({
      where: { tableId },
      include: { reservation: true },
    });

    const reservationIds = [
      ...new Set(reservationTables.map((rt) => rt.reservationId)),
    ];

    // Delete reservation-table links
    await prisma.reservationTable.deleteMany({
      where: { tableId },
    });

    // Delete orphaned reservations
    await prisma.reservation.deleteMany({
      where: {
        id: { in: reservationIds },
        tables: {
          none: {}, // has no more linked tables
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete reservations:", error);
    return NextResponse.json(
      { error: "Failed to delete reservations" },
      { status: 500 }
    );
  }
}
