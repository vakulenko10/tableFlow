"use client";

import { Table } from "@/types/Table";
import { useEffect, useState } from "react";

interface Props {
  table: Table;
  onHover: (id: string | null) => void;
  onClick: (id: string) => void;
}

export default function TableItem({ table, onHover, onClick }: Props) {
  const [status, setStatus] = useState<
    "reserved" | "recentPending" | "free"
  >("free");

  useEffect(() => {
    const updateStatus = () => {
      const now = new Date();
      const hasActiveConfirmed = table.reservations.some(
        (r) =>
          r.status === "CONFIRMED" &&
          new Date(r.startTime) <= now &&
          new Date(r.endTime) > now
      );

      const hasRecentPending = table.reservations.some((r) => {
        if (r.status !== "PENDING") return false;
        const created = new Date(r.createdAt);
        const diffInMinutes = (now.getTime() - created.getTime()) / 60000;
        return diffInMinutes <= 15;
      });

      if (hasActiveConfirmed) setStatus("reserved");
      else if (hasRecentPending) setStatus("recentPending");
      else setStatus("free");
    };

    updateStatus();

    const timers = table.reservations.flatMap((r) => {
      const times = [
        new Date(r.startTime),
        new Date(r.endTime),
        new Date(new Date(r.createdAt).getTime() + 15 * 60 * 1000), // pending window end
      ];
      return times
        .filter((t) => t > new Date())
        .map((t) =>
          setTimeout(updateStatus, t.getTime() - Date.now())
        );
    });

    return () => timers.forEach(clearTimeout);
  }, [table.reservations]);

  const fillColor =
    status === "reserved"
      ? "#EF4444" // red
      : status === "recentPending"
      ? "#F97316" // orange
      : table.capacity > 0
      ? "#3B82F6" // blue
      : "#a78bfa"; // purple

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
        {status === "reserved" &&
          ` (Reserved until ${nextAvailableTime?.toLocaleTimeString()})`}
        {status === "recentPending" && ` (Pending - just created)`}
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
        {`${table.label} (${table.capacity})`}
        {status === "reserved" && " ⏰"}
        {status === "recentPending" && " ⏳"}
      </text>
    </g>
  );
}
