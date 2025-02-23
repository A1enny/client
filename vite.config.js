import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      "/api": {
        target: "http://119.59.101.35:5000",
        changeOrigin: true,
        secure: false,
      }
    }
  },

  build: {
    outDir: "dist", // Netlify จะใช้โฟลเดอร์นี้ในการ Deploy
    assetsDir: "assets",
  },

  base: "./", // ป้องกันปัญหาไฟล์ถูกเรียกผิดพาธ
});
