import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import axios from "../../../Api/axios";
import Swal from "sweetalert2";
import "./Orderpage.scss";

const API_URL = import.meta.env.VITE_API_URL;

const OrderPage = () => {
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

  const removeFromCart = (menuId) => {
    setCart((prevCart) =>
      prevCart
        .map((i) => (i.menu_id === menuId ? { ...i, quantity: i.quantity - 1 } : i))
        .filter((i) => i.quantity > 0)
    );
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
      <h1 className="title">🍽️ เมนูอาหาร</h1>
      <p className="table-info">📌 โต๊ะที่: {tableId}</p>

      {loading ? <p>กำลังโหลดเมนู...</p> : (
        <div className="menu-grid">
          {menu.map((item) => (
            <div key={item.menu_id} className="menu-card">
              <img src={item.image_url} alt={item.menu_name} className="menu-img" />
              <h2>{item.menu_name}</h2>
              <p className="price">฿{item.price}</p>
              <button className="add-btn" onClick={() => addToCart(item)}>เพิ่มลงตะกร้า</button>
            </div>
          ))}
        </div>
      )}

      {/* ตะกร้าอาหาร */}
      <div className="cart">
        <h2>🛒 ตะกร้าสั่งอาหาร</h2>
        {cart.length === 0 ? <p>ตะกร้าว่าง</p> : (
          <ul>
            {cart.map((item) => (
              <li key={item.menu_id}>
                {item.menu_name} x {item.quantity}  
                <button className="remove-btn" onClick={() => removeFromCart(item.menu_id)}>ลบ</button>
              </li>
            ))}
          </ul>
        )}
        <button className="order-btn" onClick={handleOrder}>ยืนยันออเดอร์</button>
      </div>
    </div>
  );
};

export default OrderPage;
