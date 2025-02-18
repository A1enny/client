import axios from "axios";

const instance = axios.create({
  baseURL: "http://119.59.101.86:8000/Api_backend_maw/api/v1", // ✅ ใช้ HTTPS ของ Vercel
  headers: { "Content-Type": "application/json" },
});
export default instance;
