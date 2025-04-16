/**
 * API Route for reservation confirmation
 * This endpoint handles the confirmation of pending reservations via a unique token
 * Called when a user clicks the confirmation link in their email
 */
import { prisma } from "@/lib/db"; // Database client for interacting with the database
import { NextResponse } from "next/server"; // Next.js utility for creating API responses

/*
 * POST handler for /api/confirm/[token]
 * Activated when user opens their confirmation link
 */

export async function POST(
  req: Request,
  { params }: { params: { token: string } }
) {
  try {
    // Extract the token from URL parameters
    // The token is a UUID generated during reservation creation
    const { token } = params;

    // Query the database to find a reservation matching this token
    // If no reservation exists with this token, the link is invalid
    const reservation = await prisma.reservation.findUnique({
      where: { token },
    });

    // If no reservation found, return 404 status with error message
    if (!reservation) {
      return NextResponse.json(
        { status: "error", message: "Reservation not found" },
        { status: 404 }
      );
    }

    // Check if the confirmation link has expired (15 minute validity window)
    // Calculate expiry time based on when reservation was created
    const tokenCreatedAt = reservation.createdAt;
    const tokenExpiry = new Date(tokenCreatedAt);
    tokenExpiry.setMinutes(tokenExpiry.getMinutes() + 15);

    // If current time is past expiry and reservation is still pending, mark as expired
    if (new Date() > tokenExpiry && reservation.status === "PENDING") {
      return NextResponse.json({ status: "expired" }, { status: 200 });
    }

    // If reservation is still in PENDING status, update it to CONFIRMED
    // This is the main confirmation action
    if (reservation.status === "PENDING") {
      await prisma.reservation.update({
        where: { token },
        data: { status: "CONFIRMED" },
      });

      // Return success response indicating reservation is now confirmed
      return NextResponse.json({ status: "confirmed" }, { status: 200 });
    }

    // If reservation was already handled (confirmed or cancelled),
    // just return its current status without making changes
    return NextResponse.json(
      { status: reservation.status.toLowerCase() },
      { status: 200 }
    );
  } catch (error) {
    // Log and return any errors that occur during processing
    // This ensures exceptions don't crash the server and are properly handled
    console.error("Error confirming reservation:", error);
    return NextResponse.json({ status: "error" }, { status: 500 });
  }
}
