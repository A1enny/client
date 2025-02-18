import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../Api/axios/";
import socket from "../../Api/socket";
import Navbar from "../../Layout/Navbar/Navbar";
import Sidebar from "../../Layout/Sidebar/Sidebar";
import "./TableDetails.scss";
import Swal from "sweetalert2";

import jsPDF from "jspdf";
import "jspdf-autotable";
import QRCode from "react-qr-code";

// ✅ ฟังก์ชันสร้างใบเสร็จ
const generateReceipt = (orders, table) => {
  const doc = new jsPDF();
  doc.setFont("THSarabunNew", "bold");
  doc.setFontSize(16);
  doc.text("เเมวมองร้านอาหารญี่ปุ่น", 14, 10);
  doc.setFontSize(12);
  doc.text("เเมวมองร้านอาหารญี่ปุ่น", 14, 18);
  doc.text("TEL: 089-9550001", 14, 24);

  doc.setFontSize(14);
  doc.text(`โต๊ะ: ${table.table_number}`, 14, 35);
  doc.setFontSize(12);
  doc.text(`จำนวนที่นั่ง: ${table.seats}`, 14, 42);
  doc.text(`สถานะ: ${table.status}`, 14, 48);

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
  const { table_id } = useParams();
  const navigate = useNavigate();
  const [table, setTable] = useState(null);
  const [orders, setOrders] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [isPaid, setIsPaid] = useState(false);
  const promptPayNumber = "0657317994";

  // ✅ แก้ไขโดยใช้ useCallback เพื่อป้องกันฟังก์ชันถูกสร้างใหม่บ่อยๆ
  const fetchTableDetails = useCallback(async () => {
    try {
      const response = await axios.get(`http://localhost:3002/api/tables/${table_id}`);
      setTable(response.data);
    } catch (error) {
      console.error("❌ ดึงข้อมูลโต๊ะผิดพลาด:", error);
    }
  }, [table_id]);

  useEffect(() => {
    fetchTableDetails();
  }, [fetchTableDetails]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get(`http://localhost:3002/api/orders?table_id=${table_id}`);
        if (Array.isArray(response.data)) {
          setOrders(response.data);
        } else {
          console.error("❌ ค่าที่ได้จาก API ไม่ใช่ array:", response.data);
        }
      } catch (error) {
        console.error("❌ ดึงข้อมูลออร์เดอร์ผิดพลาด:", error);
      }
    };

    fetchOrders();

    socket.on("new_order", (newOrder) => {
      if (newOrder.table_id === parseInt(table_id)) {
        setOrders((prevOrders) => [...prevOrders, newOrder]);
      }
    });

    return () => {
      socket.off("new_order");
    };
  }, [table_id]);

  const fetchInventory = async () => {
    try {
      const response = await axios.get("http://localhost:3002/api/inventory");
      console.log("🎯 คลังวัตถุดิบล่าสุด:", response.data);
    } catch (error) {
      console.error("❌ ดึงข้อมูลคลังวัตถุดิบผิดพลาด:", error);
    }
  };

  // ✅ ฟังก์ชันนี้สามารถเรียก fetchTableDetails() ได้แล้ว
  const handlePaymentConfirm = async () => {
    try {
      await axios.put("http://localhost:3002/api/orders/confirm-payment", {
        table_id,
      });

      Swal.fire("✅ ชำระเงินสำเร็จ!", "บันทึกยอดขายแล้ว", "success");
      fetchTableDetails();  // ✅ เรียกใช้งานได้แน่นอนแล้ว
      fetchInventory();
      setOrders([]);
      setTotalPrice(0);
      setIsPaid(false);
    } catch (error) {
      console.error("❌ อัปเดตสถานะผิดพลาด:", error);
      Swal.fire("❌ ไม่สามารถบันทึกยอดขายได้", "กรุณาลองใหม่", "error");
    }
  };

  if (!table) {
    return <p>⏳ กำลังโหลดข้อมูล...</p>;
  }

  const groupedOrders = orders.reduce((acc, order) => {
    const existingOrder = acc.find((item) => item.itemName.trim() === order.itemName.trim());

    if (existingOrder) {
      existingOrder.quantity += Number(order.quantity) || 0;
      existingOrder.price += (Number(order.price) || 0) * (Number(order.quantity) || 0);
    } else {
      acc.push({
        itemName: order.itemName.trim(),
        quantity: Number(order.quantity) || 0,
        price: (Number(order.price) || 0) * (Number(order.quantity) || 0),
      });
    }
    return acc;
  }, []);

  const newTotalPrice = groupedOrders.reduce((sum, order) => sum + order.price, 0);

  return (
    <div className="TableDetails-container">
      <Navbar />
      <Sidebar />
      <div className="TableDetails-content">
        <h1>รายละเอียดโต๊ะ: {table.table_number}</h1>
        <p><strong>จำนวนที่นั่ง:</strong> {table.seats}</p>
        <p><strong>สถานะ:</strong> {table.status}</p>
        <h2>📜 รายการออร์เดอร์</h2>
        {orders.length > 0 ? (
          <table className="order-table">
            <thead>
              <tr><th>ชื่อเมนู</th><th>จำนวน</th><th>ราคา</th></tr>
            </thead>
            <tbody>
              {groupedOrders.map((order, index) => (
                <tr key={order.itemName || index}>
                  <td>{order.itemName}</td>
                  <td>{order.quantity}</td>
                  <td>{Number(order.price).toFixed(2)} บาท</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>ยังไม่มีออร์เดอร์</p>
        )}
        <h3 className="total-price">💰 ยอดรวม: {newTotalPrice.toFixed(2)} บาท</h3>

        {!isPaid && <button onClick={handlePaymentConfirm}>✅ ยืนยันการชำระเงิน</button>}
        {!isPaid && <button onClick={handlePaymentConfirm}>💵 รับเงินสด</button>}
        {isPaid && <button onClick={() => generateReceipt(groupedOrders, table)}>🖨️ พิมพ์ใบเสร็จ</button>}
        <button onClick={() => navigate(-1)}>⬅️ กลับ</button>
      </div>
    </div>
  );
};

export default TableDetails;
