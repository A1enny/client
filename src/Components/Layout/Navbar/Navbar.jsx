import "./Navbar.scss";
import { MdNotifications, MdArrowDropDown } from "react-icons/md";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [username, setUsername] = useState(
    localStorage.getItem("username") || "Guest"
  );
  const [role, setRole] = useState(localStorage.getItem("role") || "");

  const handleLogout = () => {
    localStorage.clear();
    setUsername("Guest");
    setRole("");
    navigate("/");
  };

  return (
    <div className="navbar-container">
      <div className="right-section">
        <MdNotifications size={24} className="icon" />
        <div
          className="user-dropdown"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          <span className="user-name">{username}</span>
          <MdArrowDropDown size={24} className="icon" />
          {isDropdownOpen && (
            <div className="dropdown-menu">
              <a href="/ProfileSettings">ตั้งค่าโปรไฟล์</a>
              {role === "admin" && <a href="/ManageUsers">จัดการบัญชีผู้ใช้</a>}
              <a href="/" onClick={handleLogout}>
                ออกจากระบบ
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
