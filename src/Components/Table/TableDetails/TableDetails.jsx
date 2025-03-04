import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../../Api/axios";
import socket from "../../../Api/socket";
import Navbar from "../../Layout/Navbar/Navbar";
import Sidebar from "../../Layout/Sidebar/Sidebar";
import "./TableDetails.scss";
import Swal from "sweetalert2";

import jsPDF from "jspdf";
import "jspdf-autotable";
import QRCode from "react-qr-code";

const API_URL = import.meta.env.VITE_API_URL;

// ✅ ฟังก์ชันสร้างใบเสร็จ
const generateReceipt = (orders, table) => {
  const doc = new jsPDF();
  doc.setFont("THSarabunNew", "bold");
  doc.setFontSize(16);
  doc.text("🛑 ร้านอาหารญี่ปุ่น", 14, 10);
  doc.setFontSize(12);
  doc.text("📞 TEL: 089-9550001", 14, 18);

  doc.setFontSize(14);
  doc.text(`โต๊ะ: ${table.table_number}`, 14, 30);
  doc.text(`จำนวนที่นั่ง: ${table.seats}`, 14, 38);
  doc.text(`สถานะ: ${table.status}`, 14, 46);

  const tableColumn = ["ชื่อเมนู", "จำนวน", "ราคา"];
  const tableRows = [];

  let totalAmount = 0;
  orders.forEach((order) => {
    const rowData = [order.itemName, order.quantity, `${Number(order.price).toFixed(2)} บาท`];
    totalAmount += order.price;
    tableRows.push(rowData);
  });

  doc.autoTable({ head: [tableColumn], body: tableRows, startY: 55 });

  doc.text(`รวมเป็นเงิน: ${totalAmount.toFixed(2)} บาท`, 14, doc.lastAutoTable.finalY + 10);
  doc.text(`ยอดชำระสุทธิ: ${totalAmount.toFixed(2)} บาท`, 14, doc.lastAutoTable.finalY + 20);

  const currentDate = new Date().toLocaleString();
  doc.text(currentDate, 14, doc.lastAutoTable.finalY + 30);

  doc.save(`Receipt_Table_${table.table_number}.pdf`);
};

const TableDetails = () => {
  const { table_id } = useParams();const { table_id } = useParams();
  console.log("📌 ค่า table_id ที่ได้รับจาก useParams():", table_id);
  const navigate = useNavigate();
  const [table, setTable] = useState(null);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaid, setIsPaid] = useState(false);
  const promptPayNumber = "0657317994";

  // ✅ ดึงข้อมูลโต๊ะ
  const fetchTableDetails = useCallback(async () => {
    setIsLoading(true);
    try {
      console.log(`🔍 กำลังดึงข้อมูลโต๊ะ ID: ${table_id}`); // Debugging
      const response = await axios.get(`${API_URL}/api/tables/${table_id}`);
  
      if (response.data) {
        console.log("✅ ข้อมูลโต๊ะที่ได้รับ:", response.data);
        setTable(response.data);
      } else {
        throw new Error("ไม่มีข้อมูลโต๊ะ");
      }
    } catch (error) {
      console.error("❌ ดึงข้อมูลโต๊ะผิดพลาด:", error);
      Swal.fire("❌ ไม่พบโต๊ะ", "กรุณาตรวจสอบหมายเลขโต๊ะ", "error");
    } finally {
      setIsLoading(false);
    }
  }, [table_id]);  

  // ✅ ดึงออร์เดอร์
  const fetchOrders = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/api/orders?table_id=${table_id}`);
      setOrders(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("❌ ดึงข้อมูลออร์เดอร์ผิดพลาด:", error);
      Swal.fire("❌ ไม่สามารถโหลดออร์เดอร์ได้", "กรุณาลองใหม่", "error");
    }
  }, [table_id]);

  useEffect(() => {
    fetchTableDetails();
    fetchOrders();

    socket.on("new_order", (newOrder) => {
      if (newOrder.table_id === parseInt(table_id)) {
        setOrders((prevOrders) => [...prevOrders, newOrder]);
      }
    });

    return () => {
      socket.off("new_order");
    };
  }, [table_id, fetchTableDetails, fetchOrders]);

  const handlePaymentConfirm = async () => {
    try {
      await axios.put(`${API_URL}/api/orders/confirm-payment`, { table_id });
      Swal.fire("✅ ชำระเงินสำเร็จ!", "บันทึกยอดขายแล้ว", "success");
      fetchTableDetails();
      setOrders([]);
      setIsPaid(true);
    } catch (error) {
      console.error("❌ อัปเดตสถานะผิดพลาด:", error);
      Swal.fire("❌ ไม่สามารถบันทึกยอดขายได้", "กรุณาลองใหม่", "error");
    }
  };

  if (isLoading) return <p>⏳ กำลังโหลดข้อมูล...</p>;
  if (!table) return <p>❌ ไม่พบข้อมูลโต๊ะ</p>;

  return (
    <div className="TableDetails-container">
      <Navbar />
      <Sidebar />
      <div className="TableDetails-content">
        <h1>📌 รายละเอียดโต๊ะ: {table.table_number}</h1>
        <p><strong>🪑 จำนวนที่นั่ง:</strong> {table.seats}</p>
        <p><strong>🔄 สถานะ:</strong> <span className={`status ${table.status}`}>{table.status}</span></p>

        <h2>📜 รายการออร์เดอร์</h2>
        {orders.length > 0 ? (
          <table className="order-table">
            <thead>
              <tr><th>ชื่อเมนู</th><th>จำนวน</th><th>ราคา</th></tr>
            </thead>
            <tbody>
              {orders.map((order, index) => (
                <tr key={index}>
                  <td>{order.itemName}</td>
                  <td>{order.quantity}</td>
                  <td>{Number(order.price).toFixed(2)} บาท</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>❌ ไม่มีออร์เดอร์</p>
        )}

        <h3 className="total-price">💰 ยอดรวม: {orders.reduce((sum, order) => sum + order.price, 0).toFixed(2)} บาท</h3>

        {/* ✅ แสดงปุ่มเฉพาะเมื่อมีออร์เดอร์ */}
        {orders.length > 0 && !isPaid && (
          <>
            <button onClick={handlePaymentConfirm}>✅ ยืนยันการชำระเงิน</button>
            <button onClick={() => generateReceipt(orders, table)}>🖨️ พิมพ์ใบเสร็จ</button>
          </>
        )}

        {/* ✅ ปุ่มโหลดข้อมูลใหม่ */}
        <button onClick={fetchOrders}>🔄 โหลดข้อมูลใหม่</button>

        <button onClick={() => navigate(-1)}>⬅️ กลับ</button>
      </div>
    </div>
  );
};

export default TableDetails;
