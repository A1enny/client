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
  const [activeTab, setActiveTab] = useState("batches"); // ค่าเริ่มต้นเป็นล็อตวัตถุดิบ
  const [ingredients, setIngredients] = useState([]);
  const [batches, setBatches] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let response;
        const params = {
          search: searchTerm,
          category: selectedCategory,
          page: currentPage,
          limit: 10,
        };

        if (activeTab === "batches") {
          await axios.get("/api/inventory-batches?page=" + currentPage + "&limit=10", { params });
          setBatches(response.data.results || []);
        } else if (activeTab === "expired") {
          response = await axios.get("/api/materials/expired", { params });
          setIngredients(response.data.results || []);
        } else {
          response = await axios.get("/api/materials", { params });
          setIngredients(response.data.results || []);
        }

        setTotalPages(response.data.totalPages || 1);
      } catch (error) {
        console.error("❌ Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab, searchTerm, selectedCategory, currentPage]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleEditIngredient = (ingredient) => {
    setSelectedIngredient(ingredient);
    setEditModalOpen(true);
  };

  const handleDelete = async (item) => {
    const id = activeTab === "batches" ? item.batch_id : item.material_id;
    const apiEndpoint =
      activeTab === "batches" ? "/api/inventory-batches" : "/api/materials";

    if (!id) {
      Swal.fire("❌ ลบไม่สำเร็จ", "ไม่พบรหัส", "error");
      return;
    }

    const confirm = await Swal.fire({
      title: `⚠ ลบข้อมูล?`,
      text: "คุณแน่ใจหรือไม่? การลบนี้จะไม่สามารถกู้คืนได้",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "ลบ",
      cancelButtonText: "ยกเลิก",
    });

    if (confirm.isConfirmed) {
      try {
        await axios.delete(`${apiEndpoint}/${id}`);
        Swal.fire("✅ ลบสำเร็จ!", "ข้อมูลถูกลบออกจากระบบ", "success");

        if (activeTab === "batches") {
          setBatches((prev) => prev.filter((b) => b.batch_id !== id));
        } else {
          setIngredients((prev) => prev.filter((i) => i.material_id !== id));
        }
      } catch (error) {
        Swal.fire("❌ ลบไม่สำเร็จ", "เกิดข้อผิดพลาด", "error");
      }
    }
  };

  const handleDetail = (item) => {
    const id = activeTab === "batches" ? item.batch_id : item.material_id;
    navigate(`/inventory/detail/${id}`);
  };

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
          {["batches", "normal", "expired"].map((tab) => (
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
          <p>กำลังโหลดข้อมูล...</p>
        ) : (
          <>
            <InventoryTable
              data={activeTab === "batches" ? batches : ingredients}
              type={activeTab}
              handleEdit={handleEditIngredient}
              handleDelete={handleDelete}
              handleDetail={handleDetail}
            />
            {/* Pagination */}
            <div className="pagination">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                {"<"} ก่อนหน้า
              </button>
              <span>
                หน้า {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                ถัดไป {">"}
              </button>
            </div>
          </>
        )}

        {/* Modal แก้ไขวัตถุดิบ */}
        {editModalOpen && (
          <EditIngredientModal
            ingredient={selectedIngredient}
            onClose={() => setEditModalOpen(false)}
          />
        )}
      </div>
      <div className="pagination">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          {"<"} ก่อนหน้า
        </button>
        <span>
          {" "}
          หน้า {currentPage} / {totalPages}{" "}
        </span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          ถัดไป {">"}
        </button>
      </div>
    </div>
  );
};

export default Inventory;
