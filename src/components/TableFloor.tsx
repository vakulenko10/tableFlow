"use client";

import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux"; // Access Redux store state
import { RootState } from "@/store"; // Type definition for Redux state
import { useAppDispatch } from "@/store/hooks"; // Type-safe dispatch hook
import { fetchTables, setSelectedTableIds } from "@/store/slices/tableSlice"; // Actions
import TableReservationModal from "./TableReservationModal"; // Modal for booking tables
import useSocketListener from "@/app/hooks/useSocketListener";


const ORIGINAL_WIDTH = 1000;
const ORIGINAL_HEIGHT = 800;

// Hardcoded images per table label (you can use id if needed)
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

export default function TableFloor() {
   useSocketListener(); 
  const dispatch = useAppDispatch(); // Type-safe dispatch for Redux actions
  const { tables, loading } = useSelector((state: RootState) => state.tables); // Get tables from Redux
  const [hoveredTableId, setHoveredTableId] = useState<string | null>(null);
  // Component state
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null); // Currently selected table
  const [svgHeight, setSvgHeight] = useState(ORIGINAL_HEIGHT); // Dynamic height based on table positions
  const [viewMode, setViewMode] = useState<"map" | "list">("map"); // Toggle between visual map and list view
  const containerRef = useRef<HTMLDivElement>(null); // Reference to container for dimensions

  // Load tables data when component mounts
  useEffect(() => {
    dispatch(fetchTables());
  }, [dispatch]);

  useEffect(() => {
    // Adjust SVG height dynamically based on the maximum Y position of the tables
    if (tables.length > 0) {
      const maxY = Math.max(...tables.map((t) => t.y + t.height));
      setSvgHeight(maxY + 50);
    }
  }, [tables]);

  const handleTableSelection = (tableId: string) => {
    setSelectedTableId(tableId);
    dispatch(setSelectedTableIds([tableId]));
  };

  if (loading) {
    return <p className="text-center text-gray-600">Loading tables...</p>;
  }

  const hoveredTable = hoveredTableId
    ? tables.find((t) => t.id === hoveredTableId)
    : null;

  return (
    <div className="w-full overflow-auto border rounded-lg bg-white shadow-md p-4 space-y-4">
      <h2 className="text-xl font-semibold text-center">Floor Map</h2>

      {/* Legend */}
      <div className="flex gap-4 text-sm mb-2 justify-center flex-wrap sm:flex-nowrap">
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-blue-500 rounded" /> Available
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-red-500 rounded" /> Reserved
        </div>
      </div>

      <div ref={containerRef}>
        <svg
          viewBox={`0 0 ${ORIGINAL_WIDTH} ${svgHeight}`}
          preserveAspectRatio="xMidYMid meet"
          className="w-full max-w-[800px] mx-auto h-auto border rounded shadow"
        >
          {/* Wood texture background */}
          <defs>
            <pattern
              id="woodTexture"
              patternUnits="userSpaceOnUse"
              width="40"
              height="40"
            >
              <rect width="40" height="40" fill="#f5efe6" />
              <path
                d="M0,20 Q10,25 20,20 T40,20"
                stroke="#d6c6b5"
                strokeWidth="1"
                fill="none"
              />
              <path
                d="M0,30 Q15,35 30,30 T40,30"
                stroke="#e0d4c3"
                strokeWidth="0.5"
                fill="none"
              />
            </pattern>
          </defs>

          <rect
            x={0}
            y={0}
            width={ORIGINAL_WIDTH}
            height={svgHeight}
            fill="url(#woodTexture)"
          />

          {/* Tables */}
          {tables.map((table) => {
            const isTable = table.capacity > 0;
            const isReserved = table.reserved;

            const fillColor = isReserved
              ? "#EF4444"
              : isTable
              ? "#3B82F6"
              : "#a78bfa";

            const nextAvailableTime =
              table.reservations && table.reservations.length > 0
                ? new Date(
                    Math.max(
                      ...table.reservations.map((r) =>
                        new Date(r.endTime).getTime()
                      )
                    )
                  )
                : null;

            return (
              <g
                key={table.id}
                onClick={() => isTable && handleTableSelection(table.id)}
                onMouseEnter={() => setHoveredTableId(table.id)}
                onMouseLeave={() => setHoveredTableId(null)}
                className={
                  isTable
                    ? "cursor-pointer transition-transform duration-300 ease-in-out hover:-translate-y-1"
                    : "cursor-default"
                }
              >
                {/* Tooltip title */}
                <title>
                  {isTable
                    ? `Table ${table.label} — ${table.capacity} people${
                        isReserved
                          ? ` (Reserved until ${nextAvailableTime?.toLocaleTimeString()})`
                          : ""
                      }`
                    : `Area: ${table.label}`}
                </title>

                {/* Rectangle */}
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

                {/* Label */}
                <text
                  x={table.x + table.width / 2}
                  y={table.y + table.height / 2}
                  dominantBaseline="middle"
                  textAnchor="middle"
                  fontSize="12"
                  fill="white"
                  pointerEvents="none"
                >
                  {isTable
                    ? `${table.label} (${table.capacity})${
                        isReserved ? " ⏰" : ""
                      }`
                    : table.label}
                </text>
              </g>
            );
          })}

          {/* Hover preview image */}
          {hoveredTable &&
            hoveredTableId &&
            tableImages[hoveredTable.label] && (
              <foreignObject
                x={hoveredTable.x + hoveredTable.width + 10}
                y={hoveredTable.y}
                width={300} // Увеличил ширину
                height={200} // Увеличил высоту
              >
                <div className="w-full h-full flex items-center justify-center bg-white border border-gray-300 rounded shadow-md overflow-hidden">
                  <img
                    src={tableImages[hoveredTable.label]}
                    alt={`Table ${hoveredTable.label}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              </foreignObject>
            )}
        </svg>
      </div>

      {/* Table list with reservation info */}
      <div className="w-full max-w-[700px] mx-auto space-y-2 mt-6">
        {tables
          .filter((t) => t.capacity > 0)
          .map((table) => {
            const nextAvailableTime =
              table.reserved &&
              table.reservations &&
              table.reservations.length > 0
                ? new Date(
                    Math.max(
                      ...table.reservations.map((r) =>
                        new Date(r.endTime).getTime()
                      )
                    )
                  )
                : null;

            return (
              <div
                key={table.id}
                onClick={() => handleTableSelection(table.id)}
                className={`flex justify-between items-center p-3 rounded border cursor-pointer transition hover:shadow-md ${
                  table.reserved
                    ? "bg-amber-50 border-amber-300 text-amber-800"
                    : "bg-blue-50 border-blue-200 text-blue-800"
                }`}
              >
                <div>
                  <strong>Table {table.label}</strong> — {table.capacity} seats
                  {table.reserved && nextAvailableTime && (
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
                  {table.reserved ? (
                    <>
                      <span className="w-2 h-2 bg-red-500 rounded-full"></span>{" "}
                      Reserved
                    </>
                  ) : (
                    <>
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>{" "}
                      Available
                    </>
                  )}
                </span>
              </div>
            );
          })}
      </div>

      {/* Reservation Modal */}
      <TableReservationModal
        selectedTableId={selectedTableId}
        onClose={() => setSelectedTableId(null)}
      />
    </div>
  );
}
