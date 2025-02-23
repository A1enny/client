import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../../Api/axios"; // ✅ ใช้ axiosInstance ที่มี baseURL
import Swal from "sweetalert2"; // ✅ เพิ่ม SweetAlert2
import Navbar from "../../Layout/Navbar/Navbar";
import Sidebar from "../../Layout/Sidebar/Sidebar";
import "./Addinventory.scss";

const AddInventory = () => {
  const [ingredientName, setIngredientName] = useState("");
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [loading, setLoading] = useState(false); // ✅ เพิ่ม Loading state
  const [error, setError] = useState(null); // ✅ เพิ่ม Error state
  const navigate = useNavigate();

  // 📌 ดึงข้อมูลหมวดหมู่จาก API
  useEffect(() => {
    const fetchCategories = async () => {
      setError(null);
      try {
        const res = await axios.get("/categories");
        setCategories(res.data || []);
      } catch (error) {
        setError("❌ ไม่สามารถโหลดหมวดหมู่ได้");
        console.error("❌ Error fetching categories:", error.response?.data || error.message);
      }
    };
    fetchCategories();
  }, []);

  // 📌 ฟังก์ชันเพิ่มวัตถุดิบ
  const handleAddIngredient = async (e) => {
    e.preventDefault();

    if (!ingredientName.trim() || !categoryId || !quantity) {
      Swal.fire({
        icon: "warning",
        title: "ข้อมูลไม่ครบถ้วน",
        text: "กรุณากรอกข้อมูลให้ครบทุกช่อง!",
      });
      return;
    }

    const quantityInGrams = parseFloat(quantity);
    if (isNaN(quantityInGrams) || quantityInGrams <= 0) {
      Swal.fire({
        icon: "error",
        title: "ปริมาณไม่ถูกต้อง",
        text: "ปริมาณต้องเป็นตัวเลขที่มากกว่า 0!",
      });
      return;
    }

    setLoading(true);
    try {
      await axios.post("/ingredients", {
        ingredient_name: ingredientName.trim(),
        category_id: parseInt(categoryId, 10),
        quantity: quantityInGrams,
      });

      Swal.fire({
        icon: "success",
        title: "เพิ่มวัตถุดิบสำเร็จ!",
        text: `${ingredientName} ถูกเพิ่มในระบบแล้ว`,
        showConfirmButton: false,
        timer: 2000,
      }).then(() => {
        navigate("/inventory");
      });
    } catch (error) {
      console.error("❌ Error adding ingredient:", error.response?.data || error.message);
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: "ไม่สามารถเพิ่มวัตถุดิบได้ กรุณาลองใหม่",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-inventory-container">
      <Navbar />
      <Sidebar />
      <div className="add-inventory-content">
        <h2>เพิ่มวัตถุดิบใหม่</h2>

        {/* แสดง Error ถ้ามี */}
        {error && <p style={{ color: "red", fontWeight: "bold" }}>{error}</p>}

        <form className="add-inventory-form">
          {/* ชื่อวัตถุดิบ */}
          <div className="form-group">
            <label>ชื่อวัตถุดิบ:</label>
            <input
              type="text"
              placeholder="กรอกชื่อวัตถุดิบ"
              value={ingredientName}
              onChange={(e) => setIngredientName(e.target.value)}
              required
            />
          </div>

          {/* หมวดหมู่ */}
          <div className="form-group">
            <label>หมวดหมู่:</label>
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required>
              <option value="">เลือกหมวดหมู่</option>
              {categories.map((category) => (
                <option key={category.category_id} value={category.category_id}>
                  {category.category_name}
                </option>
              ))}
            </select>
          </div>

          {/* จำนวนวัตถุดิบ */}
          <div className="form-group">
            <label>จำนวน (กรัม):</label>
            <input
              type="number"
              placeholder="กรอกจำนวน"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />
          </div>

          {/* ปุ่มกด */}
          <div className="button-group">
            <button type="button" className="submit-btn" onClick={handleAddIngredient} disabled={loading}>
              {loading ? "กำลังเพิ่ม..." : "เพิ่มวัตถุดิบ"}
            </button>
            <button type="button" className="cancel-btn" onClick={() => navigate("/inventory")}>
              ยกเลิก
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddInventory;
