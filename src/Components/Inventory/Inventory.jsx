import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../Layout/Navbar/Navbar";
import Sidebar from "../Layout/Sidebar/Sidebar";
import { MdArrowBackIos, MdArrowForwardIos } from "react-icons/md";
import "./Inventory.scss";

const Inventory = () => {
  const [ingredients, setIngredients] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // ✅ ดึงข้อมูลจาก API (ใช้ useCallback เพื่อเพิ่มประสิทธิภาพ)
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: ingredientsRes } = await axios.get(
        "http://119.59.101.35:5000/ingredients",
        {
          params: {
            page: currentPage,
            limit: 10,
            searchTerm: searchTerm || "",
            category: selectedCategory || "",
          },
        }
      );

      const { data: categoriesRes } = await axios.get(
        "http://119.59.101.35:5000/categories"
      );

      setIngredients(ingredientsRes.results || []);
      setCategories(categoriesRes || []);
      setTotalPages(ingredientsRes.totalPages || 1);
    } catch (error) {
      console.error("❌ Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, selectedCategory]);

  // ✅ โหลดข้อมูลใหม่เมื่อ state เปลี่ยน
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ✅ รีเซ็ตหน้าเป็น 1 เมื่อเปลี่ยนตัวกรอง
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory]);

  // ✅ จัดการเปลี่ยนหน้า
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // ✅ ฟังก์ชันลบวัตถุดิบ
  const handleDelete = async (id) => {
    if (window.confirm("คุณแน่ใจว่าต้องการลบวัตถุดิบนี้?")) {
      try {
        await axios.delete(`http://119.59.101.35:5000/ingredients/${id}`);
        alert("✅ ลบวัตถุดิบสำเร็จ!");
        fetchData(); // โหลดข้อมูลใหม่
      } catch (error) {
        console.error("❌ Error deleting ingredient:", error);
        alert("เกิดข้อผิดพลาดในการลบวัตถุดิบ");
      }
    }
  };

  // ✅ ฟังก์ชันแก้ไขวัตถุดิบ
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

        {/* ตัวกรองและช่องค้นหา */}
        <div className="Inventory-filters">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">ทุกหมวดหมู่</option>
            {categories.map((category) => (
              <option key={category.category_id} value={category.category_id}>
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

        {/* ตารางวัตถุดิบ */}
        {loading ? (
          <p>กำลังโหลดข้อมูล...</p>
        ) : (
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
              {ingredients.length > 0 ? (
                ingredients.map((ingredient, index) => {
                  const itemNumber = (currentPage - 1) * 10 + index + 1;
                  let displayQuantity = ingredient.quantity;
                  let unit = "g"; // ใช้หน่วยเป็นกรัมเสมอ

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
                })
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center" }}>
                    ไม่มีข้อมูล
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        <div className="pagination">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || loading}
          >
            <MdArrowBackIos />
          </button>
          <span>
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages || loading}
          >
            <MdArrowForwardIos />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Inventory;
