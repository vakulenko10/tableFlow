"use client"
import React, { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ReservationItem } from './page';
import { Button } from '@/components/ui/button';
import { useNotification } from '../hooks/useNotification';
interface ReservationModalProps {
    reservation: ReservationItem,
    closeModal: () => void,
    setReservations: React.Dispatch<React.SetStateAction<ReservationItem[]>>
    open: boolean
}
const ReservationModal = ({reservation, closeModal, setReservations, open}:ReservationModalProps) => {
    console.log('reservation.id for reservation modal is:',reservation.id)
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<Partial<ReservationItem>>({});

      const { notify } = useNotification();
    const handleCloseModal = () =>{
        closeModal()
        setFormData({});
        setIsEditing(false);
    }

    const deleteReservation = async (id: string) => {
        const res = await fetch(`/api/dashboard/reservations?id=${id}`, { method: "DELETE" });
        if (res.ok) {
          notify("Reservation deleted successfully", "success");
          setReservations((prev) => prev.filter((r) => r.id !== id));
        } else {
          notify("Failed to delete reservation", "error");
        }
        handleCloseModal();
      };
      const cancelReservation = async (id: string) => {
        const res = await fetch(`/api/dashboard/reservations/cancel`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        });
      
        if (res.ok) {
          notify("Reservation cancelled", "success");
          setReservations((prev) =>
            prev.map((r) => (r.id === id ? { ...r, status: "CANCELLED" } : r))
          );
        } else {
          notify("Failed to cancel reservation", "error");
        }
      };
        
        const updateReservation = async () => {
          if (!reservation) return;
          const res = await fetch(`/api/dashboard/reservations?id=${reservation.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
          });
          if (res.ok) {
            notify("Reservation updated successfully", "success");
            setReservations((prev) =>
              prev.map((r) => (r.id == reservation.id ? { ...r, ...formData } as ReservationItem : r))
            );
          } else {
            notify("Failed to update reservation", "error");
          }
          handleCloseModal();
        };
        const handleInputChange = (key: keyof ReservationItem, value: string) => {
            setFormData((prev) => ({ ...prev, [key]: value }));
          };

          useEffect(() => {
            if (open && reservation) {
              setFormData(reservation);
              setIsEditing(false);
            }
          }, [open, reservation]);
  return (
    <Dialog open={open} onOpenChange={(val) => !val && handleCloseModal()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reservation Details</DialogTitle>
          </DialogHeader>
          {open && reservation && (
            <div className="space-y-2">
              {(["name", "email"] as const).map((field) => (
                <div key={field}>
                  <label className="block text-sm font-medium capitalize">
                    {field}:
                  </label>
                  <input
                    value={formData[field] ?? ""}
                    disabled={!isEditing}
                    onChange={(e) => handleInputChange(field, e.target.value)}
                    className={`border px-2 py-1 rounded w-full ${
                      isEditing ? "text-black" : "text-gray-500"
                    }`}
                  />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium">Date:</label>
                <input
                  type="date"
                  value={formData.date ?? ""}
                  disabled={!isEditing}
                  onChange={(e) => handleInputChange("date", e.target.value)}
                  className={`border px-2 py-1 rounded w-full ${
                    isEditing ? "text-black" : "text-gray-500"
                  }`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Start Time:</label>
                <input
                  type="datetime-local"
                  value={formData.startTime ?? ""}
                  disabled={!isEditing}
                  onChange={(e) =>
                    handleInputChange("startTime", e.target.value)
                  }
                  className={`border px-2 py-1 rounded w-full ${
                    isEditing ? "text-black" : "text-gray-500"
                  }`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium">End Time:</label>
                <input
                  type="datetime-local"
                  value={formData.endTime ?? ""}
                  disabled={!isEditing}
                  onChange={(e) => handleInputChange("endTime", e.target.value)}
                  className={`border px-2 py-1 rounded w-full ${
                    isEditing ? "text-black" : "text-gray-500"
                  }`}
                />
              </div>

              <DialogFooter className="mt-4 space-x-2">
                {!isEditing ? (
                  <Button onClick={() => setIsEditing(true)}>Edit</Button>
                ) : (
                  <Button onClick={updateReservation}>Save</Button>
                )}
                <Button
                  onClick={() => cancelReservation(reservation.id)}
                  variant="destructive"
                >
                  Cancel Reservation
                </Button>
                <Button
                  onClick={() => deleteReservation(reservation.id)}
                  variant="destructive"
                >
                  Delete
                </Button>
                <Button variant="outline" onClick={handleCloseModal}>
                  Close
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
  )
}

export default ReservationModal