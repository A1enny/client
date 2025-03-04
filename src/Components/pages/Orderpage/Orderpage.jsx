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

  // ✅ สร้าง session_id หากไม่มี
  const generateSessionId = () =>
    "session-" + Math.random().toString(36).substr(2, 9);
  if (!sessionStorage.getItem("session_id")) {
    sessionStorage.setItem("session_id", generateSessionId());
  }
  const session_id = sessionStorage.getItem("session_id");

  // ✅ ดึงข้อมูลเมนูจาก API
  useEffect(() => {
    const fetchMenu = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/menus`);
            console.log("📌 Fetched Menu Data:", response.data.results);

            if (response.data.results.length > 0) {
                setMenu(response.data.results.map(item => ({
                    ...item,
                    id: item.id ?? item.menu_id,  // รองรับกรณีที่ API ใช้ชื่อ menu_id
                    available_stock: item.available_stock ?? 1
                })));
            } else {
                Swal.fire("❌ ไม่มีข้อมูลเมนู");
            }
        } catch (error) {
            console.error("❌ ไม่สามารถดึงเมนูได้:", error);
            Swal.fire("❌ ไม่สามารถดึงข้อมูลเมนู");
        } finally {
            setLoading(false);
        }
    };

    fetchMenu();
}, []);

  // ✅ เพิ่มเมนูลงตะกร้า
  const addToCart = (item) => {
    console.log("📌 Debug addToCart:", item);
  
    if (!item.id || !item.price) {
        Swal.fire("❌ ข้อมูลเมนูไม่ถูกต้อง", "กรุณาลองใหม่", "error");
        return;
    }
    if (item.available_stock === 0) {
        Swal.fire("⚠️ สินค้าหมด", "เมนูนี้ไม่สามารถสั่งได้ในขณะนี้", "warning");
        return;
    }
  
    setCart((prevCart) => {
        const existingItem = prevCart.find((i) => i.id === item.id);
        return existingItem
            ? prevCart.map((i) =>
                  i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
              )
            : [...prevCart, { ...item, quantity: 1 }];
    });
  };
  

  // ✅ ลบเมนูออกจากตะกร้า
  const removeFromCart = (menuId) => {
    setCart((prevCart) =>
      prevCart
        .map((i) =>
          i.menu_id === menuId ? { ...i, quantity: i.quantity - 1 } : i
        )
        .filter((i) => i.quantity > 0)
    );
  };

  // ✅ ส่งออร์เดอร์
  const handleOrder = async () => {
    if (cart.length === 0) {
      Swal.fire("⚠️ ตะกร้าว่างเปล่า", "กรุณาเลือกเมนูก่อนสั่งซื้อ", "warning");
      return;
    }

    const orderData = {
      table_id: tableId,
      session_id,
      orders: cart.map((item) => ({
        menu_id: item.id,
        quantity: item.quantity,
        price: parseFloat(item.price),
      })),
    };

    try {
      await axios.post(`${API_URL}/api/orders/bulk`, orderData);
      Swal.fire("✅ สั่งซื้อสำเร็จ!", "คำสั่งซื้อของคุณถูกส่งแล้ว", "success");
      setCart([]);
    } catch (error) {
      console.error("❌ สั่งซื้อผิดพลาด:", error);
      Swal.fire("❌ ไม่สามารถสั่งซื้อได้", "กรุณาลองใหม่", "error");
    }
  };

  return (
    <div className="order-container">
      <h1 className="title">🍽️ เมนูอาหาร</h1>
      <p className="table-info">📌 โต๊ะที่: {tableId}</p>

      {loading ? (
        <p>⏳ กำลังโหลดเมนู...</p>
      ) : (
        <div className="menu-grid">
          {menu.map((item) => (
            <div key={item.menu_id} className="menu-card">
              <img
                src={item.image ? item.image : "/default_image.jpg"}
                alt={item.name} // แก้จาก menu_name เป็น name ตาม API
                className="menu-img"
                onError={(e) => (e.target.src = "/default_image.jpg")}
              />
              <h2>{item.menu_name}</h2>
              <p className="price">฿{item.price}</p>
              {item.available_stock > 0 ? (
                <button className="add-btn" onClick={() => addToCart(item)}>
                  เพิ่มลงตะกร้า
                </button>
              ) : (
                <p className="out-of-stock">❌ สินค้าหมด</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ตะกร้าอาหาร */}
      <div className="cart">
        <h2>🛒 ตะกร้าสั่งอาหาร</h2>
        {cart.length === 0 ? (
          <p>🛑 ตะกร้าว่าง</p>
        ) : (
          <ul>
            {cart.map((item) => (
              <li key={item.menu_id}>
                {item.menu_name} x {item.quantity}
                <button
                  className="remove-btn"
                  onClick={() => removeFromCart(item.menu_id)}
                >
                  ลบ
                </button>
              </li>
            ))}
          </ul>
        )}
        <button className="order-btn" onClick={handleOrder}>
          ยืนยันออเดอร์
        </button>
      </div>
    </div>
  );
};

export default OrderPage;
