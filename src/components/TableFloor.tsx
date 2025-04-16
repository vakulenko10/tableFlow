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
  const [svgHeight, setSvgHeight] = useState(ORIGINAL_HEIGHT);
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
          y: height / svgHeight,
        });
      }
    }

    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, [svgHeight]);

  useEffect(() => {
    if (tables.length > 0) {
      const maxY = Math.max(...tables.map((t) => t.y + t.height));
      setSvgHeight(maxY + 50); // немного отступа снизу
    }
  }, [tables]);

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
        viewBox={`0 0 ${ORIGINAL_WIDTH} ${svgHeight}`}
        preserveAspectRatio="xMidYMid meet"
        className="md:w-1/2 w-full h-auto border bg-gray-50"
      >
        {tables.map((table) => {
          const isBar = table.label.includes("BAR");
          const isKids = table.label === "KIDS";
          const isTable = table.capacity > 0;

          const fillColor = isBar
            ? "#EF4444" // бар — красный
            : isKids
            ? "#22C55E" // детская — зелёный
            : "#3B82F6"; // обычный стол — синий

          return (
            <g
              key={table.id}
              onClick={() => {
                if (isTable) setSelectedTableId(table.id);
              }}
              className={isTable ? "cursor-pointer" : "cursor-default"}
            >
              <title>
                {isTable
                  ? `Стол ${table.label} — ${table.capacity} человек`
                  : `Зона: ${table.label}`}
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
                {isTable ? `${table.label} (${table.capacity})` : table.label}
              </text>
            </g>
          );
        })}
      </svg>

      <TableReservationModal selectedTableId={selectedTableId} />
    </div>
  );
}
