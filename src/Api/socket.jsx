import { io } from "socket.io-client";

const socket = io("wss://119.59.101.86:8000/Api_backend_maw/api/v1/", {
  transports: ["websocket"], // ✅ บังคับใช้ WebSocket
  secure: true, // ✅ บังคับใช้ SSL
});

socket.on("connect", () => {
  console.log("🔌 Connected to Socket.io Server");
});

export default socket;
