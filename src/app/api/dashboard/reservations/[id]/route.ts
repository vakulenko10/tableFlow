import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { authConfig } from "@/lib/auth.config";
export async function DELETE(req: Request) {
    const session = await getServerSession(authConfig);
    const allowedAdmins = (process.env.ADMIN_EMAILS ?? "").split(",");
  
    if (!session || !allowedAdmins.includes(session.user?.email ?? "")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
  
    try {
      const { searchParams } = new URL(req.url);
      const id = searchParams.get("id");
  
      if (!id) {
        return NextResponse.json({ error: "Reservation ID is required" }, { status: 400 });
      }
  
      // Delete associated tables first (assuming cascade is not configured)
      await prisma.reservationTable.deleteMany({
        where: { reservationId: id },
      });
  
      // Delete the reservation itself
      await prisma.reservation.delete({
        where: { id },
      });
  
      return NextResponse.json({ message: "Reservation deleted successfully" });
    } catch (error) {
      console.error("Failed to delete reservation:", error);
      return new NextResponse("Internal Server Error", { status: 500 });
    }
  }

  export async function PUT(req: Request) {
    const session = await getServerSession(authConfig);
    const allowedAdmins = (process.env.ADMIN_EMAILS ?? "").split(",");
  
    if (!session || !allowedAdmins.includes(session.user?.email ?? "")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
  
    try {
      const { searchParams } = new URL(req.url);
      const id = searchParams.get("id");
      const body = await req.json();
  
      if (!id) {
        return NextResponse.json({ error: "Reservation ID is required" }, { status: 400 });
      }
  
      const updated = await prisma.reservation.update({
        where: { id },
        data: {
          name: body.name,
          email: body.email,
          date: new Date(body.date),
          startTime: new Date(body.startTime),
          endTime: new Date(body.endTime),
          status: body.status,
        },
      });
  
      return NextResponse.json(updated);
    } catch (error) {
      console.error("Failed to update reservation:", error);
      return new NextResponse("Internal Server Error", { status: 500 });
    }
  }