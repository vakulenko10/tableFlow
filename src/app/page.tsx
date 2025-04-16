"use client";
import { AdminLoginButton } from "@/components/AdminLoginButton";
import TableReservationForm from "@/components/TableReservation";

import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { increment, decrement } from "@/store/slices/counterSlice";
export default function Home() {
  const count = useSelector((state: RootState) => state.counter.value);
  const dispatch = useDispatch();
  return (
    <div className="p-2">
      <div className="">
        <AdminLoginButton />
        <TableReservationForm
          tableIds={[
            "b1d00a6e-9bd6-431d-b7f7-38fc76f28cf3",
            "7348d747-a9f4-4be8-926d-3e62049e6e67",
          ]}
        />
        <p>Count: {count}</p>
        <button onClick={() => dispatch(increment())}> + </button>
        <button onClick={() => dispatch(decrement())}> - </button>
      </div>
    </div>
  );
}
