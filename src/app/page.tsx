"use client"
import { AdminLoginButton } from "@/components/AdminLoginButton";
import TableReservationForm from "@/components/TableReservation";

import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { increment, decrement } from '@/store/slices/counterSlice';
export default function Home() {
  const count = useSelector((state: RootState) => state.counter.value);
  const dispatch = useDispatch();
  return (
    <div className="p-2" >
      <div className="">
        <AdminLoginButton/>
        <TableReservationForm tableIds={["026ce3f5-1fd7-4450-bd90-bd67e74fba23", "13437306-a4f5-4124-8c58-d5d9f6bfbc82"]}/>
        <p>Count: {count}</p>
      <button onClick={() => dispatch(increment())}> + </button>
      <button onClick={() => dispatch(decrement())}> - </button>
      </div>
     
    </div>
  );
}
