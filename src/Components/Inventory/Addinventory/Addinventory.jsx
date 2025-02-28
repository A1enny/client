import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../../Api/axios";
import Swal from "sweetalert2";
import Navbar from "../../Layout/Navbar/Navbar";
import Sidebar from "../../Layout/Sidebar/Sidebar";
import "./Addinventory.scss";

const AddInventory = () => {
  const [ingredientName, setIngredientName] = useState("");
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [receivedDate, setReceivedDate] = useState("");
  const [expirationDate, setExpirationDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      setError(null);
      try {
        const res = await axios.get("/api/categories");
        setCategories(res.data || []);
      } catch (error) {
        setError("❌ ไม่สามารถโหลดหมวดหมู่ได้");
        console.error("❌ Error fetching categories:", error.response?.data || error.message);
      }
    };
    fetchCategories();
  }, []);

  const handleAddIngredient = async (e) => {
    e.preventDefault();
  
    // 📌 ตรวจสอบว่าข้อมูลถูกกรอกครบถ้วน
    if (!ingredientName.trim() || !categoryId || !quantity || !receivedDate) {
      Swal.fire({
        icon: "warning",
        title: "⚠ ข้อมูลไม่ครบถ้วน",
        text: "กรุณากรอกข้อมูลให้ครบทุกช่อง!",
      });
      return;
    }
  
    const quantityInGrams = parseFloat(quantity);
    if (isNaN(quantityInGrams) || quantityInGrams <= 0) {
      Swal.fire({
        icon: "error",
        title: "🚫 ปริมาณไม่ถูกต้อง",
        text: "ปริมาณต้องเป็นตัวเลขที่มากกว่า 0!",
      });
      return;
    }
  
    // 📌 ถ้าผู้ใช้ไม่ได้กรอกวันหมดอายุ ให้ใช้ `null`
    const expirationValue = expirationDate?.trim() ? expirationDate : null;
  
    setLoading(true);
    try {
      // ✅ ตรวจสอบว่าวัตถุดิบนี้มีอยู่แล้วหรือไม่
      const response = await axios.get(`/api/materials`, {
        params: { search: ingredientName },
      });
  
      let materialId;
      if (response.data && response.data.results.length > 0) {
        materialId = response.data.results[0].material_id;
      } else {
        // ✅ ถ้ายังไม่มี ให้เพิ่มวัตถุดิบใหม่
        const newMaterialResponse = await axios.post("/api/materials", {
          name: ingredientName,
          category_id: parseInt(categoryId, 10),
          unit_id: 1,
        });
        materialId = newMaterialResponse.data.material_id;
      }
  
      // ✅ ส่งข้อมูลล็อตวัตถุดิบ
      await axios.post("/api/inventory-batches", {
        material_id: materialId,
        quantity: quantityInGrams,
        received_date: receivedDate,
        expiration_date: expirationValue, // ✅ ถ้าไม่มีค่า ให้ส่ง `null`
      });
  
      // ✅ แจ้งเตือนว่าเพิ่มข้อมูลสำเร็จ
      Swal.fire({
        icon: "success",
        title: "🎉 เพิ่มวัตถุดิบสำเร็จ!",
        text: `${ingredientName} ถูกเพิ่มลงในคลังเรียบร้อย`,
        showConfirmButton: false,
        timer: 2000,
      }).then(() => {
        // ✅ รีเซ็ตค่าฟอร์ม
        setIngredientName("");
        setCategoryId("");
        setQuantity("");
        setReceivedDate("");
        setExpirationDate("");
        navigate("/inventory");
      });
  
    } catch (error) {
      console.error("❌ Error adding ingredient:", error.response?.data || error.message);
      
      // ✅ แสดง error message ที่ชัดเจนขึ้น
      Swal.fire({
        icon: "error",
        title: "❌ เกิดข้อผิดพลาด",
        text: error.response?.data?.error || "ไม่สามารถเพิ่มวัตถุดิบได้ กรุณาลองใหม่",
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
        <h2 className="form-title">เพิ่มวัตถุดิบใหม่</h2>

        {error && <p className="error-message">{error}</p>}

        <form className="add-inventory-form">
          <div className="form-group">
            <label>ชื่อวัตถุดิบ:</label>
            <input type="text" value={ingredientName} onChange={(e) => setIngredientName(e.target.value)} required />
          </div>

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

          <div className="form-group">
            <label>จำนวน (กรัม):</label>
            <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} required />
          </div>

          <div className="form-group">
            <label>วันที่รับเข้า:</label>
            <input type="date" value={receivedDate} onChange={(e) => setReceivedDate(e.target.value)} required />
          </div>

          <div className="form-group">
            <label>วันหมดอายุ (ถ้ามี):</label>
            <input type="date" value={expirationDate} onChange={(e) => setExpirationDate(e.target.value)} />
          </div>

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
  