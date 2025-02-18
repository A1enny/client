import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../Api/axios";
import Swal from "sweetalert2";
import Navbar from "../../Layout/Navbar/Navbar";
import Sidebar from "../../Layout/Sidebar/Sidebar";
import "./ProfileSettings.scss";

const ProfileSettings = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("My details");
  const [editMode, setEditMode] = useState(false);
  const [userId, setUserId] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    profileImage: "/default-profile.png",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // ✅ ดึงข้อมูลผู้ใช้เมื่อหน้าโหลด
  useEffect(() => {
    const storedUserId = localStorage.getItem("user_id");
    if (!storedUserId) {
      Swal.fire("⚠️ กรุณาเข้าสู่ระบบ", "", "warning").then(() => navigate("/"));
      return;
    }
    setUserId(storedUserId);
    fetchProfile(storedUserId);
  }, [navigate]);

  // ✅ ดึงข้อมูลผู้ใช้จาก API
  const fetchProfile = async (id) => {
    try {
      const res = await axiosInstance.get(`/users/profile/${id}`);
      console.log("📌 ข้อมูลโปรไฟล์ที่ได้จาก API:", res.data);

      setFormData({
        fullName: res.data.username || "",
        email: res.data.email || "",
        phone: res.data.phone_number || "",
        address: res.data.address || "",
        profileImage: res.data.profile_image || "/default-profile.png",
      });
    } catch (error) {
      console.error("❌ ไม่สามารถโหลดข้อมูลโปรไฟล์:", error);
      Swal.fire("❌ โหลดข้อมูลไม่สำเร็จ", "", "error");
    }
  };

  // ✅ อัปเดตข้อมูลผู้ใช้
  const handleSaveDetails = async () => {
    try {
      await axiosInstance.put(`/users/profile/${userId}`, formData);
      Swal.fire("✅ บันทึกข้อมูลสำเร็จ!", "", "success");
      setEditMode(false);
    } catch (error) {
      console.error("❌ ไม่สามารถบันทึกข้อมูล:", error);
      Swal.fire("❌ ไม่สามารถบันทึกข้อมูลได้", "", "error");
    }
  };

  // ✅ เปลี่ยนรหัสผ่าน
  const handleChangePassword = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      return Swal.fire("❌ กรุณากรอกรหัสผ่านให้ครบถ้วน!", "", "error");
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return Swal.fire("❌ รหัสผ่านใหม่ไม่ตรงกัน!", "", "error");
    }
    try {
      await axiosInstance.put(`/users/password/${userId}`, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      Swal.fire("✅ เปลี่ยนรหัสผ่านเรียบร้อย!", "", "success");
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      console.error("❌ เปลี่ยนรหัสผ่านไม่สำเร็จ:", error);
      Swal.fire("❌ เปลี่ยนรหัสผ่านไม่สำเร็จ", "", "error");
    }
  };

  // ✅ อัปโหลดรูปโปรไฟล์
  const handleUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const uploadData = new FormData();
    uploadData.append("profileImage", file);

    console.log("📌 กำลังอัปโหลดไฟล์:", file.name);

    try {
      const res = await axiosInstance.post(`/users/upload-profile/${userId}`, uploadData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("✅ รูปโปรไฟล์ที่อัปโหลด:", res.data);
      setFormData((prev) => ({ ...prev, profileImage: res.data.profileImageUrl }));
      Swal.fire("✅ อัปโหลดรูปสำเร็จ!", "", "success");
    } catch (error) {
      console.error("❌ อัปโหลดรูปไม่สำเร็จ:", error);
      Swal.fire("❌ อัปโหลดรูปไม่สำเร็จ!", "", "error");
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
            src={formData.profileImage}
            alt="Profile"
            style={{ width: "100px", height: "100px", borderRadius: "50%" }}
          />
          <div className="profile-info">
            <h1>ตั้งค่าโปรไฟล์</h1>
            <p>{formData.email}</p>
          </div>
        </div>
        <div className="nav-tabs">
          {["My details", "Password"].map((tab) => (
            <button key={tab} className={activeTab === tab ? "active-tab" : ""} onClick={() => setActiveTab(tab)}>
              {tab}
            </button>
          ))}
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
                <input type="text" value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} disabled={!editMode} />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={formData.email} disabled />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input type="text" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} disabled={!editMode} />
              </div>
              <div className="form-group">
                <label>Address</label>
                <input type="text" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} disabled={!editMode} />
              </div>
              <div className="buttons">
                {editMode ? <button type="button" className="save-button" onClick={handleSaveDetails}>Save Changes</button> : <button type="button" className="edit-button" onClick={() => setEditMode(true)}>Edit Details</button>}
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileSettings;
