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

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

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
      Swal.fire("❌ โหลดข้อมูลไม่สำเร็จ", error.message, "error");
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
        Swal.fire("❌ โหลดหมวดหมู่ไม่สำเร็จ", error.message, "error");
      }
    };
    fetchCategories();
  }, []);

  const handleEditIngredient = (ingredient) => {
    setSelectedIngredient(ingredient);
    setEditModalOpen(true);
  };

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
      fetchData();
    } catch (error) {
      Swal.fire("❌ ลบไม่สำเร็จ", error.message, "error");
    }
  };

  const handleViewBatch = async (batch) => {
    try {
      const response = await axios.get(`${API_URL}/api/inventory/${batch.batch_id}`);
      const batchDetails = response.data.results.map((item, index) => ({
        ...item,
        rowNumber: (currentPage - 1) * 10 + (index + 1),
      }));

      setBatchDetails(batchDetails);
      setBatchModalOpen(true);
    } catch (error) {
      Swal.fire("❌ ไม่สามารถโหลดข้อมูลล็อต", error.message, "error");
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
          <button className="add-button" onClick={() => navigate("/AddInventory")}>
            + เพิ่มวัตถุดิบ
          </button>
        </div>
        {loading ? (
          <p className="loading-text">⏳ กำลังโหลดข้อมูล...</p>
        ) : (
          <InventoryTable data={data} onEdit={handleEditIngredient} onDelete={handleDeleteIngredient} />
        )}
      </div>
    </div>
  );
};

export default Inventory;
