"use client";

import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import { useAppDispatch } from "@/store/hooks";
import { fetchTables, setSelectedTableIds } from "@/store/slices/tableSlice";
import useSocketListener from "@/app/hooks/useSocketListener";
import TableItem from "./TableItem";
import TableListItem from "./TableListItem";
import TableReservationModal from "./TableReservationModal";
import Image from "next/image";

// ======= ХУК ДЛЯ МОБИЛЬНОГО =========
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return isMobile;
}

// Hook for extra small screens (below 425px)
function useIsExtraSmall() {
  const [isExtraSmall, setIsExtraSmall] = useState(false);

  useEffect(() => {
    const checkExtraSmall = () => setIsExtraSmall(window.innerWidth < 425);
    checkExtraSmall();
    window.addEventListener("resize", checkExtraSmall);
    return () => window.removeEventListener("resize", checkExtraSmall);
  }, []);

  return isExtraSmall;
}
// ===================================
const ORIGINAL_WIDTH = 1000;
const ORIGINAL_HEIGHT = 800;

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
  const dispatch = useAppDispatch();
  const { tables, loading } = useSelector((state: RootState) => state.tables);
  const [hoveredTableId, setHoveredTableId] = useState<string | null>(null);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [svgHeight, setSvgHeight] = useState(ORIGINAL_HEIGHT);
  const [viewMode, setViewMode] = useState<"map" | "list">("map");
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const isExtraSmall = useIsExtraSmall();

  useEffect(() => {
    dispatch(fetchTables());
  }, [dispatch]);
  console.log("tables: ", tables);

  useEffect(() => {
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
    <div className="w-full overflow-auto border rounded-lg bg-gradient-to-b bg-white shadow-md p-4 space-y-4">
      <div
        className={`border rounded-lg p-2 bg-blue-50 ${
          isExtraSmall
            ? "flex flex-col items-center"
            : "flex justify-between items-center"
        } mb-4`}
      >
        <h2 className={`text-xl font-semibold ${isExtraSmall ? "mb-2" : ""}`}>
          Floor Map
        </h2>

        <div
          className={`flex items-center ${
            isExtraSmall ? "justify-center" : ""
          } gap-4`}
        >
          <div className="flex items-center gap-1">
            <span>Available</span>
            <div className="w-4 h-4 bg-blue-500 rounded" />
          </div>
          <div className="flex items-center gap-1">
            <span>Reserved</span>
            <div className="w-4 h-4 bg-red-500 rounded" />
          </div>

          {!isMobile && (
            <div className="hidden md:flex border rounded overflow-hidden">
              <button
                onClick={() => setViewMode("map")}
                className={`px-3 py-1 ${
                  viewMode === "map"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-800"
                }`}
              >
                Map
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`px-3 py-1 ${
                  viewMode === "list"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-800"
                }`}
              >
                List
              </button>
            </div>
          )}
        </div>
      </div>

      <div ref={containerRef}>
        {(viewMode === "map" || isMobile) && (
          <svg
            viewBox={`0 0 ${ORIGINAL_WIDTH} ${svgHeight}`}
            preserveAspectRatio="xMidYMid meet"
            className="w-full max-w-[800px] mx-auto h-auto border rounded shadow"
          >
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
            {tables.map((table) => (
              <TableItem
                key={table.id}
                table={table}
                onHover={setHoveredTableId}
                onClick={handleTableSelection}
              />
            ))}

            {hoveredTable &&
              hoveredTableId &&
              tableImages[hoveredTable.label] && (
                <foreignObject
                  x={hoveredTable.x + hoveredTable.width + 10}
                  y={hoveredTable.y}
                  width={300}
                  height={200}
                >
                  <div className="w-full h-full flex items-center justify-center bg-white border border-gray-300 rounded shadow-md overflow-hidden">
                    <Image
                      src={tableImages[hoveredTable.label]}
                      alt={`Table ${hoveredTable.label}`}
                      className="w-full h-full object-cover"
                      fill
                    />
                  </div>
                </foreignObject>
              )}
          </svg>
        )}

        {(viewMode === "list" || isMobile) && (
          <div className="w-full max-w-[700px] mx-auto space-y-2 mt-6">
            {tables
              .filter((t) => t.capacity > 0)
              .map((table) => (
                <TableListItem
                  key={table.id}
                  table={table}
                  onClick={handleTableSelection}
                />
              ))}
          </div>
        )}
      </div>

      <TableReservationModal
        selectedTableId={selectedTableId}
        onClose={() => setSelectedTableId(null)}
      />
    </div>
  );
}
