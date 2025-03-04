import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../../Api/axios";
import Swal from "sweetalert2";
import Navbar from "../../Layout/Navbar/Navbar";
import Sidebar from "../../Layout/Sidebar/Sidebar";
import "./AddInventory.scss";

const AddInventory = () => {
  const [ingredientName, setIngredientName] = useState("");
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState("");
  const [unitId, setUnitId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [receivedDate, setReceivedDate] = useState("");
  const [expirationDate, setExpirationDate] = useState("");
  const [shelfLifeDays, setShelfLifeDays] = useState(null);
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState("");
  const [batchData, setBatchData] = useState([]);  // ✅ แก้ปัญหา `setBatchData is not defined`
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get("/api/categories");
        setCategories(res.data || []);
      } catch (error) {
        console.error("❌ ไม่สามารถโหลดหมวดหมู่:", error);
      }
    };

    const fetchBatches = async () => {
      try {
        const res = await axios.get("/api/inventory");
        setBatches(res.data.results || []);
      } catch (error) {
        console.error("❌ ไม่สามารถโหลดล็อตวัตถุดิบ:", error);
      }
    };

    fetchCategories();
    fetchBatches();
  }, []);

  useEffect(() => {
    const fetchShelfLife = async () => {
      if (!categoryId) return;
      try {
        const res = await axios.get(`/api/shelf_life/${categoryId}`);
        setShelfLifeDays(res.data.shelf_life_days || null);
      } catch (error) {
        console.error("❌ ไม่สามารถโหลด shelf-life:", error);
      }
    };

    fetchShelfLife();
  }, [categoryId]);

  useEffect(() => {
    if (selectedBatch) {
      fetchBatchDetails(selectedBatch);
    }
  }, [selectedBatch]);

  const handleReceivedDateChange = (date) => {
    setReceivedDate(date);
    if (!expirationDate && shelfLifeDays) {
      const expDate = new Date(date);
      expDate.setDate(expDate.getDate() + shelfLifeDays);
      setExpirationDate(expDate.toISOString().split("T")[0]);
    }
  };

  const handleAddIngredient = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    // ✅ ตรวจสอบว่ามีค่าครบ
    if (!ingredientName || !categoryId || quantity <= 0 || price < 0) {
      Swal.fire("❌ กรุณากรอกข้อมูลให้ครบถ้วน");
      setLoading(false);
      return;
    }
  
    try {
      const response = await axios.post("/api/inventory", {
        name: ingredientName,
        category_id: categoryId,
        unit_id: 1,  // ✅ บังคับเป็น 1 หากไม่มีค่า
        quantity: parseFloat(quantity),
        received_date: receivedDate,
        expiration_date: expirationDate || null,
        price: parseFloat(price),
        batch_id: selectedBatch || null,
      });
  
      console.log("✅ API Response:", response.data);
  
      Swal.fire({
        icon: "success",
        title: response.data.message,
        showConfirmButton: false,
        timer: 1500,
      });
  
      if (response.data.batch_id) {
        setSelectedBatch(response.data.batch_id);
        fetchBatchDetails(response.data.batch_id);
      }
  
    } catch (error) {
      console.error("❌ API Error:", error);
      Swal.fire("❌ เกิดข้อผิดพลาด", "ไม่สามารถเพิ่มวัตถุดิบได้", "error");
    } finally {
      setLoading(false);
    }
  };
  
  const fetchBatchDetails = async (batchId) => {
    try {
      const response = await axios.get(`/api/inventory/${batchId}`);
      console.log("📌 API Response:", response.data);
      setBatchData(response.data.results || []);
    } catch (error) {
      console.error("❌ Error fetching batch details:", error);
    }
  };

  return (
    <div className="add-inventory-container">
      <Navbar />
      <Sidebar />
      <div className="add-inventory-content">
        <h2>➕ เพิ่มวัตถุดิบใหม่</h2>
        <form onSubmit={handleAddIngredient}>
          <div className="form-group">
            <label>📌 ชื่อวัตถุดิบ:</label>
            <input type="text" value={ingredientName} onChange={(e) => setIngredientName(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>📂 หมวดหมู่:</label>
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required>
              <option value="">เลือกหมวดหมู่</option>
              {categories.map((category) => (
                <option key={category.category_id} value={category.category_id}>{category.category_name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>🔖 เลือกล็อต (ถ้าไม่มี ระบบจะสร้างใหม่):</label>
            <select value={selectedBatch} onChange={(e) => setSelectedBatch(e.target.value)}>
              <option value="">สร้างล็อตใหม่</option>
              {batches.map((batch) => (
                <option key={batch.batch_id} value={batch.batch_id}>{batch.material_name} (ล็อต {batch.batch_id})</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>📦 จำนวน (กรัม):</label>
            <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>💰 ราคา:</label>
            <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>📅 วันที่รับเข้า:</label>
            <input type="date" value={receivedDate} onChange={(e) => handleReceivedDateChange(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>⏳ วันหมดอายุ:</label>
            <input type="date" value={expirationDate} onChange={(e) => setExpirationDate(e.target.value)} />
          </div>
          <div className="button-group">
            <button type="submit" className="submit-btn" disabled={loading}>{loading ? "⏳ กำลังเพิ่ม..." : "✅ เพิ่มวัตถุดิบ"}</button>
            <button type="button" className="cancel-btn" onClick={() => navigate("/inventory")}>❌ ยกเลิก</button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default AddInventory;
