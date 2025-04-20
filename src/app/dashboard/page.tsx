"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import useSocketListener from "@/app/hooks/useSocketListener";
import { useNotification } from "@/app/hooks/useNotification";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

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
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Reservation>>({});
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [tableFilter, setTableFilter] = useState<string>("");
  const [timeFilter, setTimeFilter] = useState<string>("");

  const { notify } = useNotification();
  useSocketListener();

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/api/auth/signin");
    }
  }, [status]);

  useEffect(() => {
    async function fetchReservations() {
      const query = selectedDate ? `?date=${selectedDate}` : "";
      const res = await fetch(`/api/dashboard/reservations${query}`);
      const data = await res.json();
      setReservations(data);
    }

    fetchReservations();
  }, [selectedDate]);

  const closeModal = () => {
    setSelectedReservation(null);
    setIsEditing(false);
    setFormData({});
  };

  const deleteReservation = async (id: string) => {
    const res = await fetch(`/api/dashboard/reservations?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      notify("Reservation deleted successfully", "success");
      setReservations((prev) => prev.filter((r) => r.id !== id));
    } else {
      notify("Failed to delete reservation", "error");
    }
    closeModal();
  };

  const cancelReservation = async (id: string) => {
    const res = await fetch(`/api/dashboard/reservations/${id}/cancel`, { method: "PATCH" });
    if (res.ok) {
      notify("Reservation cancelled", "success");
      setReservations((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: "CANCELLED" } : r))
      );
    } else {
      notify("Failed to cancel reservation", "error");
    }
    closeModal();
  };

  const updateReservation = async () => {
    if (!selectedReservation) return;
    const res = await fetch(`/api/dashboard/reservations?id=${selectedReservation.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    if (res.ok) {
      notify("Reservation updated successfully", "success");
      setReservations((prev) =>
        prev.map((r) => (r.id === selectedReservation.id ? { ...r, ...formData } as Reservation : r))
      );
    } else {
      notify("Failed to update reservation", "error");
    }
    closeModal();
  };

  const handleInputChange = (key: keyof Reservation, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const filteredReservations = reservations.filter((res) => {
    const matchesStatus = !statusFilter || res.status === statusFilter;
    const matchesTable = !tableFilter || res.tables.some((t) => t.table.label.includes(tableFilter));
    const matchesTime = !timeFilter || res.startTime.includes(timeFilter);
    return matchesStatus && matchesTable && matchesTime;
  });

  if (status !== "authenticated") return null;

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
            <tr
              key={res.id}
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => {
                setSelectedReservation(res);
                setFormData(res);
              }}
            >
              <td className="border px-4 py-2">{res.name}</td>
              <td className="border px-4 py-2">{res.email}</td>
              <td className="border px-4 py-2">
                {new Date(res.date).toLocaleDateString()}
              </td>
              <td className="border px-4 py-2">
                {new Date(res.startTime).toLocaleTimeString()} -{" "}
                {new Date(res.endTime).toLocaleTimeString()}
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

      <Dialog open={!!selectedReservation} onOpenChange={closeModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reservation Details</DialogTitle>
          </DialogHeader>
          {selectedReservation && (
            <div className="space-y-2">
              {(["name", "email"] as const).map((field) => (
                <div key={field}>
                  <label className="block text-sm font-medium capitalize">
                    {field}:
                  </label>
                  <input
                    value={formData[field] ?? ""}
                    disabled={!isEditing}
                    onChange={(e) => handleInputChange(field, e.target.value)}
                    className={`border px-2 py-1 rounded w-full ${
                      isEditing ? "text-black" : "text-gray-500"
                    }`}
                  />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium">Date:</label>
                <input
                  type="date"
                  value={formData.date ?? ""}
                  disabled={!isEditing}
                  onChange={(e) => handleInputChange("date", e.target.value)}
                  className={`border px-2 py-1 rounded w-full ${
                    isEditing ? "text-black" : "text-gray-500"
                  }`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Start Time:</label>
                <input
                  type="datetime-local"
                  value={formData.startTime ?? ""}
                  disabled={!isEditing}
                  onChange={(e) =>
                    handleInputChange("startTime", e.target.value)
                  }
                  className={`border px-2 py-1 rounded w-full ${
                    isEditing ? "text-black" : "text-gray-500"
                  }`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium">End Time:</label>
                <input
                  type="datetime-local"
                  value={formData.endTime ?? ""}
                  disabled={!isEditing}
                  onChange={(e) => handleInputChange("endTime", e.target.value)}
                  className={`border px-2 py-1 rounded w-full ${
                    isEditing ? "text-black" : "text-gray-500"
                  }`}
                />
              </div>

              <DialogFooter className="mt-4 space-x-2">
                {!isEditing ? (
                  <Button onClick={() => setIsEditing(true)}>Edit</Button>
                ) : (
                  <Button onClick={updateReservation}>Save</Button>
                )}
                <Button
                  onClick={() => cancelReservation(selectedReservation.id)}
                  variant="destructive"
                >
                  Cancel Reservation
                </Button>
                <Button
                  onClick={() => deleteReservation(selectedReservation.id)}
                  variant="destructive"
                >
                  Delete
                </Button>
                <Button variant="outline" onClick={closeModal}>
                  Close
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
