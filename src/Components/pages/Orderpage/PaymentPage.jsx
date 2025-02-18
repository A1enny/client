import React from "react";
import QRCode from "qrcode.react";
import { useParams } from "react-router-dom";

const PaymentPage = () => {
  const { tableId } = useParams();
  const promptPayNumber = "0812345678";  // เปลี่ยนเป็นเบอร์บัญชีร้านค้า
  const amount = 100;  // ดึงจากฐานข้อมูลจริง

  return (
    <div>
      <h2>QR Code สำหรับการชำระเงิน</h2>
      <QRCode value={`promptpay://${promptPayNumber}/${amount}`} size={200} />
      <p>กรุณาสแกน QR Code เพื่อชำระเงิน</p>
      
      {/* ปุ่มกดยืนยันหลังจากจ่ายเสร็จ */}
      <button onClick={() => window.location.href = `/confirm-payment/${tableId}`}>
        ยืนยันการชำระเงิน
      </button>
    </div>
  );
};

export default PaymentPage;
