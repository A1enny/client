import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../Api/axios";
import Swal from "sweetalert2";
import Navbar from "../Layout/Navbar/Navbar";
import Sidebar from "../Layout/Sidebar/Sidebar";
import "./Inventory.scss";
import EditIngredientModal from "./Edit/EditIngredientModal";
import InventoryTable from "./InventoryTable";
import { IoMdClose } from "react-icons/io";

const API_URL = import.meta.env.VITE_API_URL;

const Inventory = () => {
  const [activeTab, setActiveTab] = useState("normal");
  const [batchDetails, setBatchDetails] = useState([]);
  const [batchModalOpen, setBatchModalOpen] = useState(false);
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

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: 10,
        search: searchTerm || undefined,
        category: selectedCategory || undefined,
      };

      let response;
      if (activeTab === "batches") {
        response = await axios.get(`${API_URL}/api/inventory`, { params });
      } else {
        response = await axios.get(`${API_URL}/api/materials`, { params });
      }

      let materials = response.data.results || [];

      if (activeTab === "expired") {
        const today = new Date();
        const next7Days = new Date();
        next7Days.setDate(today.getDate() + 7);

        materials = materials.filter((item) => {
          const expDate = new Date(item.expiration_date);
          return expDate < today || (expDate >= today && expDate <= next7Days);
        });
      }

      setData(materials.slice(0, 10));
      setTotalPages(
        Math.max(1, Math.ceil((response.data.total || materials.length) / 10))
      );
    } catch (error) {
      console.error(`❌ Error fetching data (${activeTab}):`, error);
      setData([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedCategory, currentPage, activeTab]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/categories`);
        setCategories(res.data || []);
      } catch (error) {
        console.error("❌ Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);
  // ✅ แก้ไขวัตถุดิบ
  const handleEditIngredient = (ingredient) => {
    setSelectedIngredient(ingredient);
    setEditModalOpen(true);
  };

  // ✅ ลบวัตถุดิบ
  const handleDeleteIngredient = async (id) => {
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
      await axios.delete(`${API_URL}/api/materials/${id}`);
      Swal.fire("✅ ลบสำเร็จ!", "วัตถุดิบถูกลบออกจากระบบ", "success");
      fetchData(); // อัปเดตข้อมูลใหม่
    } catch (error) {
      Swal.fire("❌ ลบไม่สำเร็จ", error.message, "error");
    }
  };

  // ✅ ลบล็อตวัตถุดิบ
  const handleDeleteBatch = async (batchId) => {
    const confirm = await Swal.fire({
      title: "⚠ ลบล็อตวัตถุดิบ?",
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
      await axios.delete(`${API_URL}/api/inventory/${batchId}`);
      Swal.fire("✅ ลบสำเร็จ!", "ล็อตวัตถุดิบถูกลบออกจากระบบ", "success");
      fetchData(); // อัปเดตข้อมูลใหม่
    } catch (error) {
      Swal.fire("❌ ลบไม่สำเร็จ", error.message, "error");
    }
  };

  // ✅ ดูรายละเอียดล็อต
  const handleViewBatch = async (batch, currentPage, itemsPerPage) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/inventory/${batch.batch_id}`
      );
      const batchDetails = response.data.results.map((item, index) => ({
        ...item,
        rowNumber: (currentPage - 1) * itemsPerPage + (index + 1),
      }));

      setBatchDetails(batchDetails);
      setBatchModalOpen(true);
    } catch (error) {
      Swal.fire("❌ ไม่สามารถโหลดข้อมูลล็อต", error.message, "error");
    }
  };

  // ✅ เปลี่ยนหน้า pagination
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
  };

  return (
    <div className="Inventory-container">
      <Navbar />
      <Sidebar />
      <div className="Inventory-content">
        <div className="Header">
          <h1>📦 จัดการคลังวัตถุดิบ</h1>
          <button
            className="add-button"
            onClick={() => navigate("/AddInventory")}
          >
            + เพิ่มวัตถุดิบ
          </button>
        </div>

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
            placeholder="🔍 ค้นหาวัตถุดิบ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            className="clear-filter-btn"
            onClick={() => {
              setSearchTerm("");
              setSelectedCategory("");
            }}
          >
            <IoMdClose /> ล้างตัวกรอง
          </button>
        </div>

        <div className="tab-navigation">
          {[
            { key: "batches", label: "🔖 ล็อตวัตถุดิบ" },
            { key: "normal", label: "📦 คลังวัตถุดิบ" },
            { key: "expired", label: "⚠️ คลังวัตถุดิบหมดอายุ" },
          ].map((tab) => (
            <button
              key={tab.key}
              className={activeTab === tab.key ? "active" : ""}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading-container">
            <p>🔄 กำลังโหลดข้อมูล...</p>
          </div>
        ) : data.length > 0 ? (
          <>
            <InventoryTable
              activeTab={activeTab}
              data={data}
              currentPage={currentPage} // ✅ ส่งค่าหน้าปัจจุบัน
              itemsPerPage={10} // ✅ กำหนดจำนวนรายการต่อหน้า
              onEditIngredient={handleEditIngredient}
              onDeleteIngredient={handleDeleteIngredient}
              onDeleteBatch={handleDeleteBatch}
              onViewBatch={
                activeTab === "batches" ? handleViewBatch : undefined
              }
            />

            <div className="pagination">
              <button
                className="prev"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                ◀️
              </button>
              <span>
                หน้าที่ {currentPage} จาก {totalPages}
              </span>
              <button
                className="next"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                ▶️
              </button>
            </div>
          </>
        ) : (
          <div className="no-data">
            <p>❌ ไม่พบข้อมูลในหมวดหมู่ที่เลือก</p>
          </div>
        )}

        {editModalOpen && selectedIngredient && (
          <EditIngredientModal
            ingredient={selectedIngredient}
            onClose={() => setEditModalOpen(false)}
          />
        )}
      </div>

      {batchModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>📦 รายละเอียดล็อต #{batchDetails[0]?.batch_id}</h2>

            {/* ✅ กำหนดขนาดของ Table และเพิ่ม Scrollbar */}
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>📑 รหัสวัตถุดิบ</th>
                    <th>📌 ชื่อวัตถุดิบ</th>
                    <th>💰 ราคา</th>
                    <th>📅 วันที่รับเข้า</th>
                    <th>⏳ วันหมดอายุ</th>
                  </tr>
                </thead>
                <tbody>
                  {batchDetails.map((item, index) => (
                    <tr key={index}>
                      <td>{item.rowNumber}</td>{" "}
                      {/* ✅ แสดงลำดับที่แทน batch_id */}
                      <td>{item.material_name}</td>
                      <td>
                        {item.price
                          ? `${parseFloat(item.price).toFixed(2)} ฿`
                          : "N/A"}
                      </td>
                      <td>
                        {item.received_date
                          ? new Date(item.received_date).toLocaleDateString(
                              "th-TH"
                            )
                          : "N/A"}
                      </td>
                      <td>
                        {item.expiration_date
                          ? new Date(item.expiration_date).toLocaleDateString(
                              "th-TH"
                            )
                          : "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button
              className="close-btn"
              onClick={() => setBatchModalOpen(false)}
            >
              ❌ ปิด
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
