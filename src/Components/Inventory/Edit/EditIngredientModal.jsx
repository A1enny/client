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

  // ✅ โหลดหมวดหมู่
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get("/api/categories");
        setCategories(res.data || []);
      } catch (error) {
        console.error(
          "❌ Error fetching categories:",
          error.response?.data || error.message
        );
      }
    };

    fetchCategories();
  }, []);

  // ✅ โหลดข้อมูลวัตถุดิบจาก API เมื่อ `material` เปลี่ยนแปลง
  useEffect(() => {
    const fetchMaterial = async () => {
      if (!material?.material_id) return; // ตรวจสอบว่า material_id มีค่าหรือไม่

      try {
        setLoading(true);
        const response = await axios.get(
          `/api/materials/${material.material_id}`
        );

        console.log("📌 ข้อมูลวัตถุดิบที่โหลดได้:", response.data); // ✅ Debug

        if (response.data.success) {
          const data = response.data.material;
          setFormData({
            material_id: data.material_id || "",
            material_name: data.material_name || "",
            category_id: data.category_id ? String(data.category_id) : "", // ✅ แปลงเป็น string
            stock: data.stock !== null ? parseFloat(data.stock) : 0, // ✅ ป้องกันค่า null
            min_stock: data.min_stock !== null ? parseFloat(data.min_stock) : 0, // ✅ ป้องกันค่า null
            received_date: data.received_date
              ? data.received_date.split("T")[0]
              : "", // ✅ แปลงวันที่
            expiration_date: data.expiration_date
              ? data.expiration_date.split("T")[0]
              : "", // ✅ แปลงวันที่
          });
        }
      } catch (error) {
        console.error("❌ Error fetching material:", error);
        Swal.fire(
          "❌ โหลดข้อมูลไม่สำเร็จ",
          "ไม่สามารถโหลดข้อมูลวัตถุดิบ",
          "error"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchMaterial();
  }, [material]); // ✅ ตรวจสอบเมื่อ material เปลี่ยน

  // ✅ จัดการการเปลี่ยนค่าในฟอร์ม
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (["stock", "min_stock"].includes(name)) {
      if (value === "") {
        setFormData((prev) => ({ ...prev, [name]: "" })); // ✅ อนุญาตให้ input เป็นค่าว่างได้
      } else {
        const newValue = parseFloat(value);
        if (!isNaN(newValue) && newValue >= 0) {
          setFormData((prev) => ({ ...prev, [name]: newValue }));
        }
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // ✅ ฟังก์ชันบันทึกข้อมูล
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.material_id ||
      !formData.material_name.trim() ||
      !formData.category_id ||
      parseFloat(formData.stock) <= 0
    ) {
      Swal.fire(
        "⚠ กรุณากรอกข้อมูลให้ครบ",
        "ชื่อวัตถุดิบต้องไม่ว่าง, เลือกหมวดหมู่ และจำนวนต้องมากกว่า 0",
        "warning"
      );
      return;
    }

    try {
      setLoading(true);
      const response = await axios.put(
        `/api/materials/${formData.material_id}`,
        {
          name: formData.material_name.trim(),
          category_id: formData.category_id,
          stock: parseFloat(formData.stock),
          min_stock: parseFloat(formData.min_stock),
          received_date: formData.received_date || null,
          expiration_date: formData.expiration_date || null,
        }
      );

      if (response.data.success) {
        Swal.fire("✅ อัปเดตสำเร็จ!", response.data.message, "success");
        if (onSave) onSave();
        if (onClose) onClose();
      } else {
        throw new Error(response.data.error || "❌ อัปเดตล้มเหลว");
      }
    } catch (error) {
      console.error("❌ Error updating material:", error);
      Swal.fire(
        "❌ อัปเดตล้มเหลว",
        error.response?.data?.message || "เกิดข้อผิดพลาดในการอัปเดตวัตถุดิบ",
        "error"
      );
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
            <select
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              required
            >
              <option value="">เลือกหมวดหมู่</option>
              {categories.map((category) => (
                <option
                  key={category.category_id}
                  value={String(category.category_id)}
                >
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

          <div className="form-group">
            <label>จำนวนต่ำสุด (g):</label>
            <input
              type="number"
              name="min_stock"
              value={formData.min_stock}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>วันที่รับเข้า:</label>
            <input
              type="date"
              name="received_date"
              value={formData.received_date || ""}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>วันหมดอายุ:</label>
            <input
              type="date"
              name="expiration_date"
              value={formData.expiration_date || ""}
              onChange={handleChange}
            />
          </div>

          <div className="modal-actions">
            <button type="submit" className="save-btn" disabled={loading}>
              {loading ? "กำลังบันทึก..." : "บันทึก"}
            </button>
            <button
              type="button"
              className="cancel-btn"
              onClick={onClose}
              disabled={loading}
            >
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
    min_stock: PropTypes.number,
    received_date: PropTypes.string,
    expiration_date: PropTypes.string,
  }),
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default EditIngredientModal;
