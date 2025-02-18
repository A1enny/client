import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:3002/api", // ✅ ตรวจสอบว่าถูกต้อง ไม่มี "/api/api"
  headers: { "Content-Type": "application/json" },
});

export default instance;
