"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import useSocketListener from "@/app/hooks/useSocketListener";
import { Button } from "@/components/ui/button";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import ReservationItem from "./ReservationItem";

export interface ReservationItem {
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
  const [reservations, setReservations] = useState<ReservationItem[]>([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [tableFilter, setTableFilter] = useState<string>("");
  const [timeFilter, setTimeFilter] = useState<string>("");
  const { tables } = useSelector(
    (state: RootState) => state.tables
  );

  useSocketListener();
  const router = useRouter();
  useEffect(() => {
    console.log(status)
    if (status === "unauthenticated") {
      router.push("/api/auth/signin");
    }
  }, [status, router]);

  useEffect(() => {
    async function fetchReservations() {
      const query = selectedDate ? `?date=${selectedDate}` : "";
      const res = await fetch(`/api/dashboard/reservations${query}`);
      const data = await res.json();
      setReservations(data);
    }
    // console.log('refetching the data because of the tables redux change')
    fetchReservations();
  }, [selectedDate, tables]);

  const handleDeleteReservation = (id: string) => {
    setReservations((prev) => prev.filter((r) => r.id !== id));
  };

  const filteredReservations = reservations.filter((res) => {
    const matchesStatus = !statusFilter || res.status === statusFilter;
    const matchesTable = !tableFilter || res.tables.some((t) => t.table.label.includes(tableFilter));
    const matchesTime = !timeFilter || res.startTime.includes(timeFilter);
    return matchesStatus && matchesTable && matchesTime;
  });

  if (status !== "authenticated") return <>not authenticated</>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-2">Admin Dashboard</h1>
      <p className="mb-6">Welcome, {session?.user?.email}</p>

      <div className="mb-6 flex gap-4 flex-wrap">
        <div>
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
        <div>
          <label className="block text-sm font-medium mb-1">
            Filter by status:
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border px-3 py-2 rounded shadow"
          >
            <option value="">All</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Filter by table:
          </label>
          <input
            type="text"
            placeholder="e.g. A1"
            value={tableFilter}
            onChange={(e) => setTableFilter(e.target.value)}
            className="border px-3 py-2 rounded shadow"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Filter by time:
          </label>
          <input
            type="time"
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            className="border px-3 py-2 rounded shadow"
          />
        </div>
        <div className="flex items-end">
          <Button
            variant="outline"
            className="mt-6"
            onClick={() => {
              setSelectedDate("");
              setStatusFilter("");
              setTableFilter("");
              setTimeFilter("");
            }}
          >
            Reset Filters
          </Button>
        </div>
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
          {filteredReservations.map((res) => (
            <ReservationItem key={res.id} reservation={res} setReservations={setReservations} />
          ))}
        </tbody>
      </table>

      
    </div>
  );
}
