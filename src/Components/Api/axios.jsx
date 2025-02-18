import axios from "axios";

const API = axios.create({
  baseURL: "http://192.168.1.44:3002/api", // ✅ ต้องใช้ IP แทน localhost
  headers: {
    "Content-Type": "application/json",
  },
});

export default API;
