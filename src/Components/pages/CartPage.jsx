import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../Api/axios";
import Swal from "sweetalert2";
import "./Cartpage.scss";

const CartPage = () => {
  const { table_id } = useParams();
  const [cart, setCart] = useState(JSON.parse(localStorage.getItem("cart")) || []);
  const session_id = localStorage.getItem(`session_${table_id}`) || Date.now();
  const navigate = useNavigate();

  const updateQuantity = (menu_id, change) => {
    setCart((prevCart) => {
      return prevCart
        .map((item) => (item.menu_id === menu_id ? { ...item, quantity: item.quantity + change } : item))
        .filter((item) => item.quantity > 0); // ลบออกถ้าจำนวนเป็น 0
    });
  };

  const handleOrder = async () => {
    try {
      const response = await axios.post("/orders/bulk", {
        table_id,
        session_id,
        orders: cart,
      });

      if (response.status === 201) {
        Swal.fire("✅ สั่งอาหารสำเร็จ!", "คำสั่งซื้อถูกส่งแล้ว", "success");
        setCart([]); // ✅ เคลียร์ตะกร้า
        localStorage.removeItem("cart");
        navigate(`/order/${table_id}`);
      }
    } catch (error) {
      console.error("❌ Error placing order:", error);
      Swal.fire("Error", "ไม่สามารถสั่งอาหารได้", "error");
    }
  };

  return (
    <div className="cart-container">
      <h1>🛒 ตะกร้าสินค้า</h1>
      {cart.length > 0 ? (
        cart.map((item) => (
          <div key={item.menu_id} className="cart-item">
            <span>{item.menu_name}</span>
            <button onClick={() => updateQuantity(item.menu_id, -1)}>-</button>
            <span>{item.quantity}</span>
            <button onClick={() => updateQuantity(item.menu_id, 1)}>+</button>
          </div>
        ))
      ) : (
        <p>ตะกร้าว่างเปล่า</p>
      )}

      {cart.length > 0 && (
        <button className="checkout-btn" onClick={handleOrder}>
          🚀 ส่ง {cart.length} รายการ
        </button>
      )}
    </div>
  );
};

export default CartPage;
