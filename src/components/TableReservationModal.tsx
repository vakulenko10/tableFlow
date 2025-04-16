"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import TableReservationForm from "./TableReservation";

export default function TableReservationModal({
  selectedTableId,
  onClose, 
}: {
  selectedTableId: string | null;
  onClose: () => void; 
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (selectedTableId) {
      setOpen(true);
    }
  }, [selectedTableId]);

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      onClose(); 
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 fixed">
        <DialogHeader>
          <DialogTitle>Reserve Table</DialogTitle>
        </DialogHeader>

        {selectedTableId && (
          <TableReservationForm tableIds={[selectedTableId]} />
        )}
      </DialogContent>
    </Dialog>
  );
}
