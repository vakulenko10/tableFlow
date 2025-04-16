"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import TableReservationForm from "./TableReservation";
import { useDispatch } from "react-redux";
import { setSelectedTableIds } from "@/store/slices/tableSlice";

interface TableReservationModalProps {
  selectedTableId: string | null;
  onClose?: () => void;
}

export default function TableReservationModal({
  selectedTableId,
  onClose,
}: TableReservationModalProps) {
  const [dialogOpen, setDialogOpen] = useState<boolean>(!!selectedTableId);
  const dispatch = useDispatch();

  // Sync modal open state with selectedTableId
  useEffect(() => {
    setDialogOpen(!!selectedTableId);

    // Update Redux store with selected table
    if (selectedTableId) {
      dispatch(setSelectedTableIds([selectedTableId]));
    }
  }, [selectedTableId, dispatch]);

  const handleOpenChange = (isOpen: boolean) => {
    setDialogOpen(isOpen);
    if (!isOpen) {
      if (onClose) {
        onClose();
      }
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reserve Table</DialogTitle>
        </DialogHeader>
        <TableReservationForm />
      </DialogContent>
    </Dialog>
  );
}
