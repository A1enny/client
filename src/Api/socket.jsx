import { io } from "socket.io-client";

const SOCKET_URL = "wss://mawmong.shop";  // ต้องเป็น URL ที่รองรับ WebSocket
const socket = io(SOCKET_URL, {
  transports: ["websocket"], // ตั้งค่าให้ใช้ WebSocket
  secure: true,
});

socket.on("connect", () => {
  console.log("✅ Connected to WebSocket", socket.id);
});

socket.on("disconnect", () => {
  console.log("❌ Disconnected from WebSocket");
});
