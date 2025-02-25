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
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`http://119.59.101.35:5000/ingredients/${id}`);
        setIngredient(res.data);
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
    e.preventDefault();

    let updatedQuantity = parseFloat(ingredient.quantity); // ✅ ใช้ค่าเดิมตรง ๆ เป็นกรัม

    try {
      await axios.put(`http://119.59.101.35:5000/ingredients/${id}`, {
        ingredient_name: ingredient.ingredient_name,
        category_id: ingredient.category_id,
        quantity: updatedQuantity, // ✅ ส่งค่าเป็นกรัมโดยตรง
      });
      alert("แก้ไขวัตถุดิบสำเร็จ!");
      navigate("/inventory");
    } catch (error) {
      console.error("Error updating ingredient:", error);
      alert("เกิดข้อผิดพลาดในการแก้ไขวัตถุดิบ");
    }
  };

  if (loading) {
    return <div>Loading...</div>;
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
            <label>จำนวน (กรัม)</label>
            <input
              type="number"
              value={ingredient.quantity}
              onChange={(e) => setIngredient({ ...ingredient, quantity: e.target.value })}
            />
          </div>

          <button type="submit" className="submit-btn">บันทึกการแก้ไข</button>
          <button type="button" className="cancel-btn" onClick={() => navigate("/inventory")}>
            ยกเลิก
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditIngredient;
