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
import { useAppDispatch } from "@/store/hooks";
import { setSelectedTableIds } from "@/store/slices/tableSlice";
import { RootState } from "@/store";
import { useNotification } from "@/app/hooks/useNotification";

interface TableReservationModalProps {
  selectedTableId: string | null;
  onClose?: () => void;
}

export default function TableReservationModal({
  selectedTableId,
  onClose,
}: TableReservationModalProps) {
  const [dialogOpen, setDialogOpen] = useState<boolean>(!!selectedTableId);
  const dispatch = useAppDispatch();
  const { tables } = useSelector((state: RootState) => state.tables);
  const { notify } = useNotification();

  const selectedTable = selectedTableId
    ? tables.find((t) => t.id === selectedTableId)
    : null;

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

  const today = new Date();
  const selectedDateString = today.toISOString().split("T")[0];

  const minTime = new Date(`${selectedDateString}T12:00`);
  const maxTime = new Date(`${selectedDateString}T22:00`); // ⬅️ Updated to 22:00

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

  useEffect(() => {
    setDialogOpen(!!selectedTableId);
    if (selectedTableId) {
      dispatch(setSelectedTableIds([selectedTableId]));
    }
  }, [selectedTableId, dispatch]);

  const handleOpenChange = (isOpen: boolean) => {
    setDialogOpen(isOpen);
    if (!isOpen && onClose) {
      onClose();
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
          {isTableReserved && nextAvailableTime && (
            <p className="text-sm text-amber-600 mt-1 p-2 bg-amber-50 border border-amber-200 rounded">
              ⏰ This table is currently reserved until{" "}
              {nextAvailableTime.toLocaleTimeString()}. We have automatically
              set the reservation start time for after it becomes available.
              Please select a convenient end time.
            </p>
          )}
        </DialogHeader>

        <TableReservationForm
          suggestedStartTime={nextAvailableTime}
          isTableReserved={isTableReserved}
          minTime={minTime}
          maxTime={maxTime}
          onSuccess={() => {
            onClose?.();
            notify(
              "A confirmation email has been sent. Please check your inbox.",
              "success"
            );
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
