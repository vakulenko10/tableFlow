"use client"; // Marks this as a client-side component with React hooks

import { useState, useEffect } from "react";
import { useSelector } from "react-redux"; // For accessing Redux store state
import { RootState } from "@/store"; // Type definition for Redux state
import { useAppDispatch } from "@/store/hooks"; // Type-safe dispatch hook
import { fetchTables } from "@/store/slices/tableSlice"; // Action to fetch tables data

interface TableReservationFormProps {
  suggestedStartTime?: Date | null;
  isTableReserved?: boolean;
}

/**
 * Form component for booking restaurant tables
 * Handles form state, validation, and submission to /api/reserve endpoint
 *
 * Special behavior:
 * - For currently reserved tables, suggests booking time starting when table becomes available
 * - For available tables, allows user to specify any valid time
 */

export default function TableReservationForm({
  suggestedStartTime = null,
  isTableReserved = false,
}: TableReservationFormProps = {}) {
  // Form state variables
  const [name, setName] = useState(""); 
  const [email, setEmail] = useState(""); 
  const [date, setDate] = useState(""); // Reservation date (YYYY-MM-DD)
  const [startTime, setStartTime] = useState(""); // Start time (HH:MM)
  const [endTime, setEndTime] = useState(""); // End time (HH:MM)
  const [success, setSuccess] = useState(false); // Success message flag
  const [error, setError] = useState(""); // Error message text

  // Access Redux store
  const dispatch = useAppDispatch();
  const { tables, selectedTableIds, loading } = useSelector(
    (state: RootState) => state.tables
  );

  // Get today's date in YYYY-MM-DD format for validation
  const today = new Date().toISOString().split("T")[0];

  // Load tables data if not already loaded
  useEffect(() => {
    if (tables.length === 0) {
      dispatch(fetchTables());
    }
  }, [dispatch, tables.length]);

  // First useEffect - handles time suggestion for reserved tables
  // Only runs when a user selects a table that is currently reserved
  useEffect(() => {
    if (suggestedStartTime && isTableReserved) {
      // Set date from suggested time (when table becomes available)
      const suggestedDate = suggestedStartTime.toISOString().split("T")[0];
      setDate(suggestedDate);

      // Make sure we don't suggest a time in the past
      const now = new Date();
      const effectiveTime = suggestedStartTime < now ? now : suggestedStartTime;

      // Set start time rounded to nearest 15 minutes
      let hours = effectiveTime.getHours();
      let minutes = Math.ceil(effectiveTime.getMinutes() / 15) * 15;

      // Handle minute rollover to next hour
      if (minutes === 60) {
        minutes = 0;
        hours += 1;
      }

      // Format time as HH:MM for the input field
      const startTimeString = `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}`;
      setStartTime(startTimeString);

      // User will set end time manually - no automatic end time
    }
  }, [suggestedStartTime, isTableReserved]);

  // Second useEffect - handles default date setting only
  // For all cases, just ensures the date is set to today by default
  useEffect(() => {
    if (!date) {
      setDate(today);
    }
    // Time fields are not set automatically here
    // Time is only set for reserved tables in the first useEffect
  }, [date, today]);

  /**
   * Form submission handler
   * Validates reservation details and sends request to server
   *
   * Validation rules:
   * - At least one table must be selected
   * - Time values must be valid
   * - Reservation cannot be in the past
   */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);

    // Verify table selection
    if (selectedTableIds.length === 0) {
      setError("Please select at least one table");
      return;
    }

    // Parse time values to Date objects for validation
    const fullStart = new Date(`${date}T${startTime}`);
    const fullEnd = new Date(`${date}T${endTime}`);
    const now = new Date();

    // Validate time format
    if (isNaN(fullStart.getTime()) || isNaN(fullEnd.getTime())) {
      setError("Invalid reservation time");
      return;
    }

    // Prevent booking in the past
    if (fullStart < now) {
      setError("Cannot book a table in the past");
      return;
    }
    
    // Prevent start and end times being the same
    if (fullStart.getTime() === fullEnd.getTime()) {
      setError("End time must be different from start time");
      return;
    }

    // Send reservation request to server
    const res = await fetch("/api/reserve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        date,
        startTime: fullStart, // Send as Date object
        endTime: fullEnd, // Send as Date object
        tableIds: selectedTableIds,
      }),
    });

    const result = await res.json();

    // Handle response
    if (res.ok) {
      setSuccess(true);
      // Reset form on success
      setName("");
      setEmail("");
      setDate("");
      setStartTime("");
      setEndTime("");
    } else {
      // Display error from server or generic message
      setError(result.error || "Something went wrong");
    }
  }

  // Get details of selected tables for display
  const selectedTables = tables.filter((table) =>
    selectedTableIds.includes(table.id)
  );

  // Render form with all input fields and messages
  return (
    <div className="max-w-md mx-auto p-4">
      <h2 className="text-xl font-semibold mb-4">Book Your Table</h2>

      {/* Display selected tables info */}
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

      {/* Reservation form */}
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
          min={today} // Prevent selecting past dates
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

      {/* Success message with confirmation instructions */}
      {success && (
        <p className="text-green-600 mt-4">
          ✅ Reservation request sent! Please check your email to confirm. Check
          your spam folder. Your confirmation link will be active within 15
          minutes, otherwise your reservation will be cancelled
        </p>
      )}

      {/* Error message */}
      {error && <p className="text-red-600 mt-4">❌ {error}</p>}
    </div>
  );
}
