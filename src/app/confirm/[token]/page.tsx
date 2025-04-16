"use client"
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
 
import { useParams } from 'next/navigation'
 

export default async function ConfirmPage() {
  // const {token} = await params;
  const params  = useParams<{token :string }>()
  console.log(params)
  const token = params.token;
  // const token = params.token;
  const reservation = await prisma.reservation.findUnique({
    where: { token },
  });

  if (!reservation) return notFound();

  const now = new Date();
  const createdAt = new Date(reservation.createdAt);
  const minutesPassed = (now.getTime() - createdAt.getTime()) / 1000 / 60;

  if (minutesPassed > 15 && reservation.status === "PENDING") {
    await prisma.reservation.update({
      where: { token },
      data: { status: "CANCELLED" },
    });

    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-8">
        <h1 className="text-3xl font-bold mb-4">⏳ Link Expired</h1>
        <p className="text-lg">
          Sorry, this confirmation link has expired. Please make a new reservation.
        </p>
      </div>
    );
  }

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
