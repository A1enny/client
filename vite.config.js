import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  server: {
    host: "0.0.0.0",
    port: 5173,
    proxy: {
      "/api": {
        target: "http://119.59.101.35:5000", // เปลี่ยนเป็น URL ของ API Server
        changeOrigin: true,
        secure: false,
      },
    },
  },

  build: {
    outDir: "dist", // 📌 โฟลเดอร์ผลลัพธ์หลัง build
  },

  base: "/", // 📌 ใช้ "/" สำหรับ Production, ป้องกัน path ผิดเมื่อ deploy
});
