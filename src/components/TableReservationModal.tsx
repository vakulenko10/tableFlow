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
