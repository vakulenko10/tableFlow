// lib/socket.js
import { io } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";

const socket = io(SOCKET_URL, {
  transports: ["websocket"], // optional, enforces WS-only
  reconnectionAttempts: 5,
});

export default socket;
