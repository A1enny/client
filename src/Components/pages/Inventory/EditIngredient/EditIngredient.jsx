import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../../Layout/Navbar/Navbar";
import Sidebar from "../../Layout/Sidebar/Sidebar";
import "./EditIngredient.scss";

const EditIngredient = () => {
  const { id } = useParams(); // รับ id จาก URL
  const [ingredient, setIngredient] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true); // ใช้เพื่อเช็คว่าโหลดข้อมูลอยู่หรือไม่
  const [unit, setUnit] = useState("kg"); // Default is kg (kilograms)
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`http://119.59.101.35:5000/ingredients/${id}`);
        setIngredient(res.data);
        setUnit(res.data.quantity <= 1 ? "g" : "kg"); // กำหนดหน่วยเริ่มต้นตามจำนวน
        const categoriesRes = await axios.get("http://119.59.101.35:5000/categories");
        setCategories(categoriesRes.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault(); // ป้องกันการรีเฟรชหน้า

    // ถ้าเลือกเป็นกรัม ให้แปลงจำนวนจากกรัมเป็นกิโลกรัม
    let updatedQuantity = ingredient.quantity;
    if (unit === "g") {
      updatedQuantity = updatedQuantity / 1000; // แปลงจากกรัมเป็นกิโลกรัม
    } else {
      updatedQuantity = updatedQuantity * 1000; // แปลงจากกิโลกรัมเป็นกรัม
    }

    try {
      await axios.put(`http://119.59.101.35:5000/ingredients/${id}`, {
        ingredient_name: ingredient.ingredient_name,
        category_id: ingredient.category_id,
        quantity: updatedQuantity, // ส่งจำนวนที่แปลงแล้ว
      });
      alert("แก้ไขวัตถุดิบสำเร็จ!");
      navigate("/inventory"); // กลับไปยังหน้า Inventory
    } catch (error) {
      console.error("Error updating ingredient:", error);
      alert("เกิดข้อผิดพลาดในการแก้ไขวัตถุดิบ");
    }
  };

  if (loading) {
    return <div>Loading...</div>; // ถ้ากำลังโหลดข้อมูล
  }

  if (!ingredient) {
    return <div>ไม่พบข้อมูลวัตถุดิบ</div>;
  }

  return (
    <div className="EditIngredient-container">
      <Navbar />
      <Sidebar />
      <div className="EditIngredient-content">
        <h1>แก้ไขวัตถุดิบ</h1>
        <form onSubmit={handleUpdate}>
          <div className="form-group">
            <label>ชื่อวัตถุดิบ</label>
            <input
              type="text"
              value={ingredient.ingredient_name}
              onChange={(e) => setIngredient({ ...ingredient, ingredient_name: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>หมวดหมู่</label>
            <select
              value={ingredient.category_id}
              onChange={(e) => setIngredient({ ...ingredient, category_id: e.target.value })}
            >
              {categories.map((category) => (
                <option key={category.category_id} value={category.category_id}>
                  {category.category_name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>จำนวน</label>
            <input
              type="number"
              value={ingredient.quantity}
              onChange={(e) => setIngredient({ ...ingredient, quantity: e.target.value })}
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

          <button type="submit" className="submit-btn">บันทึกการแก้ไข</button>
          <button type="button" className="cancel-btn" onClick={() => navigate("/inventory")}>ยกเลิก</button>
        </form>
      </div>
    </div>
  );
};

export default EditIngredient;
