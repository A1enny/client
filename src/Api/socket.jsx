import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL; // ✅ ใช้ค่าจาก .env

const socket = io(SOCKET_URL, {
    transports: ["websocket"], // ✅ บังคับใช้ WebSocket
    secure: false, // ✅ ใช้งาน WebSocket ผ่าน HTTPS
    reconnection: true, 
    reconnectionAttempts: 5, 
    reconnectionDelay: 3000, 
});

socket.on("connect", () => {
    console.log("✅ Connected to WebSocket:", socket.id);
});

socket.on("connect_error", (err) => {
    console.error("❌ WebSocket connection error:", err);
});

export default socket;
