import { AdminLoginButton } from "@/components/AdminLoginButton";
import TableReservationForm from "@/components/TableReservation";

export default function Home() {
  return (
    <div className="p-2" >
      <div className="">
        <AdminLoginButton/>
        <TableReservationForm tableIds={["026ce3f5-1fd7-4450-bd90-bd67e74fba23", "13437306-a4f5-4124-8c58-d5d9f6bfbc82"]}/>
      </div>
     
    </div>
  );
}
