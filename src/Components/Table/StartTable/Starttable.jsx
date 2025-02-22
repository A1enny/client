import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import Navbar from "../../Layout/Navbar/Navbar";
import Sidebar from "../../Layout//Sidebar/Sidebar";
import "./Starttable.scss"; // ✅ ใช้ SCSS สำหรับสไตล์

const StartTable = () => {
  const { tableId } = useParams(); // ✅ ดึง tableId จาก URL
  const navigate = useNavigate();
  const [table, setTable] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTableDetails();
  }, [tableId]);

  // ✅ ดึงข้อมูลโต๊ะจาก Backend
  const fetchTableDetails = async () => {
    try {
      const response = await axios.get(
        `http://119.59.101.35:5000/tables/${tableId}`
      );
      setTable(response.data);
      setLoading(false);
    } catch (error) {
      Swal.fire("❌ ไม่พบโต๊ะ", "กรุณาลองใหม่", "error");
      navigate("/table"); // ✅ กลับไปหน้าหลักถ้าโหลดไม่สำเร็จ
    }
  };

  // ✅ กดปุ่มเพื่อเริ่มใช้งานโต๊ะ
  const handleConfirmStart = async () => {
    try {
        const sessionId = Date.now().toString(); // ✅ สร้าง session_id ใหม่
        console.log("📌 Sending session_id:", sessionId); // ✅ ตรวจสอบค่า

        const response = await axios.put(`http://119.59.101.35:5000/tables/${tableId}`, {
            status: "occupied",
            session_id: sessionId,
        });

        if (response.status === 200) {
            Swal.fire("สำเร็จ", "โต๊ะถูกใช้งานแล้ว", "success");
        }
    } catch (error) {
        console.error("❌ Error:", error.response?.data || error.message);
        Swal.fire("❌ ไม่สามารถเริ่มใช้งานได้", "กรุณาลองใหม่", "error");
    }
};


  if (loading) return <p>⏳ กำลังโหลดข้อมูล...</p>;

  return (
    <div className="Starttable-container">
      <Navbar />
      <Sidebar />
      <div className="Starttable-content">
        <h1>📌 เริ่มใช้งานโต๊ะ</h1>
        {table ? (
          <div className="Starttable-details">
            <p>
              หมายเลขโต๊ะ: <strong>{table.table_number}</strong>
            </p>
            <p>
              จำนวนที่นั่ง: <strong>{table.seats}</strong>
            </p>
            <p>
              สถานะ:{" "}
              <span className={`status ${table.status}`}>{table.status}</span>
            </p>
            <button className="start-button" onClick={handleConfirmStart}>
              ✅ ยืนยันเริ่มใช้งาน
            </button>
          </div>
        ) : (
          <p>ไม่พบข้อมูลโต๊ะ</p>
        )}
      </div>
    </div>
  );
};

export default StartTable;
