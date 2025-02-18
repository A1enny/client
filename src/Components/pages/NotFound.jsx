import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div style={{ textAlign: "center", padding: "50px" }}>
      <h1>❌ 404 - Page Not Found</h1>
      <p>ขออภัย! หน้าเว็บที่คุณพยายามเข้าถึงไม่มีอยู่</p>
      <Link to="/dashboard">🔙 กลับไปหน้า Dashboard</Link>
    </div>
  );
};

export default NotFound;
