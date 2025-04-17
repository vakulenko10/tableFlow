"use client";

import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import { fetchTables } from "@/store/slices/tableSlice";

export default function TableReservationForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const dispatch = useDispatch();
  const { tables, selectedTableIds, loading } = useSelector(
    (state: RootState) => state.tables
  );

  useEffect(() => {
    // Load tables if they haven't been loaded yet
    if (tables.length === 0) {
      dispatch(fetchTables());
    }
  }, [dispatch, tables.length]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (selectedTableIds.length === 0) {
      setError("Please select at least one table");
      return;
    }

    const fullStart = new Date(`${date}T${startTime}`);
    const fullEnd = new Date(`${date}T${endTime}`);

    if (isNaN(fullStart.getTime()) || isNaN(fullEnd.getTime())) {
      setError("Invalid time provided.");
      return;
    }

    const res = await fetch("/api/reserve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        date,
        startTime: fullStart,
        endTime: fullEnd,
        tableIds: selectedTableIds,
      }),
    });

    const result = await res.json();

    if (res.ok) {
      setSuccess(true);
      setName("");
      setEmail("");
      setDate("");
      setStartTime("");
      setEndTime("");
    } else {
      setError(result.error || "Something went wrong");
    }
  }

  // Show the selected tables information
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
          required
        />
        <input
          type="time"
          className="w-full border rounded p-2"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          required
        />
        <input
          type="time"
          className="w-full border rounded p-2"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          required
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
        >
          Reserve Now
        </button>
      </form>

      {success && (
        <p className="text-green-600 mt-4">
          ✅ Reservation request sent! Please check your email to confirm. Check
          your spam folder. Your confirmation link will be active within 15
          minutes, otherwise your reservation will be cancelled
        </p>
      )}

      {error && <p className="text-red-600 mt-4">❌ {error}</p>}
    </div>
  );
}
