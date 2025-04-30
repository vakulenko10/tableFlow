"use client";

import React, { useEffect, useState } from "react";
import { Table } from "@/types/Table";
import { useAppDispatch } from "@/store/hooks";
import { setSelectedTableIds } from "@/store/slices/tableSlice";
import Image from "next/image";
import TableReservationModal from "./TableReservationModal";

interface Props {
  table: Table;
}

const tableImages: Record<string, string> = {
  T1: "/images/photo1.jpg",
  T2: "/images/photo1.jpg",
  T3: "/images/photo1.jpg",
  T4: "/images/photo1.jpg",
  T5: "/images/photo1.jpg",
  T6: "/images/photo1.jpg",
  T7: "/images/photo1.jpg",
  T8: "/images/photo1.jpg",
  T9: "/images/photo1.jpg",
  T10: "/images/photo1.jpg",
};

export const TableItem = React.memo(
  function TableItem({ table }: Props) {
   
    const dispatch = useAppDispatch();
    const isInteractive = !["BAR2", "BAR4", "KIDS"].includes(table.label);
    const [status, setStatus] = useState<"reserved" | "recentPending" | "free">("free");
    const [isHovered, setIsHovered] = useState(false);

    console.log(`🔄 TableItem ${table.label} rendered with data: ${JSON.stringify(table)}`); 

    const [open, setOpen] = useState(false);

    const handleTableSelection = () => {
      if (!isInteractive) {
        console.log("This space cannot be booked");
        return;
      }
      setOpen(true);
      dispatch(setSelectedTableIds([table.id]));
    };
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
          new Date(new Date(r.createdAt).getTime() + 15 * 60 * 1000),
        ];
        return times
          .filter((t) => t > new Date())
          .map((t) => setTimeout(updateStatus, t.getTime() - Date.now()));
      });

      return () => timers.forEach(clearTimeout);
    }, [table.reservations]);

    const handleClick = () => {
      if (table.capacity > 0) {
        dispatch(setSelectedTableIds([table.id]));
      }
    };

    const fillColor =
      status === "reserved"
        ? "#EF4444"
        : status === "recentPending"
        ? "#F97316"
        : table.capacity > 0
        ? "#3B82F6"
        : "#a78bfa";

    const nextAvailableTime =
      table.reservations.length > 0
        ? new Date(Math.max(...table.reservations.map((r) => new Date(r.endTime).getTime())))
        : null;

    return (
      <>
        <g
          onClick={handleTableSelection}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
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

        {isHovered && tableImages[table.label] && (
          <foreignObject
            x={table.x + table.width + 10}
            y={table.y}
            width={300}
            height={200}
          >
            <div className="w-full h-full flex items-center justify-center bg-white border border-gray-300 rounded shadow-md overflow-hidden">
              <Image
                src={tableImages[table.label]}
                alt={`Table ${table.label}`}
                className="w-full h-full object-cover"
                fill
              />
            </div>
          </foreignObject>
        )}
        
        <TableReservationModal
          selectedTableId={open ? table.id : null}
          onClose={() => setOpen(false)}
        />
      </>
    );
  },
  (prevProps, nextProps) => {
  return (
    prevProps.table === nextProps.table
  );
  }
);
