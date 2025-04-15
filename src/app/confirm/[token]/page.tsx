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
