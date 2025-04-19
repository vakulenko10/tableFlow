"use client";

import { Table } from "@/types/Table";
import { useEffect, useState } from "react";
import { useAppDispatch } from "@/store/hooks";
interface Props {
  table: Table;
  onHover: (id: string | null) => void;
  onClick: (id:string) => void
}

export default function TableItem({ table, onHover, onClick}: Props) {
 const dispatch = useAppDispatch();
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

    updateReservationStatus(); // run on mount

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

  const fillColor = isReserved
    ? "#EF4444"
    : table.capacity > 0
    ? "#3B82F6"
    : "#a78bfa";

  const nextAvailableTime =
    table.reservations.length > 0
      ? new Date(
          Math.max(...table.reservations.map((r) => new Date(r.endTime).getTime()))
        )
      : null;

  return (
    <g
      onClick={() => table.capacity > 0 && onClick(table.id)}
      onMouseEnter={() => onHover(table.id)}
      onMouseLeave={() => onHover(null)}
      className="cursor-pointer transition-transform duration-300 ease-in-out hover:-translate-y-1"
    >
      <title>
        Table {table.label} — {table.capacity} people
        {isReserved ? ` (Reserved until ${nextAvailableTime?.toLocaleTimeString()})` : ""}
      </title>
      <rect
        x={table.x}
        y={table.y}
        width={table.width}
        height={table.height}
        fill={fillColor}
        stroke="#1D4ED8"
        strokeWidth={2}
        rx={6}
        ry={6}
      />
      <text
        x={table.x + table.width / 2}
        y={table.y + table.height / 2}
        dominantBaseline="middle"
        textAnchor="middle"
        fontSize="12"
        fill="white"
        pointerEvents="none"
      >
        {`${table.label} (${table.capacity})${isReserved ? " ⏰" : ""}`}
      </text>
    </g>
  );
}
