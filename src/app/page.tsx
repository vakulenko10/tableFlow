"use client";
import { AdminLoginButton } from "@/components/AdminLoginButton";
import TableFloor from "@/components/TableFloor";

export default function Home() {
  return (
    <div className="p-2">
      <div className="">
        <TableFloor />
        <AdminLoginButton />
      </div>
    </div>
  );
}
