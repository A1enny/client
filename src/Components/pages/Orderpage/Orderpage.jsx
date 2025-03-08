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
  const [table, setTable] = useState(null);
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
          const updatedMenu = await Promise.all(
            response.data.results.map(async (item) => {
              const stockCheck = await checkStock(item.recipe_id);
              return {
                ...item,
                id: item.id ?? item.menu_id,
                available_stock: item.available_stock ?? item.stock ?? 0,
                isOutOfStock: stockCheck, // ✅ เพิ่ม isOutOfStock
              };
            })
          );

          setMenu(updatedMenu);
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

  // ✅ ตรวจสอบสต็อกจาก API และคำนวณจำนวนจานที่ทำได้
  const checkStock = async (recipe_id) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/menus/check-stock/${recipe_id}`
      );
      console.log(`📌 Stock Check for recipe ${recipe_id}:`, response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Error checking stock:", error);
      return { maxDishes: 0, isOutOfStock: true };
    }
  };

  // ✅ ดึงข้อมูลเมนูพร้อมคำนวณสต็อกที่ทำได้
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/menus`);
        console.log("📌 Fetched Menu Data:", response.data.results);

        if (response.data.results.length > 0) {
          const updatedMenu = await Promise.all(
            response.data.results.map(async (item) => {
              const stockData = await checkStock(item.recipe_id);
              return {
                ...item,
                id: item.id ?? item.menu_id,
                available_stock: stockData.maxDishes, // ✅ ใช้จำนวนจานที่ทำได้แทน stock
                isOutOfStock: stockData.isOutOfStock,
              };
            })
          );

          setMenu(updatedMenu);
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

  useEffect(() => {
    const fetchTableInfo = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/tables/${tableId}`);
        console.log("📌 Table Data:", response.data);
        setTable(response.data); // ✅ เก็บข้อมูลโต๊ะ
      } catch (error) {
        console.error("❌ ไม่สามารถดึงข้อมูลโต๊ะ:", error);
        Swal.fire("❌ ไม่สามารถดึงข้อมูลโต๊ะ");
      }
    };

    fetchTableInfo();
  }, [tableId]);

  // ✅ ป้องกันการเพิ่มเมนูเกินจำนวนที่ทำได้
  const addToCart = (item) => {
    console.log("📌 Debug addToCart:", item);

    if (!item.id || !item.price) {
      Swal.fire("❌ ข้อมูลเมนูไม่ถูกต้อง", "กรุณาลองใหม่", "error");
      return;
    }
    if (item.isOutOfStock) {
      Swal.fire("⚠️ สินค้าหมด", "เมนูนี้ไม่สามารถสั่งได้ในขณะนี้", "warning");
      return;
    }

    // ✅ ตรวจสอบว่าสั่งเกินจำนวนที่ทำได้หรือไม่
    const existingItem = cart.find((i) => i.id === item.id);
    const newQuantity = (existingItem ? existingItem.quantity : 0) + 1;

    if (newQuantity > item.available_stock) {
      Swal.fire(
        "⚠️ สต็อกไม่เพียงพอ",
        `เมนู "${item.name}" ทำได้ ${item.available_stock} จาน แต่คุณเลือก ${newQuantity} จาน`,
        "warning"
      );
      return;
    }

    setCart((prevCart) =>
      existingItem
        ? prevCart.map((i) =>
            i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
          )
        : [...prevCart, { ...item, quantity: 1 }]
    );
  };

  // ✅ ลบเมนูออกจากตะกร้า
  const removeFromCart = (menuId) => {
    setCart((prevCart) =>
      prevCart
        .map((i) => (i.id === menuId ? { ...i, quantity: i.quantity - 1 } : i))
        .filter((i) => i.quantity > 0)
    );
  };

  // ✅ ส่งออร์เดอร์
  const handleOrder = async () => {
    if (cart.length === 0) {
      Swal.fire("⚠️ ตะกร้าว่างเปล่า", "กรุณาเลือกเมนูก่อนสั่งซื้อ", "warning");
      return;
    }

    // 🔍 ตรวจสอบสต็อกก่อนส่งออเดอร์
    for (const item of cart) {
      if (item.isOutOfStock || item.available_stock < item.quantity) {
        Swal.fire(
          "⚠️ สต็อกไม่เพียงพอ",
          `เมนู "${item.name}" คงเหลือ ${item.available_stock} ชิ้น แต่คุณเลือก ${item.quantity} ชิ้น`,
          "warning"
        );
        return;
      }
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

      // ✅ อัปเดตสต็อกหลังจากสั่งซื้อ
      setMenu((prevMenu) =>
        prevMenu.map((item) => {
          const orderedItem = cart.find((c) => c.id === item.id);
          return orderedItem
            ? {
                ...item,
                available_stock: item.available_stock - orderedItem.quantity,
              }
            : item;
        })
      );

      setCart([]);
    } catch (error) {
      console.error("❌ สั่งซื้อผิดพลาด:", error);
      Swal.fire("❌ ไม่สามารถสั่งซื้อได้", "กรุณาลองใหม่", "error");
    }
  };

  return (
    <div className="order-container">
      <h1 className="title">🍽️ เมนูอาหาร</h1>
      <p className="table-info">
        📌 โต๊ะที่: {table ? table.table_number : "กำลังโหลด..."}
      </p>

      {loading ? (
        <p>⏳ กำลังโหลดเมนู...</p>
      ) : (
        <div className="menu-grid">
          {menu.map((item) => (
            <div key={item.id} className="menu-card">
              <img
                src={item.image ? item.image : "/default_image.jpg"}
                alt={item.name}
                className="menu-img"
                onError={(e) => (e.target.src = "/default_image.jpg")}
              />
              <h2>{item.name}</h2>

              <p className="price">฿{parseFloat(item.price || 0).toFixed(2)}</p>

              {item.isOutOfStock ? (
                <p className="out-of-stock">❌ สินค้าหมด</p>
              ) : (
                <button className="add-btn" onClick={() => addToCart(item)}>
                  เพิ่มลงตะกร้า
                </button>
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
              <li key={item.id}>
                {item.name} x {item.quantity}{" "}
                <strong>
                  ฿{(parseFloat(item.price || 0) * item.quantity).toFixed(2)}
                </strong>
                <button
                  className="remove-btn"
                  onClick={() => removeFromCart(item.id)}
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
