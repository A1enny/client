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

  const generateSessionId = () => {
    return 'session-' + Math.random().toString(36).substr(2, 9);  // สร้าง session_id แบบสุ่ม
  };
  
  // เมื่อหน้าเว็บโหลดครั้งแรก ถ้ายังไม่มี session_id ให้เก็บมันไว้ใน sessionStorage
  if (!sessionStorage.getItem('session_id')) {
    sessionStorage.setItem('session_id', generateSessionId());
  }
  
  // ดึง session_id จาก sessionStorage
  const session_id = sessionStorage.getItem('session_id');
  
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/menus`);
        if (response.data && response.data.results && response.data.results.length > 0) {
          setMenu(response.data.results);
          console.log("Fetched Menu:", response.data.results); // Log response to check
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
  
  const removeFromCart = (menuId) => {
    setCart((prevCart) =>
      prevCart
        .map((i) => (i.menu_id === menuId ? { ...i, quantity: i.quantity - 1 } : i))
        .filter((i) => i.quantity > 0)
    );
  };

  const addToCart = (item) => {
    // ตรวจสอบว่า item มี menu_id และ price ก่อนเพิ่ม
    if (!item.menu_id || !item.price) {
      console.log("Item missing menu_id or price:", item);
      return;
    }
  
    console.log("Adding to cart:", item);  // Log ข้อมูลเมนูที่เพิ่ม
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
  
    // ตรวจสอบว่ามี menu_id และ price ก่อนที่จะส่งคำขอ
    if (!cart[0].menu_id || !cart[0].price) {
      Swal.fire("❌ ข้อมูลไม่ครบถ้วน", "กรุณาเลือกเมนูก่อนสั่งซื้อ", "warning");
      console.log("Item missing menu_id or price:", cart[0]);  // ใช้ console.log ตรวจสอบ
      return;
    }
  
    const orderData = {
      table_id: tableId,  
      session_id: sessionStorage.getItem('session_id'),  // ดึง session_id จาก sessionStorage
      menu_id: cart[0].menu_id,  // menu_id มาจากรายการในตะกร้า
      quantity: cart[0].quantity,  // quantity มาจากตะกร้า
      price: parseFloat(cart[0].price)  // ทำให้แน่ใจว่า price เป็น number ไม่ใช่ string
    };
  
    console.log("Order Data ที่จะส่งไป:", orderData);
  
    try {
      // ส่งข้อมูลการสั่งไปที่ backend
      await axios.post(`${API_URL}/api/orders`, orderData);
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

      {loading ? <p>กำลังโหลดเมนู...</p> : (
        <div className="menu-grid">
          {menu.map((item) => (
            <div key={item.menu_id} className="menu-card">
              <img src={item.image_url || "/default_image.jpg"} alt={item.menu_name} className="menu-img" />
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
