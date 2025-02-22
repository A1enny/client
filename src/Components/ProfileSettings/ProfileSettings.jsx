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
    email: "",
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

  const imageUrl = formData.profileImage?.startsWith("http")
    ? formData.profileImage
    : formData.profileImage
    ? `http://localhost:3002${formData.profileImage}`
    : "http://localhost:3002/uploads/default.png";

  useEffect(() => {
    const storedUserId = localStorage.getItem("user_id");
    if (!storedUserId) {
      Swal.fire("⚠️ กรุณาเข้าสู่ระบบ", "", "warning").then(() => navigate("/"));
      return;
    }
    setUserId(storedUserId);
    fetchProfile(storedUserId);
    fetchUsers();
  }, [navigate]);

  const fetchProfile = async (id) => {
    if (!id) return;
    try {
      const res = await axios.get(
        `http://119.59.101.35:5000/users/profile/${id}`
      );
      console.log("📌 ข้อมูลโปรไฟล์ที่ได้จาก API:", res.data);

      setFormData({
        fullName: res.data.username || "",
        email: res.data.email || "",
        phone: res.data.phone_number || "",
        address: res.data.address || "",
        profileImage: res.data.profile_image || "",
        role: res.data.role || "",
      });

      localStorage.setItem("profileImage", res.data.profile_image || "");
      localStorage.setItem("role", res.data.role || "");
    } catch (error) {
      Swal.fire("❌ เกิดข้อผิดพลาด", "ไม่สามารถโหลดข้อมูลได้", "error");
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://119.59.101.35:5000/users");
      console.log("📌 ดึงข้อมูล users สำเร็จ:", res.data);
      setUsers(res.data);
    } catch (error) {
      console.error("❌ ไม่สามารถดึงข้อมูล users ได้:", error);
      Swal.fire("❌ ไม่สามารถโหลดข้อมูลผู้ใช้", "", "error");
    }
  };

  const handleUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const uploadForm = new FormData();
    uploadForm.append("profileImage", file);

    try {
      const res = await axios.post(
        `/api/users/upload-profile/${userId}`,
        uploadForm,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      const newProfileImage = res.data.profileImageUrl;
      console.log("✅ รูปโปรไฟล์ที่อัปโหลด:", newProfileImage);

      setFormData((prev) => ({ ...prev, profileImage: newProfileImage }));
      localStorage.setItem("profileImage", newProfileImage);

      Swal.fire("✅ อัปโหลดรูปสำเร็จ!", "", "success");
    } catch (error) {
      Swal.fire("❌ อัปโหลดรูปไม่สำเร็จ!", "", "error");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveDetails = async () => {
    try {
      await axios.put(`/api/users/profile/${userId}`, formData);
      Swal.fire("✅ บันทึกข้อมูลสำเร็จ!", "", "success");
      setEditMode(false);
    } catch (error) {
      Swal.fire("❌ เกิดข้อผิดพลาด", "ไม่สามารถบันทึกข้อมูลได้", "error");
    }
  };

  const handlePasswordChange = async () => {
    if (
      !passwordData.currentPassword ||
      !passwordData.newPassword ||
      !passwordData.confirmPassword
    ) {
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
      await axios.put(`/api/users/password/${userId}`, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      Swal.fire("✅ เปลี่ยนรหัสผ่านเรียบร้อย!", "", "success");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      Swal.fire("❌ เกิดข้อผิดพลาด", "ไม่สามารถเปลี่ยนรหัสผ่านได้", "error");
    }
  };

  return (
    <div className="profile-container">
      <Navbar />
      <Sidebar />
      <div className="profile-content">
        <div className="profile-header">
          <img
            className="profile-pic"
            src={imageUrl}
            alt="Profile"
            style={{ width: "100px", height: "100px", borderRadius: "50%" }}
          />
          <div className="profile-info">
            <h1>ตั้งค่าโปรไฟล์</h1>
            <p>
              {formData.email} ({formData.role})
            </p>
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
                <label>Profile Picture</label>
                <input type="file" accept="image/*" onChange={handleUpload} />
              </div>

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
