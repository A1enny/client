import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import axios from "../../../Api/axios";
import socket from "../../../Api/socket";
import Navbar from "../../Layout/Navbar/Navbar";
import Sidebar from "../../Layout/Sidebar/Sidebar";
import "./TableDetails.scss";
import Swal from "sweetalert2";

const API_URL = import.meta.env.VITE_API_URL;

const TableDetails = () => {
  const { table_id } = useParams();
  const [table, setTable] = useState(null);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaid, setIsPaid] = useState(false);

  // ✅ ดึงข้อมูลโต๊ะ
  const fetchTableDetails = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/tables/${table_id}`);
      if (response.data) {
        setTable(response.data);
      } else {
        throw new Error("ไม่มีข้อมูลโต๊ะ");
      }
    } catch (error) {
      Swal.fire("❌ ไม่พบโต๊ะ", "กรุณาตรวจสอบหมายเลขโต๊ะ", "error");
    } finally {
      setIsLoading(false);
    }
  }, [table_id]);

  // ✅ ดึงข้อมูลออร์เดอร์
  const fetchOrders = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/api/orders/${table_id}`);
      if (response.data.success) {
        const formattedOrders = response.data.orders.map((order) => ({
          id: order.order_item_id, // ใช้ order_item_id เป็นหลัก
          itemName: order.itemName,
          quantity: order.quantity,
          price: parseFloat(order.price) || 0, // ราคาต่อหน่วย
          subtotal: parseFloat(order.subtotal) || 0, // ราคารวม
        }));
        setOrders(formattedOrders);
      } else {
        throw new Error("Invalid order data");
      }
    } catch (error) {
      Swal.fire("❌ ยังไม่มีออร์เดอร์อาหารเข้ามา", "กรุณาลองใหม่", "error");
    }
  }, [table_id]);

  useEffect(() => {
    fetchTableDetails();
    fetchOrders();

    // ✅ ตั้งค่ารับข้อมูลแบบ Real-time
    socket.on("new_order", (newOrder) => {
      if (newOrder.table_id === parseInt(table_id)) {
        setOrders((prevOrders) => [...prevOrders, newOrder]);
      }
    });

    return () => {
      socket.off("new_order");
    };
  }, [table_id, fetchTableDetails, fetchOrders]);

  // ✅ คำนวณราคารวม
  const calculateTotal = () => {
    if (!orders || orders.length === 0) return "0.00";
    return orders.reduce((acc, order) => acc + order.subtotal, 0).toFixed(2);
  };

  const handleCancelOrder = async (orderItemId) => {
    console.log(`📌 กำลังลบ order_item_id: ${orderItemId}`); // Debugging log

    if (!orderItemId) {
      Swal.fire(
        "❌ ไม่สามารถยกเลิกออร์เดอร์ได้",
        "Order ID ไม่ถูกต้อง",
        "error"
      );
      return;
    }

    const confirm = await Swal.fire({
      title: "ยืนยันการยกเลิกออร์เดอร์นี้?",
      text: "การยกเลิกนี้จะไม่สามารถกู้คืนได้",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "ยกเลิกออร์เดอร์",
      cancelButtonText: "ยกเลิก",
    });

    if (confirm.isConfirmed) {
      try {
        const response = await axios.delete(
          `${API_URL}/api/orders/item/${orderItemId}`
        );

        if (response.data.success) {
          console.log(`✅ ลบ order_item_id: ${orderItemId} สำเร็จ`); // Debugging log

          Swal.fire(
            "✅ ยกเลิกออร์เดอร์สำเร็จ",
            "ออร์เดอร์ได้ถูกยกเลิกแล้ว",
            "success"
          );

          // 🔹 อัปเดตรายการออร์เดอร์ใน React state
          setOrders((prevOrders) =>
            prevOrders.filter((order) => order.id !== orderItemId)
          );
        } else {
          Swal.fire("❌ ไม่สามารถยกเลิกออร์เดอร์ได้", "กรุณาลองใหม่", "error");
        }
      } catch (error) {
        console.error("❌ Error canceling order:", error);
        Swal.fire("❌ ไม่สามารถยกเลิกออร์เดอร์ได้", "เกิดข้อผิดพลาด", "error");
      }
    }
  };

  // ✅ จัดการชำระเงิน
  const handlePaymentConfirm = async () => {
    try {
      const response = await axios.put(
        `${API_URL}/api/orders/confirm-payment`,
        { table_id }
      );
      if (response.data.success) {
        Swal.fire("✅ ชำระเงินสำเร็จ!", "ระบบได้บันทึกยอดขายแล้ว", "success");
        setOrders([]);
        setIsPaid(true);
      } else {
        Swal.fire("❌ ไม่สามารถบันทึกยอดขายได้", "กรุณาลองใหม่", "error");
      }
    } catch (error) {
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
        <div className="table-info">
          <h1>โต๊ะ {table?.table_number || "ไม่ระบุ"}</h1>
          <p>
            <strong>สถานะ:</strong> {table?.status || "ไม่ระบุ"}
          </p>
          <p>
            <strong>จำนวนที่นั่ง:</strong> {table?.seats || "ไม่ระบุ"} ที่
          </p>
        </div>

        <h2>📜 รายการออร์เดอร์</h2>
        {orders.length > 0 ? (
          <div className="order-list">
            {orders.map((order, index) => (
              <div key={index} className="order-card">
                <p>
                  <strong>{order.itemName || "ไม่ระบุ"}</strong>
                </p>
                <p>
                  {order.quantity} x {order.price.toFixed(2)} บาท
                </p>
                <p>รวม: {order.subtotal.toFixed(2)} บาท</p>
                <button
                  onClick={() => handleCancelOrder(order.id)}
                  className="btn-cancel"
                >
                  ❌ ยกเลิก
                </button>
              </div>
            ))}
            <div className="total-amount">
              <p>
                💰 <strong>รวมเป็นเงิน:</strong> {calculateTotal()} บาท
              </p>
            </div>
          </div>
        ) : (
          <p className="no-orders">ไม่มีออร์เดอร์</p>
        )}

        {!isPaid && (
          <button onClick={handlePaymentConfirm} className="btn-confirm">
            ✅ ยืนยันการชำระเงิน
          </button>
        )}
      </div>
    </div>
  );
};

export default TableDetails;
