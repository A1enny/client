import Swal from "sweetalert2";
import { useState, useEffect } from "react";
import axios from "../../Api/axios";
import Navbar from "../Layout/Navbar/Navbar";
import Sidebar from "../Layout/Sidebar/Sidebar";
import "./Mmu.scss";

const API_URL = import.meta.env.VITE_API_URL; // ✅ ใช้ค่า API_URL จาก .env

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const axiosInstance = axios.create({
    baseURL: API_URL,
    timeout: 5000,
  });
  
  // ✅ ใช้ Interceptor เพื่อเพิ่ม Authorization Header ในทุก Request
  axiosInstance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );
  
  useEffect(() => {
    fetchUsers();
  }, []);

  // ✅ ดึงข้อมูล Users
  const fetchUsers = async () => {
    const token = localStorage.getItem("token");
    console.log("🟢 Token ที่ใช้:", token);
    if (!token) {
      Swal.fire("❌ คุณไม่ได้เข้าสู่ระบบ", "โปรดเข้าสู่ระบบใหม่", "error");
      return;
    }
  
    try {
      const res = await axiosInstance.get("/api/users");
      console.log("📌 รายชื่อผู้ใช้ที่โหลดจาก API:", res.data);
      setUsers(res.data);
    } catch (error) {
      console.error("❌ โหลดข้อมูล users ไม่สำเร็จ:", error);
  
      // ✅ ตรวจสอบว่าข้อผิดพลาดเป็น 401 Unauthorized
      if (error.response?.status === 401) {
        Swal.fire("❌ เซสชันหมดอายุ", "โปรดเข้าสู่ระบบใหม่", "error").then(() => {
          localStorage.clear();
          window.location.href = "/login";
        });
      } else {
        Swal.fire("❌ โหลดข้อมูลไม่สำเร็จ", "โปรดลองอีกครั้ง", "error");
      }
    } finally {
      setLoading(false);
    }
  };
  

  // ✅ ฟอร์มเพิ่มผู้ใช้
  const handleAddUser = async () => {
    const { value: formValues } = await Swal.fire({
      title: "เพิ่มผู้ใช้ใหม่",
      html: `
            <input id="swal-input-name" class="swal2-input" placeholder="ชื่อผู้ใช้">
            <input id="swal-input-password" class="swal2-input" placeholder="รหัสผ่าน">
            <select id="swal-input-role" class="swal2-input">
                <option value="admin">Admin</option>
                <option value="staff">Staff</option>
                <option value="customer">Customer</option>
            </select>
        `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "บันทึก",
      cancelButtonText: "ยกเลิก",
      preConfirm: () => {
        return {
          username: document.getElementById("swal-input-name").value.trim(),
          password: document.getElementById("swal-input-password").value.trim(),
          role: document.getElementById("swal-input-role").value,
        };
      },
    });
  
    // ✅ ตรวจสอบว่าข้อมูลครบถ้วน
    if (!formValues.username || !formValues.password || !formValues.role) {
      return Swal.fire("❌ ข้อมูลไม่ครบ", "กรุณากรอกข้อมูลให้ครบถ้วน", "error");
    }
  
    try {
      const response = await axiosInstance.post("/api/users", formValues);
      console.log("✅ เพิ่มผู้ใช้สำเร็จ:", response.data);
      fetchUsers(); // ✅ โหลดข้อมูลใหม่
      Swal.fire("✅ เพิ่มผู้ใช้สำเร็จ!", "", "success");
    } catch (error) {
      console.error("❌ ไม่สามารถเพิ่มผู้ใช้ได้:", error);
      Swal.fire("❌ เพิ่มผู้ใช้ไม่สำเร็จ", "โปรดลองอีกครั้ง", "error");
    }
  };
  

  const handleEditUser = async (user) => {
    const { value: formValues } = await Swal.fire({
      title: `แก้ไขข้อมูลของ ${user.username}`,
      html: `
        <input id="swal-input-name" class="swal2-input" value="${user.username}" placeholder="ชื่อผู้ใช้">
        <select id="swal-input-role" class="swal2-input">
          <option value="admin" ${user.user_role === "admin" ? "selected" : ""}>Admin</option>
          <option value="staff" ${user.user_role === "staff" ? "selected" : ""}>Staff</option>
          <option value="customer" ${user.user_role === "customer" ? "selected" : ""}>Customer</option>
        </select>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "บันทึก",
      cancelButtonText: "ยกเลิก",
      preConfirm: () => {
        return {
          username: document.getElementById("swal-input-name").value,
          role: document.getElementById("swal-input-role").value,
        };
      },
    });
  
    if (!formValues || !formValues.username) {
      return Swal.fire("❌ ข้อมูลไม่ครบ", "กรุณากรอกข้อมูลให้ครบถ้วน", "error");
    }
  
    try {
      // ✅ ใช้ `axiosInstance` แทน `axios.put()`
      const response = await axiosInstance.put(`/api/users/${user.user_id}`, formValues);
      console.log("✅ อัปเดตข้อมูลสำเร็จ:", response.data);
      
      fetchUsers(); // โหลดข้อมูลใหม่
      Swal.fire("✅ แก้ไขข้อมูลสำเร็จ!", "", "success");
    } catch (error) {
      console.error("❌ ไม่สามารถแก้ไขข้อมูลได้:", error);
  
      // ✅ เช็คว่าข้อผิดพลาดเกิดจาก Token หมดอายุหรือไม่
      if (error.response?.status === 401) {
        Swal.fire("❌ เซสชันหมดอายุ", "โปรดเข้าสู่ระบบใหม่", "error").then(() => {
          localStorage.clear();
          window.location.href = "/login";
        });
      } else {
        Swal.fire("❌ แก้ไขข้อมูลไม่สำเร็จ", "โปรดลองอีกครั้ง", "error");
      }
    }
  };
  

  // ✅ ฟังก์ชันลบผู้ใช้
  const handleDeleteUser = async (userId) => {
    if (!userId) {
      console.error("❌ userId ไม่ถูกต้อง:", userId);
      Swal.fire("❌ ลบไม่สำเร็จ", "เกิดข้อผิดพลาดในการตั้งค่า userId", "error");
      return;
    }

    Swal.fire({
      title: "คุณแน่ใจหรือไม่?",
      text: "คุณจะไม่สามารถกู้คืนข้อมูลนี้ได้!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "ใช่, ลบเลย!",
      cancelButtonText: "ยกเลิก",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axiosInstance.delete(`/api/users/${userId}`);
          setUsers(users.filter((user) => user.user_id !== userId));
          Swal.fire("ลบแล้ว!", "ข้อมูลผู้ใช้ถูกลบเรียบร้อย", "success");
        } catch (error) {
          console.error("❌ ไม่สามารถลบผู้ใช้ได้:", error);
          Swal.fire("❌ ลบไม่สำเร็จ", "โปรดลองอีกครั้ง", "error");
        }
      }
    });
  };

  return (
    <div className="mmu-container">
      <Navbar />
      <Sidebar />
      <div className="mmu-content">
        <div className="mmuheader">
          <h1>จัดการบัญชีผู้ใช้</h1>
          <button className="add-user-button" onClick={handleAddUser}>
            เพิ่มผู้ใช้
          </button>
        </div>
        {loading ? (
          <p>⏳ กำลังโหลดข้อมูล...</p>
        ) : (
          <table className="users-table">
            <thead>
              <tr>
                <th>ชื่อ</th>
                <th>บทบาท</th>
                <th>การจัดการ</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users.map((user) => (
                  <tr key={user.user_id}>
                    <td>{user.username}</td>
                    <td>{user.user_role}</td>
                    <td>
                      <button
                        className="edit-button"
                        onClick={() => handleEditUser(user)}
                      >
                        แก้ไข
                      </button>
                      <button className="delete-button" onClick={() => handleDeleteUser(user.user_id)}>ลบ</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4">ไม่มีข้อมูลผู้ใช้</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ManageUsers;
