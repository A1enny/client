import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../../Layout/Navbar/Navbar";
import Sidebar from "../../Layout/Sidebar/Sidebar";
import "./AddInventory.scss";

const AddInventory = () => {
  const [ingredientName, setIngredientName] = useState("");
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("kg"); // Default is kg (kilograms)
  const navigate = useNavigate();

  // Fetch categories for the dropdown
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get("http://119.59.101.35:5000/categories");
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

    let quantityInKg = parseFloat(quantity);
    // If unit is 'g', convert the quantity to kg
    if (unit === "g") {
      quantityInKg = quantityInKg / 1000; // Convert grams to kilograms
    }

    try {
      await axios.post("http://119.59.101.35:5000/ingredients", {
        ingredient_name: ingredientName,
        category_id: parseInt(categoryId),
        quantity: quantityInKg, // Store quantity in kg
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
            <label>จำนวน:</label>
            <input
              type="number"
              placeholder="กรอกจำนวน"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>หน่วย:</label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              required
            >
              <option value="kg">กิโลกรัม (kg)</option>
              <option value="g">กรัม (g)</option>
            </select>
          </div>
          <div className="Buttonn">
            <button
            type="button"
            className="submit-btn"
            onClick={handleAddIngredient}
          >
            เพิ่มวัตถุดิบ
          </button>
          <button type="button" className="cancel-btn" onClick={() => navigate("/inventory")}>ยกเลิก</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddInventory;
