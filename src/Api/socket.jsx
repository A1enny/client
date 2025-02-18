import { io } from "socket.io-client";

const socket = io("http://localhost:3002"); // ✅ เชื่อมต่อกับ Backend

socket.on("connect", () => {
  console.log("🔌 Connected to Socket.io Server");
});

export default socket;
