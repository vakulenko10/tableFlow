export interface Reservation {
    id: string;
    startTime: string;
    endTime: string;
    status: "PENDING" | "CONFIRMED" | "CANCELLED";
  }
  
  export interface Table {
    id: string;
    label: string;
    x: number;
    y: number;
    width: number;
    height: number;
    capacity: number;
    reserved: boolean;
    reservations: Reservation[];
  }
  