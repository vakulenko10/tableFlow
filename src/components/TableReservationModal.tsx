"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import TableReservationForm from "./TableReservation";
import { useSelector } from "react-redux";
import { useAppDispatch } from "@/store/hooks"; // Type-safe dispatch hook
import { setSelectedTableIds } from "@/store/slices/tableSlice"; // Action to update selected tables
import { RootState } from "@/store";

interface TableReservationModalProps {
  selectedTableId: string | null;
  onClose?: () => void;
}

export default function TableReservationModal({
  selectedTableId,
  onClose,
}: TableReservationModalProps) {
  // Track dialog open state, initially based on whether a table is selected
  const [dialogOpen, setDialogOpen] = useState<boolean>(!!selectedTableId);
  const dispatch = useAppDispatch();
  const { tables } = useSelector((state: RootState) => state.tables);

  // Get details of the selected table from Redux store
  const selectedTable = selectedTableId
    ? tables.find((t) => t.id === selectedTableId)
    : null;

  // Determine if table is reserved and when it will be available
  const isTableReserved = selectedTable?.reserved || false;
  const nextAvailableTime =
    isTableReserved && selectedTable?.reservations?.length
      ? new Date(
          Math.max(
            ...selectedTable.reservations.map((r) =>
              new Date(r.endTime).getTime()
            )
          )
        )
      : null;
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

  // Keep dialog state in sync with selectedTableId prop
  useEffect(() => {
    setDialogOpen(!!selectedTableId);

    // Update Redux store with selected table
    if (selectedTableId) {
      dispatch(setSelectedTableIds([selectedTableId]));
    }
  }, [selectedTableId, dispatch]);

  // Handle dialog open/close events
  const handleOpenChange = (isOpen: boolean) => {
    setDialogOpen(isOpen);
    if (!isOpen && onClose) {
      onClose(); // Notify parent component when dialog closes
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {selectedTable
              ? `Table Reservation #${selectedTable.label} (${selectedTable.capacity} мест)`
              : "Table Reservation"}
          </DialogTitle>

          {/* Превью фото столика — показывается только на мобильных */}
          {selectedTable?.label && tableImages[selectedTable.label] && (
            <div className="block sm:hidden mb-4">
              <div className="w-full h-48 rounded overflow-hidden border border-gray-200 shadow">
                <img
                  src={tableImages[selectedTable.label]}
                  alt={`Table ${selectedTable.label}`}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}
          {/* Show notification when table is currently reserved */}
          {isTableReserved && nextAvailableTime && (
            <p className="text-sm text-amber-600 mt-1 p-2 bg-amber-50 border border-amber-200 rounded">
              ⏰ This table is currently reserved until{" "}
              {nextAvailableTime.toLocaleTimeString()}. We have automatically
              set the reservation start time for after it becomes available.
              Please select a convenient end time.
            </p>
          )}
        </DialogHeader>
        {/* Pass relevant props to the reservation form */}
        <TableReservationForm
          suggestedStartTime={nextAvailableTime}
          isTableReserved={isTableReserved}
        />
      </DialogContent>
    </Dialog>
  );
}
