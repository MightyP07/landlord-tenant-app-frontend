// src/utils/socket.js
import { io } from "socket.io-client";

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL || "http://localhost:5000"; // change for production

// Initialize socket
const socket = io(SOCKET_URL, {
  autoConnect: false, // connect only after login
  transports: ["websocket"],
});

export default socket;
