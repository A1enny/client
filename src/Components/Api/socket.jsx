import { io } from "socket.io-client";

const SOCKET_URL = "http://192.168.1.44:3002"; // ✅ กำหนด URL ของ Backend

const socket = io(SOCKET_URL, {
    transports: ["websocket"], // ✅ บังคับใช้ WebSocket
    reconnection: true, // ✅ เปิดใช้งานการเชื่อมต่อใหม่อัตโนมัติ
    reconnectionAttempts: 5, // ✅ จำนวนครั้งที่พยายามเชื่อมต่อใหม่
    reconnectionDelay: 3000, // ✅ หน่วงเวลาก่อนเชื่อมใหม่ (3 วินาที)
});

socket.on("connect", () => {
    console.log("✅ Connected to WebSocket:", socket.id);
});

socket.on("connect_error", (err) => {
    console.error("❌ WebSocket connection error:", err);
});

export default socket;