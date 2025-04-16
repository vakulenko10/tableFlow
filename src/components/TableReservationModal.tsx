"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import TableReservationForm from "./TableReservation";

interface TableReservationModalProps {
  selectedTableId: string | null;
  onClose?: () => void;
}

export default function TableReservationModal({
  selectedTableId,
  onClose,
}: TableReservationModalProps) {
  const [dialogOpen, setDialogOpen] = useState<boolean>(!!selectedTableId);

  // Sync modal open state with selectedTableId
  useEffect(() => {
    setDialogOpen(!!selectedTableId);
  }, [selectedTableId]);

  const handleOpenChange = (isOpen: boolean) => {
    setDialogOpen(isOpen);
    if (!isOpen && onClose) {
      onClose(); // Let parent clear selectedTableId
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
      <DialogContent>
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
