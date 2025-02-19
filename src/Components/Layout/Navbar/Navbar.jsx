import "./Navbar.scss";
import { MdNotifications, MdArrowDropDown } from "react-icons/md";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../../Api/axios";


const Navbar = () => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [username, setUsername] = useState("Guest");
  const [profileImage, setProfileImage] = useState("");
  const [role, setRole] = useState(""); 

  useEffect(() => {
    const storedUserId = localStorage.getItem("user_id");
    const storedUsername = localStorage.getItem("username");
    const storedProfileImage = localStorage.getItem("profileImage");
    const storedRole = localStorage.getItem("role"); 

    if (storedUsername) setUsername(storedUsername);
    if (storedProfileImage) setProfileImage(storedProfileImage);
    if (storedRole) setRole(storedRole); 

    if (storedUserId) {
      fetchUserProfile(storedUserId);
    }
  }, []);

  // ✅ ใช้ useEffect ติดตามการเปลี่ยนแปลงของ profileImage และ LocalStorage
  useEffect(() => {
    const handleStorageChange = () => {
      const updatedProfileImage = localStorage.getItem("profileImage");
      if (updatedProfileImage) {
        setProfileImage(updatedProfileImage);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // ✅ เมื่อ profileImage อัปเดต ให้ใช้ useEffect เพื่ออัปเดต Navbar ทันที
  useEffect(() => {
    const storedProfileImage = localStorage.getItem("profileImage");
    if (storedProfileImage) {
      setProfileImage(storedProfileImage);
    }
  }, [profileImage]);

  const fetchUserProfile = async (userId) => {
    try {
      const res = await axios.get(
        `http://localhost:3002/api/users/profile/${userId}`
      );
      setUsername(res.data.username);
      setProfileImage(res.data.profile_image);
      setRole(res.data.role);

      // 📌 อัปเดต Local Storage ทันที
      localStorage.setItem("username", res.data.username);
      localStorage.setItem("profileImage", res.data.profile_image);
      localStorage.setItem("role", res.data.role);
    } catch (error) {
      console.error("❌ โหลดข้อมูลผู้ใช้ไม่สำเร็จ:", error);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    setUsername("Guest");
    setProfileImage("");
    setRole("");
    navigate("/");
  };

  // ✅ ตรวจสอบ URL ของรูปโปรไฟล์ก่อนแสดง
  const formattedProfileImage = profileImage?.startsWith("http")
    ? profileImage
    : `http://localhost:3002${profileImage}`;

  return (
    <div className="navbar-container">
      <div className="right-section">
        <MdNotifications size={24} className="icon" />
        <div className="user-dropdown" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
          <img
            src={formattedProfileImage ? formattedProfileImage : "/default-avatar.png"}
            alt="Profile"
            className="profile-pic"
          />
          <span className="user-name">{username}</span>
          <MdArrowDropDown size={24} className="icon" />
          {isDropdownOpen && (
            <div className="dropdown-menu">
              <a href="/ProfileSettings">ตั้งค่าโปรไฟล์</a>
              {role === "admin" && <a href="/ManageUsers">จัดการบัญชีผู้ใช้</a>}
              <a href="/" onClick={handleLogout}>ออกจากระบบ</a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
