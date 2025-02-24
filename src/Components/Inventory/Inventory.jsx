import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../Api/axios";
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
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // 📌 ดึงข้อมูลวัตถุดิบจาก API (พร้อม Pagination และ Filtering)
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log("📢 Fetching ingredients with filters:", {
          searchTerm,
          category: selectedCategory,
          page: currentPage,
        });

        const response = await axios.get(`/api/materials`, {
          params: {
            search: searchTerm || undefined,
            category: selectedCategory || undefined,
            page: currentPage,
            limit: 10,
          },
        });

        if (response.data && Array.isArray(response.data.results)) {
          setIngredients(response.data.results);
          setTotalPages(response.data.totalPages || 1);
        } else {
          setIngredients([]);
          setTotalPages(1);
        }

        console.log("✅ Fetched ingredients:", response.data.results);
      } catch (error) {
        setError(error.response?.data?.message || "เกิดข้อผิดพลาดในการโหลดข้อมูล");
        console.error("❌ Error fetching ingredients:", error.response?.data || error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [searchTerm, selectedCategory, currentPage]);

  // 📌 ดึงข้อมูลหมวดหมู่
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`/api/categories`);
        setCategories(res.data || []);
      } catch (error) {
        console.error("❌ Error fetching categories:", error.response?.data || error.message);
      }
    };
    fetchCategories();
  }, []);

  // 📌 เปลี่ยนหน้าของ Pagination
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // 📌 รีเซ็ต Pagination เมื่อเปลี่ยนการค้นหา
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory]);

  // 📌 ลบวัตถุดิบ
  const handleDelete = async (id) => {
    if (window.confirm("คุณแน่ใจว่าต้องการลบวัตถุดิบนี้?")) {
      try {
        await axios.delete(`/api/materials/${id}`);
        setIngredients((prev) => prev.filter((ingredient) => ingredient.material_id !== id));
        alert("ลบวัตถุดิบสำเร็จ!");
      } catch (error) {
        console.error("❌ Error deleting ingredient:", error.response?.data || error.message);
        alert("เกิดข้อผิดพลาดในการลบวัตถุดิบ");
      }
    }
  };

  // 📌 แก้ไขวัตถุดิบ
  const handleEdit = (ingredient) => {
    navigate(`/edit-ingredient/${ingredient.material_id}`);
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
                  return (
                    <tr key={ingredient.material_id}>
                      <td>{itemNumber}</td>
                      <td>{ingredient.material_name}</td>
                      <td>{ingredient.category_name || "ไม่ระบุหมวดหมู่"}</td>
                      <td>{ingredient.stock} g</td>
                      <td>
                        <button className="edit-btn" onClick={() => handleEdit(ingredient)}>แก้ไข</button>
                        <button className="delete-btn" onClick={() => handleDelete(ingredient.material_id)}>ลบ</button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center" }}>ไม่มีข้อมูล</td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        <div className="pagination">
          <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1 || loading}>
            <MdArrowBackIos />
          </button>
          <span>{currentPage} / {totalPages}</span>
          <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages || loading}>
            <MdArrowForwardIos />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Inventory;
