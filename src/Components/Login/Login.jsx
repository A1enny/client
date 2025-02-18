import "./Login.scss";
import "../../App.scss";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../Api/axios";
import Logo from "../../assets/Logo.png";
import { FaUserShield, FaKey } from "react-icons/fa";
import { AiOutlineSwapRight } from "react-icons/ai";

const Login = () => {
  const [loginUserName, setLoginUserName] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const loginUser = async (event) => {
    event.preventDefault();
  
    if (!loginUserName || !loginPassword) {
      alert("❌ กรุณากรอกชื่อผู้ใช้และรหัสผ่าน");
      return;
    }
  
    try {
      setIsLoading(true);
      const response = await axios.post("http://localhost:3002/api/users/login", {
        username: loginUserName,
        password: loginPassword,
      });
      
      if (response.status === 200 && response.data.user) {
        // ✅ บันทึก role ลง Local Storage อย่างถูกต้อง
        localStorage.setItem("user_id", response.data.user.id);
        localStorage.setItem("username", response.data.user.username);
        localStorage.setItem("role", response.data.user.role); // ✅ แก้ตรงนี้
  
        sessionStorage.setItem("isLoggedIn", "true");
  
        alert("✅ เข้าสู่ระบบสำเร็จ!");
        navigate("/dashboard"); 
      } else {
        alert("❌ ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
      }
    } catch (error) {
      console.error("Login error:", error);
      if (error.response) {
        if (error.response.status === 401) {
          alert("❌ ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
        } else if (error.response.status === 404) {
          alert("⚠️ ไม่พบ API โปรดตรวจสอบ URL");
        } else {
          alert("🚨 เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
        }
      } else {
        alert("⚠️ ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์");
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="loginPage flex">
      <div className="logoContainer">
        <img src={Logo} alt="Logo Image" />
      </div>
      <div className="lang">
        <span>TH | EN</span>
      </div>
      <div className="contanier flex">
        <div className="textDiv">
          <h1 className="title">เข้าสู่ระบบ</h1>
          <h2 className="title">ระบบจัดการร้านอาหาร</h2>
          <p className="p">เเมวมองร้านอาหารญี่ปุ่น</p>
          <form className="form grid" onSubmit={loginUser}>
            <div className="inputDiv">
              <label htmlFor="username">ชื่อผู้ใช้</label>
              <div className="input flex">
                <FaUserShield className="icon" />
                <input
                  type="text"
                  id="username"
                  placeholder="กรอกชื่อผู้ใช้"
                  value={loginUserName}
                  onChange={(event) => setLoginUserName(event.target.value)}
                />
              </div>
            </div>
            <div className="inputDiv">
              <label htmlFor="Password">รหัสผ่าน</label>
              <div className="input flex">
                <FaKey className="icon" />
                <input
                  type="password"
                  id="Password"
                  placeholder="กรอกรหัสผ่าน"
                  value={loginPassword}
                  onChange={(event) => setLoginPassword(event.target.value)}
                />
              </div>
            </div>
            <button type="submit" className="btn flex" disabled={isLoading}>
              {isLoading ? (
                <span>🔄 กำลังเข้าสู่ระบบ...</span>
              ) : (
                <>
                  <span>เข้าสู่ระบบ</span>
                  <AiOutlineSwapRight className="icon" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
