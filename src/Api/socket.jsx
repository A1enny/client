// src/Api/socket.jsx
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "wss://mawmong.shop";

const socket = io(SOCKET_URL, {
  transports: ["websocket"], // ใช้ WebSocket
  secure: true,
});

export default socket; // การส่งออกเป็น default
