"use client";
import { AdminLoginButton } from "@/components/AdminLoginButton";
import TableReservationForm from "@/components/TableReservation";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { fetchTables, setSelectedTableIds } from "@/store/slices/tableSlice";

export default function Home() {
  const { tables, loading } = useSelector((state: RootState) => state.tables);
  const dispatch = useDispatch();

  useEffect(() => {
    // Fetch tables when component mounts
    dispatch(fetchTables());
  }, [dispatch]);

  const selectTableForReservation = (tableId: string) => {
    dispatch(setSelectedTableIds([tableId]));
  };

  return (
    <div className="p-2">
      <div className="">
        <AdminLoginButton />
        <TableReservationForm />

        {loading ? (
          <p>Loading tables...</p>
        ) : (
          <div className="grid grid-cols-3 gap-3 mt-6">
            {tables
              .filter((table) => table.capacity > 0)
              .map((table) => (
                <button
                  key={table.id}
                  className="p-3 border rounded bg-blue-50 hover:bg-blue-100"
                  onClick={() => selectTableForReservation(table.id)}
                >
                  Table {table.label} ({table.capacity} seats)
                </button>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
