import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import axios from "../../../Api/axios";
import Swal from "sweetalert2";
import "./Orderpage.scss";

const API_URL = import.meta.env.VITE_API_URL;

const Order = () => {
  const { tableId } = useParams();
  const [searchParams] = useSearchParams();
  const isGuest = searchParams.get("guest") === "true";

  const [menu, setMenu] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/menus`);
        setMenu(response.data);
      } catch (error) {
        console.error("❌ ไม่สามารถดึงเมนูได้:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, []);

  const addToCart = (item) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((i) => i.menu_id === item.menu_id);
      if (existingItem) {
        return prevCart.map((i) =>
          i.menu_id === item.menu_id ? { ...i, quantity: i.quantity + 1 } : i
        );
      } else {
        return [...prevCart, { ...item, quantity: 1 }];
      }
    });
  };

  const handleOrder = async () => {
    if (cart.length === 0) {
      Swal.fire("⚠️ ตะกร้าว่างเปล่า", "กรุณาเลือกเมนูก่อนสั่งซื้อ", "warning");
      return;
    }

    try {
      await axios.post(`${API_URL}/api/orders`, {
        table_id: tableId,
        items: cart.map(({ menu_id, quantity }) => ({ menu_id, quantity })),
      });

      Swal.fire("✅ สั่งซื้อสำเร็จ!", "คำสั่งซื้อของคุณถูกส่งแล้ว", "success");
      setCart([]); // เคลียร์ตะกร้าหลังจากสั่งซื้อ
    } catch (error) {
      console.error("❌ สั่งซื้อผิดพลาด:", error);
      Swal.fire("❌ ไม่สามารถสั่งซื้อได้", "กรุณาลองใหม่", "error");
    }
  };

  return (
    <div className="order-container">
      <h1>📋 เมนูอาหาร - โต๊ะ {tableId}</h1>
      <p>{isGuest ? "🔓 สั่งอาหารโดยไม่ต้องล็อกอิน" : "🔐 ต้องล็อกอินก่อนสั่งอาหาร"}</p>

      {loading ? (
        <p>⏳ กำลังโหลดเมนู...</p>
      ) : (
        <div className="menu-list">
          {menu.map((item) => (
            <div key={item.menu_id} className="menu-item">
              <h3>{item.menu_name}</h3>
              <p>💰 ราคา: {item.price} บาท</p>
              <button onClick={() => addToCart(item)}>➕ เพิ่มลงตะกร้า</button>
            </div>
          ))}
        </div>
      )}

      <div className="cart">
        <h2>🛒 ตะกร้าของคุณ</h2>
        {cart.length > 0 ? (
          cart.map((item) => (
            <p key={item.menu_id}>
              {item.menu_name} x {item.quantity}
            </p>
          ))
        ) : (
          <p>🛒 ตะกร้าว่างเปล่า</p>
        )}
        <button onClick={handleOrder}>🛒 สั่งอาหาร</button>
      </div>
    </div>
  );
};

export default Order;
