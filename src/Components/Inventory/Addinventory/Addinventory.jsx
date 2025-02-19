import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../../Layout/Navbar/Navbar";
import Sidebar from "../../Layout/Sidebar/Sidebar";
import "./Addinventory.scss";

const AddInventory = () => {
  const [ingredientName, setIngredientName] = useState("");
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState("");
  const [quantity, setQuantity] = useState("");
  const navigate = useNavigate();

  // Fetch categories for the dropdown
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get("http://localhost:3002/api/categories");
        setCategories(res.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  const handleAddIngredient = async () => {
    if (!ingredientName || !categoryId || !quantity) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }
  
    let quantityInGrams = parseFloat(quantity); // ✅ ไม่ต้องคูณ 1000
  
    try {
      await axios.post("http://localhost:3002/api/ingredients", {
        ingredient_name: ingredientName,
        category_id: parseInt(categoryId),
        quantity: quantityInGrams, // ✅ ส่งค่าเป็นกรัมตรง ๆ
      });
      alert("เพิ่มวัตถุดิบสำเร็จ!");
      navigate("/inventory");
    } catch (error) {
      console.error("Error adding ingredient:", error);
      alert("เกิดข้อผิดพลาดในการเพิ่มวัตถุดิบ");
    }
  };  

  return (
    <div className="add-inventory-container">
      <Navbar />
      <Sidebar />
      <div className="add-inventory-content">
        <h2>เพิ่มวัตถุดิบใหม่</h2>
        <form className="add-inventory-form">
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
          <div className="form-group">
            <label>หมวดหมู่:</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
            >
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
            <input
              type="number"
              placeholder="กรอกจำนวน"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />
          </div>
          <div className="Buttonn">
            <button
              type="button"
              className="submit-btn"
              onClick={handleAddIngredient}
            >
              เพิ่มวัตถุดิบ
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
