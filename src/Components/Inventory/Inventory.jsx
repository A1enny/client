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
  const [activeTab, setActiveTab] = useState("normal");
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
  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: 10,  // ✅ จำกัดผลลัพธ์ที่ 10 รายการ
        search: searchTerm || undefined,
        category: selectedCategory || undefined,
      };

      let response;
      if (activeTab === "batches") {
        response = await axios.get("/api/inventory", { params });
      } else {
        response = await axios.get("/api/materials", { params });
      }

      console.log(`📌 API Response (${activeTab}):`, response.data);

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

      // ✅ ตัดผลลัพธ์ที่แสดงผลให้ไม่เกิน 10 รายการ
      setData(materials.slice(0, 10));

      // ✅ ตรวจสอบและตั้งค่า totalPages ให้ถูกต้อง
      setTotalPages(Math.max(1, Math.ceil((response.data.total || materials.length) / 10)));

    } catch (error) {
      console.error(`❌ Error fetching data (${activeTab}):`, error);
      setData([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
};


  // 🔄 เรียกใช้งาน fetchData ทุกครั้งที่ activeTab, searchTerm, selectedCategory, หรือ currentPage เปลี่ยน
  useEffect(() => {
    fetchData();
  }, [activeTab, searchTerm, selectedCategory, currentPage]);

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

  const [batchDetails, setBatchDetails] = useState([]);
  const [batchModalOpen, setBatchModalOpen] = useState(false);

  const handleViewBatch = async (batch) => {
    try {
      const response = await axios.get(`/api/inventory/${batch.batch_id}`);

      if (
        !response.data ||
        !Array.isArray(response.data.results) ||
        response.data.results.length === 0
      ) {
        throw new Error("❌ ไม่พบข้อมูลล็อต");
      }

      console.log("📌 Batch Details:", response.data.results);
      setBatchDetails([...response.data.results]); // ✅ ป้องกัน State ไม่อัปเดต
      setBatchModalOpen(true);
    } catch (error) {
      console.error("❌ Error fetching batch details:", error);
      Swal.fire("❌ ไม่สามารถโหลดข้อมูลล็อต", "กรุณาลองใหม่อีกครั้ง", "error");
      setBatchDetails([]); // ป้องกัน error จอขาว
    }
  };

  // ✅ ฟังก์ชันเปิด/ปิด Modal แก้ไขวัตถุดิบ
  const handleEditIngredient = (ingredient) => {
    console.log("📢 กำลังแก้ไขวัตถุดิบ:", ingredient);
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
      await axios.delete(`/api/materials/${id}`);
      Swal.fire("✅ ลบสำเร็จ!", "วัตถุดิบถูกลบออกจากระบบ", "success");

      setData((prev) => prev.filter((item) => item.material_id !== id));
    } catch (error) {
      console.error("❌ Error deleting:", error);
      Swal.fire(
        "❌ ลบไม่สำเร็จ",
        error.response?.data?.error || "เกิดข้อผิดพลาด",
        "error"
      );
    }
  };

  const handleDeleteBatch = async (batchId) => {
    if (!batchId) {
      console.error("❌ Batch ID is undefined!");
      Swal.fire("❌ ลบไม่สำเร็จ", "ID ของล็อตไม่ถูกต้อง", "error");
      return;
    }

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
      await axios.delete(`/api/inventory/${batchId}`);
      Swal.fire("✅ ลบสำเร็จ!", "ล็อตวัตถุดิบถูกลบออกจากระบบ", "success");

      setData((prev) => prev.filter((item) => item.batch_id !== batchId));
    } catch (error) {
      console.error("❌ Error deleting batch:", error);
      Swal.fire(
        "❌ ลบไม่สำเร็จ",
        error.response?.data?.error || "เกิดข้อผิดพลาด",
        "error"
      );
    }
  };

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
            ❌ ล้างตัวกรอง
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
              onEditIngredient={handleEditIngredient}
              onDeleteIngredient={handleDeleteIngredient}
              onDeleteBatch={handleDeleteBatch}
              onViewBatch={
                activeTab === "batches" ? handleViewBatch : undefined
              } // ✅ ส่งเฉพาะหน้าล็อต
            />

            <div className="pagination">
              <button className="prev"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
              ◀️
              </button>
              <span>
                หน้าที่ {currentPage} จาก {totalPages}
              </span>
              <button className="next"
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
            <table>
              <thead>
                <tr>
                  <th>📑 รหัสวัตถุดิบ</th>
                  <th>📌 ชื่อวัตถุดิบ</th>
                  <th>💰 ราคา</th>
                  <th>📅 วันที่รับเข้า</th>
                  <th>⏳ วันหมดอายุ</th>
                  <th>⚙️ จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(batchDetails) && batchDetails.length > 0 ? (
                  batchDetails.map((item, index) => (
                    <tr key={`${item.batch_id}-${index}`}>
                      {" "}
                      {/* ✅ ป้องกัน key ซ้ำ */}
                      <td>{item.material_id}</td>
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
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="5"
                      style={{ textAlign: "center", color: "gray" }}
                    >
                      ❌ ไม่มีข้อมูลล็อต
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
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
