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
import useSocketListener from "@/app/hooks/useSocketListener";
import Image from "next/image";

interface TableReservationModalProps {
  selectedTableId: string | null;
  onClose?: () => void;
}

export default function TableReservationModal({
  selectedTableId,
  onClose,
}: TableReservationModalProps) {
  useSocketListener();
  const [dialogOpen, setDialogOpen] = useState<boolean>(!!selectedTableId);
  const dispatch = useAppDispatch();
  const { tables } = useSelector((state: RootState) => state.tables);
  const { notify } = useNotification();

  const selectedTable = selectedTableId
    ? tables.find((t) => t.id === selectedTableId)
    : null;

  const today = new Date();
  const selectedDateString = today.toISOString().split("T")[0];

  // Get the selected date from TableReservationForm via prop or local state
  const [selectedDate, setSelectedDate] = useState(selectedDateString);

  const now = new Date();

  // Get all not-cancelled reservations for the selected date, sorted by start time
  const reservationsForDate =
    selectedTable?.reservations
      ?.filter(
        (r) =>
          r.status !== "CANCELLED" &&
          new Date(r.startTime).toISOString().split("T")[0] === selectedDate
      )
      .sort(
        (a, b) =>
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      ) ?? [];

  // Find the first reservation that is currently active (now between start and end)
  const currentReservation = reservationsForDate.find(
    (r) => new Date(r.startTime) <= now && new Date(r.endTime) > now
  );

  // Find the next reservation that starts after now
  const nextReservation = reservationsForDate.find(
    (r) => new Date(r.startTime) > now
  );

  // Find the next reservation that starts after currentReservation ends
  let afterCurrent: typeof nextReservation | undefined = undefined;
  if (currentReservation) {
    afterCurrent = reservationsForDate.find(
      (r) =>
        new Date(r.startTime).getTime() >=
        new Date(currentReservation.endTime).getTime()
    );
  }

  const minTime = new Date(`${selectedDateString}T12:00`);
  const maxTime = new Date(`${selectedDateString}T24:00`); // ⬅️ Updated to 22:00

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
              ? `Table Reservation #${selectedTable.label} (${selectedTable.capacity} seats)`
              : "Table Reservation"}
          </DialogTitle>

          {/* {selectedTable?.label && tableImages[selectedTable.label] && (
            <div className="block sm:hidden mb-4">
              <div className="w-full h-48 rounded overflow-hidden border border-gray-200 shadow relative">
                <Image
                  src={tableImages[selectedTable.label]}
                  alt={`Table ${selectedTable.label}`}
                  className="w-full h-full object-cover"
                  fill
                />
              </div>
            </div>
          )} */}

          {/* Show info about current or next reservation */}
          {currentReservation && (
            <>
              {/* The table is currently reserved — show until what time */}
              <p className="text-sm text-amber-600 mt-1 p-2 bg-amber-50 border border-amber-200 rounded">
                ⏰ This table is reserved until{" "}
                {new Date(currentReservation.endTime).toLocaleTimeString()} on{" "}
                {selectedDate}. You can book it starting from this time.
              </p>
              {/* If there is a next reservation after current, show it */}
              {afterCurrent && (
                <p className="text-sm text-blue-600 mt-1 p-2 bg-blue-50 border border-blue-200 rounded">
                  ℹ️ Next reservation:{" "}
                  {new Date(afterCurrent.startTime).toLocaleTimeString()}–
                  {new Date(afterCurrent.endTime).toLocaleTimeString()} on{" "}
                  {selectedDate}
                </p>
              )}
            </>
          )}
          {!currentReservation && nextReservation && (
            // The table is free, but there is a future reservation — show when the next one is
            <p className="text-sm text-blue-600 mt-1 p-2 bg-blue-50 border border-blue-200 rounded">
              ℹ️ Next reservation:{" "}
              {new Date(nextReservation.startTime).toLocaleTimeString()}–
              {new Date(nextReservation.endTime).toLocaleTimeString()} on{" "}
              {selectedDate}
            </p>
          )}
        </DialogHeader>

        <TableReservationForm
          suggestedStartTime={
            currentReservation ? new Date(currentReservation.endTime) : null
          }
          isTableReserved={!!currentReservation}
          minTime={minTime}
          maxTime={maxTime}
          selectedDate={selectedDate}
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
