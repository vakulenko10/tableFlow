"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import TableReservationForm from "./TableReservation";

export default function TableReservationModal({ selectedTableId }: { selectedTableId: string | null }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={!!selectedTableId} onOpenChange={setOpen}>
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
