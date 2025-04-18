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

export default function TableFloor() {
   useSocketListener(); 
  const dispatch = useAppDispatch(); // Type-safe dispatch for Redux actions
  const { tables, loading } = useSelector((state: RootState) => state.tables); // Get tables from Redux

  // Component state
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null); // Currently selected table
  const [svgHeight, setSvgHeight] = useState(ORIGINAL_HEIGHT); // Dynamic height based on table positions
  const [viewMode, setViewMode] = useState<"map" | "list">("map"); // Toggle between visual map and list view
  const containerRef = useRef<HTMLDivElement>(null); // Reference to container for dimensions

  // Load tables data when component mounts
  useEffect(() => {
    dispatch(fetchTables());
  }, [dispatch]);

  // Dynamically adjust SVG height based on table positions
  useEffect(() => {
    if (tables.length > 0) {
      const maxY = Math.max(...tables.map((t) => t.y + t.height));
      setSvgHeight(maxY + 50); // Add padding at the bottom
    }
  }, [tables]);

  // Handle table selection and update Redux state
  const handleTableSelection = (tableId: string) => {
    setSelectedTableId(tableId);
    dispatch(setSelectedTableIds([tableId]));
  };

  // Show loading indicator while fetching data
  if (loading) {
    return <p className="text-center text-gray-600">Loading tables...</p>;
  }

  return (
    <div className="w-full overflow-auto border rounded-lg bg-white shadow-md p-4 space-y-4">
      {/* Header with view mode toggle button */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Floor Map</h2>
        <button
          onClick={() =>
            setViewMode((prev) => (prev === "map" ? "list" : "map"))
          }
          className="text-sm px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white transition"
        >
          Switch to {viewMode === "map" ? "list" : "map"}
        </button>
      </div>

      {/* MAP VIEW - Visual representation of the restaurant floor */}
      {viewMode === "map" ? (
        <>
          {/* Legend explaining the table status colors */}
          <div className="flex gap-4 text-sm mb-2 justify-end flex-wrap sm:flex-nowrap">
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-blue-500 rounded" /> Available
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-red-500 rounded" /> Reserved
            </div>
          </div>

          {/* SVG floor map */}
          <div ref={containerRef}>
            <svg
              viewBox={`0 0 ${ORIGINAL_WIDTH} ${svgHeight}`}
              preserveAspectRatio="xMidYMid meet"
              className="w-full max-w-[800px] mx-auto h-auto border rounded shadow"
            >
              {/* Wood texture pattern for floor background */}
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

              {/* Floor background */}
              <rect
                x={0}
                y={0}
                width={ORIGINAL_WIDTH}
                height={svgHeight}
                fill="url(#woodTexture)"
              />

              {/* Render all tables and decorative elements */}
              {tables.map((table) => {
                const isTable = table.capacity > 0; // True for tables, false for decorations
                const isReserved = table.reserved; // Whether table is currently reserved

                // Color based on table status
                const fillColor = isReserved
                  ? "#EF4444" // Red for reserved tables
                  : isTable
                  ? "#3B82F6" // Blue for available tables
                  : "#a78bfa"; // Purple for decorative elements

                // Calculate when the table will be available next
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
                    onClick={() => {
                      // Allow selecting any table with capacity > 0
                      if (isTable) handleTableSelection(table.id);
                    }}
                    className={
                      isTable
                        ? "cursor-pointer transition-transform duration-300 ease-in-out hover:-translate-y-1"
                        : "cursor-default"
                    }
                  >
                    {/* Tooltip information on hover */}
                    <title>
                      {isTable
                        ? `Table ${table.label} — ${table.capacity} people${
                            isReserved
                              ? ` (Reserved until ${nextAvailableTime?.toLocaleTimeString()})`
                              : ""
                          }`
                        : `Area: ${table.label}`}
                    </title>

                    {/* Table rectangle shape */}
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

                    {/* Table label with capacity */}
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
            </svg>
          </div>
        </>
      ) : (
        // LIST VIEW - Tabular representation of available tables
        <div className="w-full max-w-[700px] mx-auto space-y-2">
          {tables
            .filter((t) => t.capacity > 0) // Show only actual tables
            .map((table) => {
              // Calculate when table will be available
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
                    <strong>Table {table.label}</strong> — {table.capacity}{" "}
                    seats
                    {/* Show availability time for reserved tables */}
                    {table.reserved && nextAvailableTime && (
                      <div className="block text-sm mt-1">
                        <span className="font-medium text-red-600">
                          Reserved until{" "}
                          {nextAvailableTime.toLocaleTimeString()}
                        </span>
                        <span className="block text-gray-600">
                          Click to book for a later time
                        </span>
                      </div>
                    )}
                  </div>
                  {/* Status indicator */}
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
      )}

      {/* Reservation modal - appears when a table is selected */}
      <TableReservationModal
        selectedTableId={selectedTableId}
        onClose={() => setSelectedTableId(null)}
      />
    </div>
  );
}
