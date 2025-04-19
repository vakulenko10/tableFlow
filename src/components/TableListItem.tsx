"use client";

import { Table } from "@/types/Table";
import { useEffect, useState } from "react";

interface Props {
  table: Table;
  onClick: (id:string) => void;
}

export default function TableListItem({ table , onClick}: Props) {
  const [isReserved, setIsReserved] = useState(table.reserved);
  useEffect(() => {
    const updateReservationStatus = () => {
      const now = new Date();
      const active = table.reservations.some(
        (r) =>
          new Date(r.startTime) <= now && new Date(r.endTime) > now
      );
      setIsReserved(active);
    };

    updateReservationStatus();

    const times = table.reservations.flatMap((r) => [
      new Date(r.startTime),
      new Date(r.endTime),
    ]);

    const timers = times
      .filter((time) => time > new Date())
      .map((time) => {
        const delay = time.getTime() - Date.now();
        return setTimeout(updateReservationStatus, delay);
      });

    return () => timers.forEach(clearTimeout);
  }, [table.reservations]);

  const nextAvailableTime =
    isReserved && table.reservations.length > 0
      ? new Date(
          Math.max(...table.reservations.map((r) => new Date(r.endTime).getTime()))
        )
      : null;

  return (
    <div
      onClick={() => table.capacity > 0 && onClick(table.id)}
      className={`flex justify-between items-center p-3 rounded border cursor-pointer transition hover:shadow-md ${
        isReserved
          ? "bg-amber-50 border-amber-300 text-amber-800"
          : "bg-blue-50 border-blue-200 text-blue-800"
      }`}
    >
      <div>
        <strong>Table {table.label}</strong> — {table.capacity} seats
        {isReserved && nextAvailableTime && (
          <div className="block text-sm mt-1">
            <span className="font-medium text-red-600">
              Reserved until {nextAvailableTime.toLocaleTimeString()}
            </span>
            <span className="block text-gray-600">
              Click to book for a later time
            </span>
          </div>
        )}
      </div>
      <span className="text-sm font-medium flex items-center gap-1">
        <span className={`w-2 h-2 rounded-full ${isReserved ? "bg-red-500" : "bg-green-500"}`} />
        {isReserved ? "Reserved" : "Available"}
      </span>
    </div>
  );
}
