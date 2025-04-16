"use client"; 

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";

/**
 * Confirmation Page Component
 * Shown when users click the confirmation link from their email
 * Handles the confirmation process for pending reservations
 */
export default function ConfirmPage() {

  const params = useParams<{ token: string }>();
  const token = params.token as string;

  const [status, setStatus] = useState<
    "loading" | "confirmed" | "expired" | "error"
  >("loading");

  // Call confirmation API when component mounts
  useEffect(() => {
    async function confirmReservation() {
      try {
        // POST request to confirmation endpoint with token
        const response = await fetch(`/api/confirm/${token}`, {
          method: "POST",
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
  }, [token]); // Re-run if token changes

  // Loading state while API request is in progress
  if (status === "loading") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-8">
        <h1 className="text-3xl font-bold mb-4">⏳ Loading...</h1>
        <p className="text-lg">
          Please wait while we confirm your reservation.
        </p>
      </div>
    );
  }

  // Success state - reservation confirmed
  if (status === "confirmed") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-8">
        <h1 className="text-3xl font-bold mb-4">✅ Reservation Confirmed!</h1>
        <p className="text-lg">Thanks for confirming your reservation.</p>
      </div>
    );
  }

  // Expired state - confirmation time window passed
  if (status === "expired") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-8">
        <h1 className="text-3xl font-bold mb-4">⏳ Link Expired</h1>
        <p className="text-lg">
          Sorry, this confirmation link has expired. Please make a new
          reservation.
        </p>
      </div>
    );
  }

  // Error state - API error or invalid token
  if (status === "error") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-8">
        <h1 className="text-3xl font-bold mb-4">❌ Error</h1>
        <p className="text-lg">
          An error occurred while confirming your reservation. Please try again
          later.
        </p>
      </div>
    );
  }

  return null; 
}
