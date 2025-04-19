"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import useSocketListener from "@/app/hooks/useSocketListener";

interface Reservation {
  id: string;
  name: string;
  email: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  createdAt: string;
  tables: {
    table: { label: string };
  }[];
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [selectedDate, setSelectedDate] = useState("");

  useSocketListener();

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/api/auth/signin");
    }
  }, [status]);

  useEffect(() => {
    async function fetchReservations() {
      const query = selectedDate ? `?date=${selectedDate}` : "";
      const res = await fetch(`/api/reservation${query}`);
      const data = await res.json();
      setReservations(data);
    }

    fetchReservations();
  }, [selectedDate]);

  if (status !== "authenticated") return null;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-2">Admin Dashboard</h1>
      <p className="mb-6">Welcome, {session?.user?.email}</p>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-1">
          Filter by date:
        </label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="border px-3 py-2 rounded shadow"
        />
      </div>

      <h2 className="text-xl font-semibold mb-4">Reservations</h2>
      <table className="w-full table-auto border border-collapse border-gray-300 text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-4 py-2">Name</th>
            <th className="border px-4 py-2">Email</th>
            <th className="border px-4 py-2">Date</th>
            <th className="border px-4 py-2">Time</th>
            <th className="border px-4 py-2">Status</th>
            <th className="border px-4 py-2">Tables</th>
            <th className="border px-4 py-2">Created At</th>
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
                {new Date(res.startTime).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}{" "}
                -{" "}
                {new Date(res.endTime).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </td>
              <td className="border px-4 py-2">{res.status}</td>
              <td className="border px-4 py-2">
                {res.tables.map((t) => t.table.label).join(", ")}
              </td>
              <td className="border px-4 py-2">
                {new Date(res.createdAt).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
