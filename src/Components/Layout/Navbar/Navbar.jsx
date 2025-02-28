import "./Navbar.scss";
import { MdNotifications, MdArrowDropDown } from "react-icons/md";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

const API_URL = import.meta.env.VITE_API_URL;

const Navbar = () => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [username, setUsername] = useState(localStorage.getItem("username") || "Guest");
  const [role, setRole] = useState(localStorage.getItem("role") || "");
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/notifications`);
        setNotifications(res.data);
      } catch (error) {
        Swal.fire("❌ ข้อผิดพลาด", "ไม่สามารถโหลดการแจ้งเตือนได้", "error");
      }
    };

    fetchNotifications();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setUsername("Guest");
    setRole("");
    navigate("/");
  };

  return (
    <div className="navbar-container">
      <div className="right-section">
        {/* 📌 Notification Icon */}
        <div className="notification-container" onClick={() => setIsNotificationOpen(!isNotificationOpen)}>
          <MdNotifications size={24} className="icon" />
          {notifications.length > 0 && (
            <span className="notification-badge">{notifications.length}</span>
          )}
          {isNotificationOpen && (
            <div className="notification-dropdown">
              <h4>การแจ้งเตือน</h4>
              {notifications.length > 0 ? (
                <ul>
                  {notifications.map((note, index) => (
                    <li key={index} className={`notification-item ${note.type}`}>
                      {note.message}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>ไม่มีการแจ้งเตือน</p>
              )}
            </div>
          )}
        </div>

        {/* 📌 User Dropdown */}
        <div className="user-dropdown" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
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
