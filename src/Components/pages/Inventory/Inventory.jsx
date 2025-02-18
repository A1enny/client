import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../../Layout/Navbar/Navbar";
import Sidebar from "../../Layout/Sidebar/Sidebar";
import { MdArrowBackIos, MdArrowForwardIos } from "react-icons/md";
import "./Inventory.scss";

const Inventory = () => {
  const [ingredients, setIngredients] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  // Fetch data from API with pagination and categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("📢 Fetching ingredients with filters:", {
          searchTerm,
          category: selectedCategory,
        });

        const ingredientsRes = await axios.get(
          "http://localhost:3002/api/ingredients",
          {
            params: {
              searchTerm,
              category: selectedCategory,
            },
          }
        );

        console.log("✅ Fetched ingredients:", ingredientsRes.data);

        setIngredients(ingredientsRes.data.results);
        setTotalPages(1); // ✅ ปิด Pagination ตอนค้นหา
      } catch (error) {
        console.error("❌ Error fetching data:", error);
      }
    };
    fetchData();
  }, [searchTerm, selectedCategory]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get("http://localhost:3002/api/categories");
        console.log("📢 Categories Data:", res.data); // ✅ ตรวจสอบข้อมูลที่ได้
        setCategories(res.data);
      } catch (error) {
        console.error("❌ Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Reset pagination when filter is applied
  useEffect(() => {
    setCurrentPage(1); // ✅ รีเซ็ตเป็นหน้าแรกเมื่อเปลี่ยนการค้นหา
  }, [searchTerm, selectedCategory]);

  // Delete Ingredient
  const handleDelete = async (id) => {
    if (window.confirm("คุณแน่ใจว่าต้องการลบวัตถุดิบนี้?")) {
      try {
        await axios.delete(`http://localhost:3002/api/ingredients/${id}`);
        alert("ลบวัตถุดิบสำเร็จ!");
        setIngredients(
          ingredients.filter((ingredient) => ingredient.ingredient_id !== id)
        );
      } catch (error) {
        console.error("Error deleting ingredient:", error);
        alert("เกิดข้อผิดพลาดในการลบวัตถุดิบ");
      }
    }
  };

  // Edit Ingredient
  const handleEdit = (ingredient) => {
    navigate(`/edit-ingredient/${ingredient.ingredient_id}`);
  };

  return (
    <div className="Inventory-container">
      <Navbar />
      <Sidebar />
      <div className="Inventory-content">
        <h1>จัดการคลังวัตถุดิบ</h1>

        {/* ปุ่มเพิ่มวัตถุดิบ */}
        <div className="Inventory-actions">
          <button onClick={() => navigate("/Addinventory")} className="add-btn">
            เพิ่มวัตถุดิบ
          </button>
        </div>

        {/* Search and Filter */}
        <div className="Inventory-filters">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">ทุกหมวดหมู่</option>
            {categories.map((category) => (
              <option key={category.category_id} value={category.category_name}>
                {category.category_name}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="ค้นหาวัตถุดิบ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button onClick={() => setSearchTerm("")}>ล้างตัวกรอง</button>
        </div>

        {/* Inventory Table */}
        <table className="Inventory-table">
          <thead>
            <tr>
              <th>รหัสวัตถุดิบ</th>
              <th>ชื่อวัตถุดิบ</th>
              <th>หมวดหมู่</th>
              <th>จำนวน</th>
              <th>จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {ingredients.map((ingredient, index) => {
              const itemNumber = (currentPage - 1) * 10 + index + 1;
              let displayQuantity = ingredient.quantity;
              let unit = "kg";

              if (ingredient.quantity <= 0.999) {
                displayQuantity = ingredient.quantity * 1000;
                unit = "g (กรัม)";
              }

              return (
                <tr key={ingredient.ingredient_id}>
                  <td>{itemNumber}</td>
                  <td>{ingredient.ingredient_name}</td>
                  <td>{ingredient.category_name || "ไม่ระบุหมวดหมู่"}</td>
                  <td>
                    {displayQuantity} {unit}
                  </td>
                  <td>
                    <button
                      className="edit-btn"
                      onClick={() => handleEdit(ingredient)}
                    >
                      แก้ไข
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(ingredient.ingredient_id)}
                    >
                      ลบ
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="pagination">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <MdArrowBackIos />
          </button>
          <span>
            {totalPages > 1 ? `${currentPage} / ${totalPages}` : "1 / 1"}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
          >
            <MdArrowForwardIos />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Inventory;
