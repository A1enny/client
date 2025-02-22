import Swal from "sweetalert2";
import { useState, useEffect } from "react";
import axios from "../../Api/axios";
import Navbar from "../Layout/Navbar/Navbar";
import Sidebar from "../Layout/Sidebar/Sidebar";
import "./Mmu.scss";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true); // ✅ ใช้เพื่อโหลดข้อมูล

  // ✅ ดึงข้อมูล users จาก API
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://119.59.101.35:5000/users");
      console.log("📌 รายชื่อผู้ใช้ที่โหลดจาก API:", res.data);
      setUsers(res.data);
    } catch (error) {
      console.error("❌ โหลดข้อมูล users ไม่สำเร็จ:", error);
      Swal.fire("❌ โหลดข้อมูลไม่สำเร็จ", "โปรดลองอีกครั้ง", "error");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Popup Form สำหรับเพิ่มผู้ใช้
  const handleAddUser = async () => {
    const { value: formValues } = await Swal.fire({
        title: "เพิ่มผู้ใช้ใหม่",
        html: `
            <input id="swal-input-name" class="swal2-input" placeholder="ชื่อผู้ใช้">
            <input id="swal-input-email" class="swal2-input" placeholder="อีเมล">
            <input id="swal-input-password" class="swal2-input" placeholder="รหัสผ่าน">
            <select id="swal-input-role" class="swal2-input">
                <option value="Admin">Admin</option>
                <option value="Staff">Staff</option>
            </select>
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: "บันทึก",
        cancelButtonText: "ยกเลิก",
        preConfirm: () => {
            return {
                username: document.getElementById("swal-input-name").value,
                email: document.getElementById("swal-input-email").value,
                password: document.getElementById("swal-input-password").value,
                role: document.getElementById("swal-input-role").value,
            };
        },
    });

    console.log("🛠️ ส่งข้อมูลไปที่เซิร์ฟเวอร์:", formValues);

    if (!formValues.username || !formValues.email || !formValues.password || !formValues.role) {
        return Swal.fire("❌ ข้อมูลไม่ครบ", "กรุณากรอกข้อมูลให้ครบถ้วน", "error");
    }

    try {
        const response = await axios.post("http://119.59.101.35:5000/users", formValues);
        console.log("✅ เพิ่มผู้ใช้สำเร็จ:", response.data);
        Swal.fire("✅ เพิ่มผู้ใช้สำเร็จ!", "", "success");
    } catch (error) {
        console.error("❌ ไม่สามารถเพิ่มผู้ใช้ได้:", error.response ? error.response.data : error);
        Swal.fire("❌ เพิ่มผู้ใช้ไม่สำเร็จ", "โปรดลองอีกครั้ง", "error");
    }
};
 

  // ✅ Popup แจ้งเตือนก่อนลบ
  const handleDeleteUser = async (userId) => {
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
          await axios.delete(`http://119.59.101.35:5000/users/${userId}`);
          setUsers(users.filter((user) => user.id !== userId));
          Swal.fire("ลบแล้ว!", "ข้อมูลผู้ใช้ถูกลบเรียบร้อย", "success");
        } catch (error) {
          console.error("❌ ไม่สามารถลบผู้ใช้ได้:", error);
          Swal.fire("❌ ลบไม่สำเร็จ", "โปรดลองอีกครั้ง", "error");
        }
      }
    });
  };
    const handleEditUser = (user) => {
    Swal.fire(`⚡ แก้ไขข้อมูลของ ${user.username}`, "ยังไม่ได้ใช้งาน", "info");
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
                <th>อีเมล</th>
                <th>บทบาท</th>
                <th>การจัดการ</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.username}</td>
                    <td>{user.email}</td>
                    <td>{user.role}</td>
                    <td>
                     <button
                        className="edit-button"
                        onClick={() => handleEditUser(user)}
                      >
                        แก้ไข
                      </button>
                      <button
                        className="delete-button"
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        ลบ
                      </button>
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
