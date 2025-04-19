import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const session = await getServerSession(authConfig);
  const allowedAdmins = (process.env.ADMIN_EMAILS ?? "").split(",");

  if (!session || !allowedAdmins.includes(session.user?.email ?? "")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const dateParam = searchParams.get("date");
  const includePast = searchParams.get("includePast") === "true";

  const now = new Date();
  const in30Days = new Date();
  in30Days.setDate(now.getDate() + 30);

  try {
    let reservations = [];

    if (dateParam) {
      // Filter by exact date
      reservations = await prisma.reservation.findMany({
        where: {
          date: new Date(dateParam),
        },
        orderBy: { startTime: "asc" },
        include: {
          tables: { include: { table: true } },
        },
      });
    } else if (includePast) {
      // Return ALL reservations (past + future)
      reservations = await prisma.reservation.findMany({
        orderBy: { date: "asc" },
        include: {
          tables: { include: { table: true } },
        },
      });
    } else {
      // Default: return only current and future reservations
      reservations = await prisma.reservation.findMany({
        where: {
          date: {
            gte: now,
          },
        },
        orderBy: { date: "asc" },
        include: {
          tables: { include: { table: true } },
        },
      });
    }

    return NextResponse.json(reservations);
  } catch (error) {
    console.error("Failed to fetch reservations:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
