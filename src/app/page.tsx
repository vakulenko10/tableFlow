"use client";
import { AdminLoginButton } from "@/components/AdminLoginButton";
import TableReservationForm from "@/components/TableReservation";

export default function Home() {
  return (
    <div className="p-2">
      <div className="">
        <AdminLoginButton />
        <TableReservationForm />
      </div>
    </div>
  );
}
