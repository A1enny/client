import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "../../../Api/axios";
import socket from "../../../Api/socket";
import Swal from "sweetalert2";
import "./Orderpage.scss";

const OrderPage = () => {
  const { table_id } = useParams(); // ดึงค่า table_id จาก URL
  const [menu, setMenu] = useState([]);
  const [cart, setCart] = useState([]);

  // 📌 โหลดเมนูอาหารจาก API
  useEffect(() => {
    axios
      .get("http://192.168.1.43:3002/api/menus")
      .then((response) => {
        console.log("📡 เมนูที่ได้รับจาก API:", response.data);
        setMenu(response.data);
      })
      .catch((error) => {
        console.error("❌ เกิดข้อผิดพลาดในการดึงเมนู:", error);
      });
  }, []);

  // 📌 เพิ่มเมนูลงในตะกร้า
  const addToCart = (item) => {
    if (!item.id) {
      console.error("❌ menu_id เป็น undefined:", item);
      return;
    }

    setCart((prevCart) => {
      const existingItem = prevCart.find((i) => i.menu_id === item.id);
      if (existingItem) {
        return prevCart.map((i) =>
          i.menu_id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      } else {
        return [...prevCart, { ...item, quantity: 1, menu_id: item.id }];
      }
    });
  };

  // 📌 สั่งอาหาร
  const placeOrder = async () => {
    if (!table_id) {
      Swal.fire("❌ เกิดข้อผิดพลาด", "ไม่พบหมายเลขโต๊ะ กรุณาลองใหม่", "error");
      return;
    }

    if (cart.length === 0) {
      Swal.fire("🛒 ตะกร้าว่างเปล่า", "กรุณาเลือกสินค้า", "warning");
      return;
    }

    try {
      const session_id = `session-${table_id}-${Date.now()}`;
      const ordersPayload = cart.map((item) => ({
        menu_id: item.menu_id,
        quantity: item.quantity,
        price: item.price,
      }));

      console.log("📡 ข้อมูลที่ส่งไป Backend:", {
        table_id,
        session_id,
        orders: ordersPayload,
      });

      const response = await axios.post(
        "http://192.168.1.43:3002/api/orders/bulk",
        {
          table_id,
          session_id,
          orders: ordersPayload,
        }
      );

      if (response.data.success) {
        // แจ้งเตือน WebSocket
        socket.emit("new_order", response.data);

        Swal.fire("✅ สั่งซื้อสำเร็จ", "ออเดอร์ของคุณถูกส่งแล้ว", "success").then(
          () => setCart([]) // ล้างตะกร้า
        );
      } else {
        throw new Error(response.data.message || "เกิดข้อผิดพลาดไม่ทราบสาเหตุ");
      }
    } catch (error) {
      console.error("❌ Error placing order:", error.response?.data || error.message);
      Swal.fire("❌ เกิดข้อผิดพลาด", error.response?.data?.message || "ไม่สามารถสั่งซื้อได้", "error");
    }
  };

  // 📌 อัปเดตจำนวนสินค้าในตะกร้า
  const updateQuantity = (menu_id, quantity) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.menu_id === menu_id
          ? { ...item, quantity: Math.max(1, quantity) }
          : item
      )
    );
  };

  return (
    <div className="order-page">
      <h2>📦 รายการออเดอร์สำหรับโต๊ะ {table_id}</h2>
      <h3>📜 เมนูอาหาร</h3>
      <div className="menu-list">
        {menu.length > 0 ? (
          menu.map((item) => (
            <div key={item.id} className="menu-item">
              <img
                src={item.image}
                alt={item.name}
                onError={(e) => (e.target.src = "fallback-image.png")}
              />
              <h3>{item.name}</h3>
              <p>{Number(item.price).toFixed(2)} บาท</p>
              <button onClick={() => addToCart(item)}>🛒 เพิ่มลงตะกร้า</button>
            </div>
          ))
        ) : (
          <p>📌 ไม่มีเมนูอาหารที่พร้อมให้บริการ</p>
        )}
      </div>

      <h3 className="bucket">🛍️ ตะกร้าสินค้า</h3>
      <div className="cart">
        {cart.length > 0 ? (
          cart.map((item) => (
            <div key={item.menu_id} className="cart-item">
              <h3>{item.name}</h3>
              <p>{Number(item.price).toFixed(2)} บาท</p>
              <div className="quantity-controls">
                <button onClick={() => updateQuantity(item.menu_id, item.quantity + 1)}>
                  ➕
                </button>
                <span>{item.quantity}</span>
                <button onClick={() => updateQuantity(item.menu_id, item.quantity - 1)}>
                  ➖
                </button>
              </div>
              <button onClick={() => setCart(cart.filter((i) => i.menu_id !== item.menu_id))}>
                ❌ ลบ
              </button>
            </div>
          ))
        ) : (
          <p>🛒 ตะกร้าว่างเปล่า</p>
        )}
      </div>

      <button onClick={placeOrder} className="place-order" disabled={cart.length === 0}>
        {cart.length > 0 ? "✅ สั่งรายการ" : "🛒 เพิ่มสินค้าเพื่อสั่งซื้อ"}
      </button>
    </div>
  );
};

export default OrderPage;
