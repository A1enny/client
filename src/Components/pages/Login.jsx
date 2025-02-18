import "./Login.scss";
import "../../App.scss";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { db, collection, getDocs, query, where } from "../../Api/firebase";
import Logo from "../../assets/Logo.png";
import { FaUserShield, FaKey } from "react-icons/fa";
import { AiOutlineSwapRight } from "react-icons/ai";

const Login = () => {
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const loginUser = async (event) => {
    event.preventDefault();

    if (!loginEmail || !loginPassword) {
      Swal.fire("❌ ข้อมูลไม่ครบ", "กรุณากรอกอีเมลและรหัสผ่าน", "error");
      return;
    }

    try {
      setIsLoading(true);

      // 🔥 ดึงข้อมูลจาก Firestore
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", loginEmail));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        Swal.fire("❌ ล็อกอินไม่สำเร็จ", "ไม่พบอีเมลนี้ในระบบ", "error");
      } else {
        let userData = null;

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.password === loginPassword) {
            userData = { id: doc.id, ...data };
          }
        });

        if (userData) {
          console.log("✅ User Logged In:", userData);

          // ✅ เก็บข้อมูลลง LocalStorage
          localStorage.setItem("user_id", userData.id);
          localStorage.setItem("email", userData.email);
          localStorage.setItem("role", userData.role);
          localStorage.setItem("username", userData.username);
          sessionStorage.setItem("isLoggedIn", "true");

          Swal.fire("✅ เข้าสู่ระบบสำเร็จ!", "กำลังเปลี่ยนหน้า...", "success");

          // ✅ นำทางไปยัง Dashboard
          navigate("/dashboard");
        } else {
          Swal.fire("❌ ล็อกอินไม่สำเร็จ", "รหัสผ่านไม่ถูกต้อง", "error");
        }
      }
    } catch (error) {
      console.error("❌ Login error:", error);
      Swal.fire("❌ เกิดข้อผิดพลาด", "กรุณาลองใหม่อีกครั้ง", "error");
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
      <div className="container flex">
        <div className="textDiv">
          <h1 className="title">เข้าสู่ระบบ</h1>
          <h2 className="title">ระบบจัดการร้านอาหาร</h2>
          <p className="p">เเมวมองร้านอาหารญี่ปุ่น</p>
          <form className="form grid" onSubmit={loginUser}>
            <div className="inputDiv">
              <label htmlFor="email">อีเมล</label>
              <div className="input flex">
                <FaUserShield className="icon" />
                <input
                  type="email"
                  id="email"
                  placeholder="กรอกอีเมล"
                  value={loginEmail}
                  onChange={(event) => setLoginEmail(event.target.value)}
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
