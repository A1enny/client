import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

console.log("✅ API URL:", API_URL); // ตรวจสอบค่าที่อ่านได้

// ทดสอบการเรียก API
axios.get(`${API_URL}/test`)
  .then(response => console.log("✅ API Response:", response.data))
  .catch(error => console.error("❌ API Error:", error));

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosInstance;
