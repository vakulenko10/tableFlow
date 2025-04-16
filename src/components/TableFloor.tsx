"use client";

import { useEffect, useRef, useState } from "react";
import TableReservationModal from "./TableReservationModal";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import { fetchTables, selectTable } from "@/store/slices/tableSlice";

const ORIGINAL_WIDTH = 1000;
const ORIGINAL_HEIGHT = 800;

export default function TableFloor() {
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [scale, setScale] = useState({ x: 1, y: 1 });
  const containerRef = useRef<HTMLDivElement>(null);

  const dispatch = useDispatch();
  const { tables, loading, error } = useSelector(
    (state: RootState) => state.tables
  );

  useEffect(() => {
    dispatch(fetchTables());
  }, [dispatch]);

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

  const handleTableClick = (tableId: string) => {
    setSelectedTableId(tableId);
    dispatch(selectTable(tableId));
  };

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
        {tables.map((table) => (
          <g
            key={table.id}
            onClick={() => {
              if (table.capacity > 0) {
                handleTableClick(table.id);
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
        ))}
      </svg>

      <TableReservationModal selectedTableId={selectedTableId} />
    </div>
  );
}
