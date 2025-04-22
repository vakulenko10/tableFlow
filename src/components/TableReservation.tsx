"use client";

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { useAppDispatch } from "@/store/hooks";
import { fetchTables } from "@/store/slices/tableSlice";
import useSocketListener from "@/app/hooks/useSocketListener";
import { useNotification } from "@/app/hooks/useNotification";

interface TableReservationFormProps {
  selectedDate?: string;
  onSuccess?: () => void;
}

export default function TableReservationForm({
  selectedDate,
  onSuccess,
}: TableReservationFormProps) {
  useSocketListener();

  const dispatch = useAppDispatch();
  const { notify } = useNotification();
  const { tables, selectedTableIds } = useSelector(
    (state: RootState) => state.tables
  );

  const today = new Date().toISOString().split("T")[0];
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [date, setDate] = useState(selectedDate || today);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  useEffect(() => {
    if (tables.length === 0) {
      dispatch(fetchTables());
    }
  }, [dispatch, tables.length]);

  useEffect(() => {
    if (selectedDate) {
      setDate(selectedDate);
    }
  }, [selectedDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedTableIds.length === 0) {
      notify("Please select at least one table", "error");
      return;
    }

    const start = new Date(`${date}T${startTime}`);
    const end = new Date(`${date}T${endTime}`);
    const now = new Date();

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      notify("Invalid time format", "error");
      return;
    }

    if (start < now) {
      notify("Cannot reserve time in the past", "error");
      return;
    }

    if (end <= start) {
      notify("End time must be after start time", "error");
      return;
    }

    const response = await fetch("/api/reserve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        date,
        startTime: start,
        endTime: end,
        tableIds: selectedTableIds,
      }),
    });

    const result = await response.json();

    if (response.ok) {
      notify("Reservation successful!", "success");
      onSuccess?.();

      setName("");
      setEmail("");
      setStartTime("");
      setEndTime("");
    } else {
      notify(result.error || "Something went wrong", "error");
    }
  };

  const selectedTables = tables.filter((table) =>
    selectedTableIds.includes(table.id)
  );

  return (
    <div className="max-w-md mx-auto p-4">
      <h2 className="text-xl font-semibold mb-4">Book Your Table</h2>

      {selectedTables.length > 0 && (
        <div className="mb-4 p-3 bg-blue-50 rounded-md">
          <h3 className="font-medium">Selected Tables:</h3>
          <ul className="text-sm">
            {selectedTables.map((table) => (
              <li key={table.id}>
                Table {table.label} - {table.capacity} people
              </li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Your Name"
          className="w-full border rounded p-2"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <input
          type="email"
          placeholder="Your Email"
          className="w-full border rounded p-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="date"
          className="w-full border rounded p-2"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          min={today}
          required
        />

        <input
          type="time"
          className={`w-full border rounded p-2 ${startTime && !/^[0-2][0-9]:(00|15|30|45)$/.test(startTime) ? "border-red-500" : ""} `}
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          min="10:00"
          max="23:45"
          step="900" // 15 minutes = 900 seconds
          required
         
        />

        <input
          type="time"
          className={`w-full border rounded p-2 ${endTime && !/^[0-2][0-9]:(00|15|30|45)$/.test(endTime) ? "border-red-500" : ""} `}
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          min="10:00"
          max="22:00"
          step="900"
          required
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
        >
          Reserve Now
        </button>
      </form>
    </div>
  );
}
