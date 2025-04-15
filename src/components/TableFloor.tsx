"use client";

import { useEffect, useState } from "react";
import TableReservationModal from "./TableReservationModal";

type Table = {
  id: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  capacity: number;
};

export default function TableFloor() {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTables() {
      const res = await fetch("/api/tables");
      const data = await res.json();
      setTables(data);
      setLoading(false);
    }

    fetchTables();
  }, []);

  if (loading) {
    return <p className="text-center text-gray-600">Loading tables...</p>;
  }

  return (
    <div className="w-full overflow-auto border rounded-lg bg-white shadow-md p-4">
      <h2 className="text-xl font-semibold mb-4">Floor Map</h2>
      <svg width={800} height={600} className="border bg-gray-50">
        {tables.map((table) => (
          <g key={table.id} onClick={() => setSelectedTableId(table.id)}>
            <rect
              x={table.x}
              y={table.y}
              width={table.width}
              height={table.height}
              fill="#60A5FA"
              stroke="#1D4ED8"
              strokeWidth={2}
              rx={6}
              ry={6}
              className="cursor-pointer hover:fill-blue-400 transition"
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
              {table.label}
            </text>
          </g>
        ))}
      </svg>

      {/* Modal */}
      <TableReservationModal selectedTableId={selectedTableId} />
    </div>
  );
}
