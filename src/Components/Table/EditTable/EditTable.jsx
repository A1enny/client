import { useEffect, useState } from "react";
import axios from "../../../Api/axios";
import Swal from "sweetalert2";
import "./EditTable.scss";

const API_URL = import.meta.env.VITE_API_URL;

const EditTableModal = ({ isOpen, onClose, tableData, onUpdated }) => {
  const [tableNumber, setTableNumber] = useState("");
  const [seats, setSeats] = useState("");

  useEffect(() => {
    if (tableData) {
      setTableNumber(tableData.table_number);
      setSeats(tableData.seats);
    }
  }, [tableData]);

  const handleSubmit = async () => {
    if (!tableNumber || !seats) {
      Swal.fire("❌ ข้อมูลไม่ครบ", "กรุณากรอกข้อมูลให้ครบ", "error");
      return;
    }

    try {
      const response = await axios.put(`${API_URL}/api/tables/${tableData.table_id}`, {
        table_number: tableNumber,
        seats,
      });

      Swal.fire("✅ แก้ไขสำเร็จ", "ข้อมูลโต๊ะถูกอัปเดตแล้ว", "success");
      onUpdated(response.data);
      onClose();
    } catch (error) {
      console.error("❌ Error updating table:", error);
      Swal.fire("❌ ผิดพลาด", "ไม่สามารถแก้ไขโต๊ะได้", "error");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
        <div className="modal-content">
          <h3 className="modal-title">✏️ แก้ไขโต๊ะอาหาร</h3>
          <input
            type="text"
            placeholder="หมายเลขโต๊ะ"
            value={tableNumber}
            onChange={(e) => setTableNumber(e.target.value)}
          />
          <input
            type="number"
            placeholder="จำนวนที่นั่ง"
            value={seats}
            onChange={(e) => setSeats(e.target.value)}
          />
          <div className="modal-actions">
            <button onClick={handleSubmit}>บันทึก </button>
            <button onClick={onClose}>ยกเลิก </button>
          </div>
        </div>
      </div>
  );
};

export default EditTableModal;
