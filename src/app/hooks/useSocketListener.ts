"use client";

import { useEffect } from "react";
import { io } from "socket.io-client";
import { useAppDispatch } from "@/store/hooks";
import { fetchTables } from "@/store/slices/tableSlice";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";

export default function useSocketListener() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ["websocket"],
      reconnectionAttempts: 5,
    });

    socket.on("connect", () => {
      console.log("✅ Connected to WebSocket:", socket.id);
    });

    socket.on("reservation:update", (data) => {
      console.log("📡 Received table update via WebSocket");
      dispatch(fetchTables()); // or use the `data` if you want to update state directly
    });

    socket.on("disconnect", () => {
      console.log("❌ Disconnected from WebSocket");
    });

    return () => {
      socket.disconnect();
    };
  }, [dispatch]);
}
