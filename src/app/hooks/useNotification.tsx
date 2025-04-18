"use client";

import { toast, Toaster } from "sonner";
import React from "react";

/** Place <NotificationProvider /> once in your root (e.g. layout.tsx) */
export function NotificationProvider() {
  return <Toaster position="top-right" richColors />;
}

/** Hook to trigger text toasts */
export function useNotification() {
  const notify = (message: string, type: "success" | "error" = "success") => {
    toast[type](message, {
      action: {
        label: "Close",
        onClick: () => toast.dismiss(),
      },
    });
  };
  return { notify };
}
