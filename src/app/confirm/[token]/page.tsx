"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";

export default function ConfirmPage() {
  const token = useParams().token as string;
  const [status, setStatus] = useState<
    "loading" | "confirmed" | "expired" | "error"
  >("loading");

  // Call confirmation API when component mounts
  useEffect(() => {
    async function confirmReservation() {
      try {
        // POST request to confirmation endpoint with token
        const response = await fetch("/api/confirm", {
          method: "POST",
          body: JSON.stringify({ token }),
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data = await response.json();

        // Update status based on API response
        if (response.ok) {
          setStatus(data.status);
        } else {
          setStatus("error");
        }
      } catch (error) {
        console.error("Error confirming reservation:", error);
        setStatus("error");
      }
    }

    confirmReservation();
  }, [token]);

  // Shared layout classes
  const pageWrapper =
    "min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white p-6";
  const card =
    "bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center space-y-4";
  const icon = "text-6xl";
  const title = "text-2xl font-semibold text-gray-800";
  const message = "text-gray-600";

  // Loading state
  if (status === "loading") {
    return (
      <div className={pageWrapper}>
        <div className={card}>
          <div className={`${icon} text-blue-400 animate-pulse`}>⏳</div>
          <h1 className={title}>Confirming...</h1>
          <p className={message}>
            Please wait while we verify your reservation.
          </p>
        </div>
      </div>
    );
  }

  // Success state
  if (status === "confirmed") {
    return (
      <div className={pageWrapper}>
        <div className={card}>
          <div className={`${icon} text-green-500`}>✅</div>
          <h1 className={title}>Reservation Confirmed!</h1>
          <p className={message}>Thank you! Your table is now booked.</p>
        </div>
      </div>
    );
  }

  // Expired state
  if (status === "expired") {
    return (
      <div className={pageWrapper}>
        <div className={card}>
          <div className={`${icon} text-yellow-500`}>⌛</div>
          <h1 className={title}>Link Expired</h1>
          <p className={message}>
            This link has expired. Please make a new reservation.
          </p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className={pageWrapper}>
        <div className={card}>
          <div className={`${icon} text-red-500`}>❌</div>
          <h1 className={title}>Confirmation Error</h1>
          <p className={message}>An error occurred. Please try again later.</p>
        </div>
      </div>
    );
  }
  return null;
}

