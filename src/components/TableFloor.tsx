"use client";

import { useEffect, useRef, useState } from "react";
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

const ORIGINAL_WIDTH = 1000;
const ORIGINAL_HEIGHT = 800;

export default function TableFloor() {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [scale, setScale] = useState({ x: 1, y: 1 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchTables() {
      const res = await fetch("/api/tables");
      const data = await res.json();
      setTables(data);
      setLoading(false);
    }

    fetchTables();
  }, []);

  useEffect(() => {
    function updateScale() {
      const container = containerRef.current;
      if (container) {
        const width = container.offsetWidth;
        const height = container.offsetHeight;
        setScale({
          x: width / ORIGINAL_WIDTH,
          y: height / ORIGINAL_HEIGHT,
        });
      }
    }

    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  if (loading) {
    return <p className="text-center text-gray-600">Loading tables...</p>;
  }

  return (
    <div
      className="w-full overflow-auto border rounded-lg bg-white shadow-md p-4"
      ref={containerRef}
    >
      <h2 className="text-xl font-semibold mb-4">Floor Map</h2>
      <svg
        width="100%"
        height="auto"
        viewBox={`0 0 ${ORIGINAL_WIDTH} ${ORIGINAL_HEIGHT}`}
        preserveAspectRatio="xMidYMid meet"
        className="border bg-gray-50"
      >
        {tables.map((table) => {
          // const scaledX = table.x * scale.x;
          // const scaledY = table.y * scale.y;
          // const scaledWidth = table.width * scale.x;
          // const scaledHeight = table.height * scale.y;

          return (
            <g
              key={table.id}
              onClick={() => {
                if (table.capacity > 0) {
                  setSelectedTableId(table.id);
                }
              }}
              className={table.capacity > 0 ? "cursor-pointer" : "cursor-default"}
            >
              <title>
                {table.capacity > 0
                  ? `Стол ${table.label} — ${table.capacity} человек`
                  : `Зона: ${table.label}`}
              </title>

              <rect
                x={table.x}
                y={table.y}
                width={table.width}
                height={table.height}
                fill={table.capacity > 0 ? "#60A5FA" : "#A78BFA"}
                stroke="#1D4ED8"
                strokeWidth={2}
                rx={6}
                ry={6}
                className="transition"
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
                {table.capacity > 0
                  ? `${table.label} (${table.capacity})`
                  : table.label}
              </text>
            </g>
          );
        })}
      </svg>

      <TableReservationModal selectedTableId={selectedTableId} />
    </div>
  );
}
