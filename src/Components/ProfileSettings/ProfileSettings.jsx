import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../Api/axios";
import Swal from "sweetalert2";
import Navbar from "../Layout/Navbar/Navbar";
import Sidebar from "../Layout/Sidebar/Sidebar";
import "./ProfileSettings.scss";

const ProfileSettings = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("My details");
  const [editMode, setEditMode] = useState(false);
  const [userId, setUserId] = useState(null);
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    address: "",
    profileImage: "",
    role: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // ✅ ดึงข้อมูลผู้ใช้จาก LocalStorage
  useEffect(() => {
    const storedUserId = parseInt(localStorage.getItem("user_id"), 10);
    console.log("🔹 User ID:", storedUserId);

    if (!storedUserId || isNaN(storedUserId)) {
      Swal.fire("⚠️ ข้อมูลผู้ใช้ไม่ถูกต้อง", "", "error").then(() =>
        navigate("/login")
      );
      return;
    }

    setUserId(storedUserId);
    fetchProfile(storedUserId);
    fetchUsers();
  }, [navigate]);

  // ✅ ฟังก์ชันดึงข้อมูลโปรไฟล์
  const fetchProfile = async (id) => {
    if (!id) return;
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`/api/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("📌 ข้อมูลโปรไฟล์ที่ได้จาก API:", res.data);

      setFormData({
        fullName: res.data.username || "",
        phone: res.data.phone_number || "",
        address: res.data.address || "",
        profileImage: res.data.profile_image || "",
        role: res.data.role || "",
      });

      localStorage.setItem("profileImage", res.data.profile_image || "");
      localStorage.setItem("role", res.data.role || "");
    } catch (error) {
      console.error("❌ ไม่สามารถโหลดข้อมูลโปรไฟล์:", error);
      handleAuthError(error);
    }
  };

  // ✅ ฟังก์ชันดึงข้อมูล Users ทั้งหมด
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/api/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("📌 ดึงข้อมูล users สำเร็จ:", res.data);
      setUsers(res.data);
    } catch (error) {
      console.error("❌ ไม่สามารถดึงข้อมูล users ได้:", error);
      handleAuthError(error);
    }
  };

  // ✅ ฟังก์ชันจัดการข้อผิดพลาดเกี่ยวกับ Authentication
  const handleAuthError = (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      Swal.fire("❌ เซสชันหมดอายุ", "โปรดเข้าสู่ระบบใหม่", "error").then(() => {
        localStorage.clear();
        navigate("/login");
      });
    } else {
      Swal.fire("❌ เกิดข้อผิดพลาด", "กรุณาลองใหม่อีกครั้ง", "error");
    }
  };

  // ✅ ฟังก์ชันจัดการการเปลี่ยนข้อมูลในฟอร์ม
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ ฟังก์ชันบันทึกข้อมูลโปรไฟล์
  const handleSaveDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`/api/users/${userId}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Swal.fire("✅ บันทึกข้อมูลสำเร็จ!", "", "success");
      setEditMode(false);
    } catch (error) {
      Swal.fire("❌ เกิดข้อผิดพลาด", "ไม่สามารถบันทึกข้อมูลได้", "error");
    }
  };

  // ✅ ฟังก์ชันเปลี่ยนรหัสผ่าน
  const handlePasswordChange = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      Swal.fire("❌ กรุณากรอกรหัสผ่านให้ครบถ้วน!", "", "error");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      Swal.fire("⚠️ รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร!", "", "warning");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      Swal.fire("❌ รหัสผ่านใหม่ไม่ตรงกัน!", "", "error");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `/api/users/password/${userId}`,
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      Swal.fire("✅ เปลี่ยนรหัสผ่านเรียบร้อย!", "", "success");
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      console.error("❌ เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน:", error);
      handleAuthError(error);
    }
  };

  return (
    <div className="profile-container">
      <Navbar />
      <Sidebar />
      <div className="profile-content">
        <div className="profile-header">
          <div className="profile-info">
            <h1>ตั้งค่าโปรไฟล์</h1>
          </div>
        </div>

        <div className="nav-tabs">
          <button
            className={activeTab === "My details" ? "active" : ""}
            onClick={() => setActiveTab("My details")}
          >
            My Details
          </button>
          <button
            className={activeTab === "Password" ? "active" : ""}
            onClick={() => setActiveTab("Password")}
          >
            Change Password
          </button>
        </div>

        {activeTab === "My details" && (
          <div className="details-content">
            <h2>My Details</h2>
            <form>
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  disabled={!editMode}
                />
              </div>

              <div className="buttons">
                {editMode ? (
                  <>
                    <button
                      type="button"
                      className="save-button"
                      onClick={handleSaveDetails}
                    >
                      Save Changes
                    </button>
                    <button
                      type="button"
                      className="cancel-button"
                      onClick={() => setEditMode(false)}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    className="edit-button"
                    onClick={() => setEditMode(true)}
                  >
                    Edit Details
                  </button>
                )}
              </div>
            </form>
          </div>
        )}
        {activeTab === "Password" && (
          <div className="details-content">
            <h2>Change Password</h2>
            <form>
              <div className="form-group">
                <label>Current Password</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      currentPassword: e.target.value,
                    })
                  }
                />
              </div>

              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      newPassword: e.target.value,
                    })
                  }
                />
              </div>

              <div className="form-group">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      confirmPassword: e.target.value,
                    })
                  }
                />
              </div>

              <button
                type="button"
                className="save-button"
                onClick={handlePasswordChange}
              >
                Change Password
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileSettings;
