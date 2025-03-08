import { useState, useEffect } from "react";
import {
  FaHome,
  FaUtensils,
  FaChair,
  FaWarehouse,
  FaBook,
  FaChartBar,
} from "react-icons/fa";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import "./Sidebar.scss";
import Logo from "../../../assets/Logo.png";

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    const role = localStorage.getItem("role");
    setUserRole(role);
  }, []);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className={`sidebar ${isCollapsed ? "collapsed" : ""}`}>
      <div className="toggle-button" onClick={toggleSidebar}>
        {isCollapsed ? <IoIosArrowForward /> : <IoIosArrowBack />}
      </div>
      <div className="sidebar-content">
        <div className="sidebar-header">
          <img
            src={Logo}
            alt="Logo"
            className={`logo ${isCollapsed ? "collapsed" : ""}`}
          />
        </div>

        <div className="sidebar-menu">
          <a href="/dashboard" className="menu-item">
            <FaHome />
            <span>หน้าหลัก</span>
          </a>

          {userRole === "staff" ? (
            <>
              <a href="/table" className="menu-item">
                <FaChair />
                <span>จัดการโต๊ะอาหาร</span>
              </a>
              <a href="/Inventory" className="menu-item">
                <FaWarehouse />
                <span>จัดการคลังวัตถุดิบ</span>
              </a>
            </>
          ) : (
            <>
              <a href="/product" className="menu-item">
                <FaUtensils />
                <span>จัดการเมนูอาหาร</span>
              </a>
              <a href="/table" className="menu-item">
                <FaChair />
                <span>จัดการโต๊ะอาหาร</span>
              </a>
              <a href="/Inventory" className="menu-item">
                <FaWarehouse />
                <span>จัดการคลังวัตถุดิบ</span>
              </a>
              <a href="/recipe" className="menu-item">
                <FaBook />
                <span>สูตรอาหาร</span>
              </a>
              <a href="/report" className="menu-item">
                <FaChartBar />
                <span>ออกรายงาน</span>
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
