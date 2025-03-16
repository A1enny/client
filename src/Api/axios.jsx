const API_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_URL_BACKUP;

console.log("✅ API URL:", API_URL);

const axiosConfig = {
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
};

// ถ้ารันบนเซิร์ฟเวอร์ ให้ปิด SSL Reject (เฉพาะ Dev Mode)
if (typeof window === "undefined") {
  const https = require("https");
  axiosConfig.httpsAgent = new https.Agent({
    rejectUnauthorized: false,
  });
}

const axiosInstance = axios.create(axiosConfig);

// ทดสอบ API ใหม่
const testApiConnection = async () => {
  try {
    const response = await axiosInstance.get("/api/test");
    console.log("✅ API Response:", response.data);
  } catch (error) {
    console.error("❌ API Error:", error);

    // เปลี่ยนไปใช้ API URL Backup ถ้า API หลักใช้ไม่ได้
    if (API_URL === import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL_BACKUP) {
      console.warn("🔄 Switching to backup API...");
      axiosInstance.defaults.baseURL = import.meta.env.VITE_API_URL_BACKUP;
      testApiConnection();
    }
  }
};

// ทดสอบ API
testApiConnection();

export default axiosInstance;
