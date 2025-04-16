import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
export const dynamic = "force-dynamic";

interface ConfirmPageProps {
  params: {
    token: string;
  };
}

export default async function ConfirmPage({ params }: ConfirmPageProps) {
  const token = params.token;

  const reservation = await prisma.reservation.findUnique({
    where: { token },
  });

  if (!reservation) {
    return notFound();
  }

  const now = new Date();
  const createdAt = new Date(reservation.createdAt);
  const minutesPassed = (now.getTime() - createdAt.getTime()) / 1000 / 60;

  if (minutesPassed > 15) {
    // Cancel the reservation if it's still pending
    if (reservation.status === "PENDING") {
      await prisma.reservation.update({
        where: { token },
        data: { status: "CANCELLED" },
      });
    }

    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-8">
        <h1 className="text-3xl font-bold mb-4">⏳ Link Expired</h1>
        <p className="text-lg">
          Sorry, this confirmation link has expired. Please make a new reservation.
        </p>
      </div>
    );
  }

  // If still within 15 minutes and pending, confirm it
  if (reservation.status === "PENDING") {
    await prisma.reservation.update({
      where: { token },
      data: { status: "CONFIRMED" },
    });
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-8">
      <h1 className="text-3xl font-bold mb-4">✅ Reservation Confirmed!</h1>
      <p className="text-lg">Thanks for confirming your reservation.</p>
    </div>
  );
}
