import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import axios from "../../../Api/axios";
import Swal from "sweetalert2";
import "./EditIngredientModal.scss";

const EditIngredientModal = ({ material, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    material_id: "",
    material_name: "",
    category_id: "",
    stock: "",
    min_stock: "",
    received_date: "",
    expiration_date: "",
  });

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ โหลดหมวดหมู่เมื่อเปิด Modal
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

  // ✅ โหลดข้อมูลวัตถุดิบเมื่อเปิด Modal และตั้งค่า formData
  useEffect(() => {
    if (!material?.material_id) return;

    const fetchMaterial = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/materials/${material.material_id}`);

        if (response.data.success && response.data.material) {
          const data = response.data.material;
          console.log("📌 ข้อมูลวัตถุดิบที่โหลดได้:", data);

          setFormData({
            material_id: data.material_id || "",
            material_name: data.material_name || "",
            category_id: data.category_id ? String(data.category_id) : "",
            stock: data.total_quantity ? parseFloat(data.total_quantity) : 0,
            min_stock: data.min_stock ? parseFloat(data.min_stock) : 0,
            received_date: data.received_date ? data.received_date.split("T")[0] : "",
            expiration_date: data.expiration_date ? data.expiration_date.split("T")[0] : "",
          });
        } else {
          throw new Error("❌ ไม่พบข้อมูลวัตถุดิบ");
        }
      } catch (error) {
        console.error("❌ Error fetching material:", error);
        Swal.fire("❌ โหลดข้อมูลไม่สำเร็จ", "ไม่สามารถโหลดข้อมูลวัตถุดิบ", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchMaterial();
  }, [material]);

  // ✅ ตรวจสอบเมื่อ `formData` อัปเดต
  useEffect(() => {
    console.log("✅ formData อัปเดตแล้ว:", formData);
  }, [formData]);

  // ✅ จัดการการเปลี่ยนค่าในฟอร์ม
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: ["stock", "min_stock"].includes(name) ? (value ? parseFloat(value) : "") : value,
    }));
  };

  // ✅ ส่งข้อมูลไปอัปเดตเมื่อกด "บันทึก"
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      const response = await axios.put(`/api/materials/${formData.material_id}`, formData);

      if (response.data.success) {
        Swal.fire("✅ อัปเดตสำเร็จ", "ข้อมูลวัตถุดิบถูกอัปเดตแล้ว", "success");
        onSave(); // 🔄 แจ้ง parent component ให้โหลดข้อมูลใหม่
        onClose(); // ❌ ปิด Modal
      } else {
        throw new Error("❌ อัปเดตไม่สำเร็จ");
      }
    } catch (error) {
      console.error("❌ Error updating material:", error);
      Swal.fire("❌ อัปเดตไม่สำเร็จ", "ลองอีกครั้ง", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <h2>📝 แก้ไขวัตถุดิบ</h2>

        <form className="edit-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="material_name">ชื่อวัตถุดิบ:</label>
            <input
              type="text"
              name="material_name"
              value={formData.material_name || ""}
              onChange={handleChange}
              placeholder="กรอกชื่อวัตถุดิบ"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="category_id">หมวดหมู่:</label>
            <select id="category_id" name="category_id" value={formData.category_id} onChange={handleChange} required>
              <option value="">เลือกหมวดหมู่</option>
              {categories.map((category) => (
                <option key={category.category_id} value={String(category.category_id)}>
                  {category.category_name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="stock">จำนวนรวม (g):</label>
            <input type="number" id="stock" name="stock" value={formData.stock} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label htmlFor="received_date">📅 วันที่รับเข้า:</label>
            <input type="date" id="received_date" name="received_date" value={formData.received_date} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label htmlFor="expiration_date">⏳ วันหมดอายุ:</label>
            <input type="date" id="expiration_date" name="expiration_date" value={formData.expiration_date} onChange={handleChange} required />
          </div>

          <div className="modal-actions">
            <button type="submit" className="save-btn" disabled={loading}>
              {loading ? "🔄 กำลังบันทึก..." : "✅ บันทึก"}
            </button>
            <button type="button" className="cancel-btn" onClick={onClose} disabled={loading}>
              ❌ ยกเลิก
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

EditIngredientModal.propTypes = {
  material: PropTypes.shape({
    material_id: PropTypes.number.isRequired,
    material_name: PropTypes.string.isRequired,
    category_id: PropTypes.number.isRequired,
    total_quantity: PropTypes.number.isRequired,
    min_stock: PropTypes.number,
    received_date: PropTypes.string,
    expiration_date: PropTypes.string,
  }),
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default EditIngredientModal;
