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
  });

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // โหลดหมวดหมู่วัตถุดิบ
    const fetchCategories = async () => {
      try {
        const res = await axios.get("/api/categories");
        setCategories(res.data || []);
      } catch (error) {
        console.error("❌ Error fetching categories:", error.response?.data || error.message);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    if (material) {
      setFormData({
        material_id: material.material_id || "",
        material_name: material.material_name || "",
        category_id: material.category_id || "",
        stock: material.stock || "",
      });
    }
  }, [material]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // ป้องกันค่าติดลบใน stock
    if (name === "stock" && parseFloat(value) < 0) return;

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.material_name.trim() || !formData.category_id || parseFloat(formData.stock) <= 0) {
      Swal.fire("⚠ กรุณากรอกข้อมูลให้ถูกต้อง", "ชื่อวัตถุดิบต้องไม่ว่าง, เลือกหมวดหมู่ และจำนวนต้องมากกว่า 0", "warning");
      return;
    }

    try {
      setLoading(true);
      await axios.put(`/api/materials/${formData.material_id}`, {
        name: formData.material_name.trim(),
        category_id: formData.category_id,
        stock: parseFloat(formData.stock), // แปลงค่าให้แน่ใจว่าเป็นตัวเลข
      });

      Swal.fire("✅ อัปเดตสำเร็จ!", "ข้อมูลวัตถุดิบถูกอัปเดตเรียบร้อย", "success");

      if (onSave) onSave(); // ตรวจสอบว่ามีฟังก์ชันนี้จริงหรือไม่
      if (onClose) onClose();
    } catch (error) {
      console.error("❌ Error updating material:", error);
      Swal.fire("❌ อัปเดตล้มเหลว", error.response?.data?.message || "เกิดข้อผิดพลาดในการอัปเดตวัตถุดิบ", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <h2>แก้ไขวัตถุดิบ</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>ชื่อวัตถุดิบ:</label>
            <input
              type="text"
              name="material_name"
              value={formData.material_name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>หมวดหมู่:</label>
            <select name="category_id" value={formData.category_id} onChange={handleChange} required>
              <option value="">เลือกหมวดหมู่</option>
              {categories.map((category) => (
                <option key={category.category_id} value={category.category_id}>
                  {category.category_name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>จำนวนรวม (g):</label>
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              required
            />
          </div>

          <div className="modal-actions">
            <button type="submit" className="save-btn" disabled={loading}>
              {loading ? "กำลังบันทึก..." : "บันทึก"}
            </button>
            <button type="button" className="cancel-btn" onClick={onClose} disabled={loading}>
              ยกเลิก
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
    stock: PropTypes.number.isRequired,
  }),
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default EditIngredientModal;
