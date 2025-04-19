import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";

export default async function DashboardPage() {
  const session = await getServerSession(authConfig);

  if (!session) {
    redirect("/api/auth/signin");
  }

  const reservations = await prisma.reservation.findMany({
    orderBy: { date: "desc" },
    include: {
      tables: {
        include: {
          table: true,
        },
      },
    },
  });

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-2">Admin Dashboard</h1>
      <p className="mb-6">Welcome, {session.user?.email}</p>

      <h2 className="text-xl font-semibold mb-4">Резервации</h2>
      <table className="w-full table-auto border border-collapse border-gray-300 text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-4 py-2">Имя</th>
            <th className="border px-4 py-2">Email</th>
            <th className="border px-4 py-2">Дата</th>
            <th className="border px-4 py-2">Время</th>
            <th className="border px-4 py-2">Статус</th>
            <th className="border px-4 py-2">Столы</th>
          </tr>
        </thead>
        <tbody>
          {reservations.map((res) => (
            <tr key={res.id}>
              <td className="border px-4 py-2">{res.name}</td>
              <td className="border px-4 py-2">{res.email}</td>
              <td className="border px-4 py-2">
                {new Date(res.date).toLocaleDateString()}
              </td>
              <td className="border px-4 py-2">
                {new Date(res.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} -{" "}
                {new Date(res.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </td>
              <td className="border px-4 py-2">{res.status}</td>
              <td className="border px-4 py-2">
                {res.tables.map((t) => t.table.label).join(", ")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
