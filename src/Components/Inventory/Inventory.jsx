import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../Api/axios";
import Swal from "sweetalert2";
import Navbar from "../Layout/Navbar/Navbar";
import Sidebar from "../Layout/Sidebar/Sidebar";
import "./Inventory.scss";
import EditIngredientModal from "./Edit/EditIngredientModal";
import InventoryTable from "./InventoryTable";

const Inventory = () => {
  const [activeTab, setActiveTab] = useState("normal"); // ค่าเริ่มต้นเป็นคลังวัตถุดิบ
  const [data, setData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState(null);
  const navigate = useNavigate();

  // ✅ ฟังก์ชันดึงข้อมูลวัตถุดิบ
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let response;
        const params = {
          page: currentPage,
          limit: 10,
          search: searchTerm || undefined,
          category: selectedCategory || undefined,
        };
  
        response = await axios.get("/api/materials", { params });
  
        console.log("📌 API Response:", response.data); // ✅ ตรวจสอบข้อมูลที่ได้จาก API
  
        setData(response.data.results || []);
        setTotalPages(response.data.totalPages || 1);
      } catch (error) {
        console.error("❌ Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, [searchTerm, selectedCategory, currentPage]);
  
  useEffect(() => {
    console.log("🔍 ตรวจสอบข้อมูลที่ใช้แสดงผล: ", data);
  }, [data]);
  

  // ✅ ฟังก์ชันดึงหมวดหมู่วัตถุดิบ
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get("/api/categories");
        setCategories(res.data || []);
      } catch (error) {
        console.error("❌ Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  // ✅ ฟังก์ชันเปิด/ปิด Modal แก้ไขวัตถุดิบ
  const handleEditIngredient = (ingredient) => {
    setSelectedIngredient(ingredient);
    setEditModalOpen(true);
  };

  const handleDeleteIngredient = async (id) => {
    if (!id) {
      console.error("❌ ID is undefined!");
      Swal.fire("❌ ลบไม่สำเร็จ", "ID ของวัตถุดิบไม่ถูกต้อง", "error");
      return;
    }
  
    const confirm = await Swal.fire({
      title: "⚠ ลบวัตถุดิบ?",
      text: "การลบนี้จะไม่สามารถกู้คืนได้ คุณต้องการดำเนินการต่อหรือไม่?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "ลบ",
      cancelButtonText: "ยกเลิก",
    });
  
    if (!confirm.isConfirmed) return;
  
    try {
      // ✅ ลบวัตถุดิบโดยตรง
      await axios.delete(`/api/materials/${id}`);
      Swal.fire("✅ ลบสำเร็จ!", "วัตถุดิบถูกลบออกจากระบบ", "success");
  
      // 🔄 อัปเดต state
      setData((prev) => prev.filter((item) => item.material_id !== id));
    } catch (error) {
      console.error("❌ Error deleting:", error);
      Swal.fire("❌ ลบไม่สำเร็จ", error.response?.data?.error || "เกิดข้อผิดพลาด", "error");
    }
  };  
  
  return (
    <div className="Inventory-container">
      <Navbar />
      <Sidebar />
      <div className="Inventory-content">
        <div className="Header">
          <h1>จัดการคลังวัตถุดิบ</h1>
          <button
            className="add-button"
            onClick={() => navigate("/AddInventory")}
          >
            + เพิ่มวัตถุดิบ
          </button>
        </div>
        {/* ตัวกรอง */}
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
          <button
            onClick={() => {
              setSearchTerm("");
              setSelectedCategory("");
            }}
          >
            ล้างตัวกรอง
          </button>
        </div>
        {/* ปุ่มเลือกหมวดหมู่ */}
        <div className="tab-navigation">
          {["normal", "expired", "batches"].map((tab) => (
            <button
              key={tab}
              className={activeTab === tab ? "active" : ""}
              onClick={() => setActiveTab(tab)}
            >
              {tab === "normal"
                ? "คลังวัตถุดิบ"
                : tab === "expired"
                ? "คลังวัตถุดิบหมดอายุ"
                : "ล็อตวัตถุดิบ"}
            </button>
          ))}
        </div>
        {/* แสดงข้อมูล */}
        {loading ? (
          <div className="loading-container">
            <p>🔄 กำลังโหลดข้อมูล...</p>
          </div>
        ) : data.length > 0 ? (
          <InventoryTable
            activeTab={activeTab}
            data={data}
            onEditIngredient={handleEditIngredient}
            onDeleteIngredient={handleDeleteIngredient}
          />
        ) : (
          <div className="no-data">
            <p>❌ ไม่มีข้อมูล</p>
          </div>
        )}
        {editModalOpen && selectedIngredient && (
          <EditIngredientModal
            ingredient={selectedIngredient}
            onClose={() => setEditModalOpen(false)}
          />
        )}
      </div>
    </div>
  );
};

export default Inventory;
