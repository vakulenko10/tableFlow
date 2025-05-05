"use client"
import React, { useState } from 'react'
import ReservationModal from './ReservationModal';
import { ReservationItem as ReservationItemType } from './page';
interface ReservationItemProps {
    reservation: ReservationItemType,
    setReservations: React.Dispatch<React.SetStateAction<ReservationItemType[]>>
}
const ReservationItem = ({reservation, setReservations}:ReservationItemProps) => {
   
    const [isOpen, setIsOpen] = useState(false)
    const closeModal = () => {
            setIsOpen(false)
          };
  return (
    <tr
    key={reservation.id}
    className="cursor-pointer hover:bg-gray-50"
    onClick={() => {
      setIsOpen(true)
    }}
  >
    <td className="border px-4 py-2">{reservation.name}</td>
    <td className="border px-4 py-2">{reservation.email}</td>
    <td className="border px-4 py-2">
      {new Date(reservation.date).toLocaleDateString()}
    </td>
    <td className="border px-4 py-2">
      {new Date(reservation.startTime).toLocaleTimeString()} -{" "}
      {new Date(reservation.endTime).toLocaleTimeString()}
    </td>
    <td className="border px-4 py-2">{reservation.status}</td>
    <td className="border px-4 py-2">
      {reservation.tables.map((t) => t.table.label).join(", ")}
    </td>
    <td className="border px-4 py-2">
      {new Date(reservation.createdAt).toLocaleString()}
    </td>
    {isOpen&&<ReservationModal reservation={reservation} open={isOpen} closeModal={closeModal}  setReservations={setReservations}/>}
  </tr>
  )
}

export default ReservationItem