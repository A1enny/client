import axios from "axios";

// กำหนด baseURL โดยตรง แทนการใช้ .env
const API = axios.create({
  baseURL: "http://119.59.101.35:5000/api",  // 🔥 ใช้ URL โดยตรง
  headers: {
    "Content-Type": "application/json",
  },
});

export default API;
