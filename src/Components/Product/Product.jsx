import { useState, useEffect } from "react";
import "./Product.scss";
import Navbar from "../Layout/Navbar/Navbar";
import Sidebar from "../Layout/Sidebar/Sidebar";
import axios from "../../Api/axios";
import Swal from "sweetalert2";
import Select from "react-select";
import Modal from "react-modal";
import AddMenuModal from "./AddMenuModal";

Modal.setAppElement("#root");

const API_URL = import.meta.env.VITE_API_URL;

const Product = () => {
  const [menus, setMenus] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [editModalIsOpen, setEditModalIsOpen] = useState(false);

  const [menuData, setMenuData] = useState({
    recipe_id: null,
    menu_category_id: "",
    price: "",
  });

  const [editData, setEditData] = useState({
    menu_id: null,
    recipe_id: null,
    menu_category_id: "",
    price: "",
  });

  useEffect(() => {
    fetchMenus();
    fetchCategories();
    fetchRecipes();
  }, []);

  const fetchMenus = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/menus`);
      if (response.data.success && Array.isArray(response.data.results)) {
        // ใช้ข้อมูลที่ได้รับมาแสดงเมนู
        setMenus(response.data.results);
      } else {
        throw new Error("ข้อมูลเมนูไม่ถูกต้อง");
      }
    } catch (error) {
      console.error("❌ Error fetching menus:", error);
      Swal.fire("Error", "ไม่สามารถดึงข้อมูลเมนูได้", "error");
      setMenus([]);
    }
    setLoading(false);
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/menus/category`);
      if (response.data.success && Array.isArray(response.data.results)) {
        setCategoryOptions(
          response.data.results.map((cat) => ({
            value: cat.menu_category_id,
            label: cat.category_name,
          }))
        );
      } else {
        throw new Error("Invalid categories data");
      }
    } catch (error) {
      console.error("❌ Error fetching categories:", error);
      Swal.fire("Error", "ไม่สามารถดึงข้อมูลหมวดหมู่ได้", "error");
    }
  };

  const fetchRecipes = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/recipes`);
      if (Array.isArray(response.data)) {
        setRecipes(response.data);
      } else {
        throw new Error("Invalid recipes data");
      }
    } catch (error) {
      console.error("❌ Error fetching recipes:", error);
      Swal.fire("Error", "ไม่สามารถดึงข้อมูลสูตรอาหารได้", "error");
    }
  };

  const handleAddMenu = async () => {
    console.log("📌 Debug menuData:", menuData);
    if (!menuData.recipe_id || !menuData.menu_category_id || menuData.menu_category_id === "" || !menuData.price) {
      console.log("🚨 ข้อมูลไม่ครบ: ", menuData);
      Swal.fire("Error", "กรุณาเลือกสูตรอาหาร, หมวดหมู่ และกรอกราคา", "error");
      return;
    }

    const newMenu = {
      ...menuData,
      price: parseFloat(menuData.price),
    };

    try {
      await axios.post(`${API_URL}/api/menus`, newMenu);
      setModalIsOpen(false);
      fetchMenus();
      Swal.fire("สำเร็จ", "เพิ่มเมนูเรียบร้อย", "success");
    } catch (error) {
      console.error("❌ Error adding menu:", error.response?.data || error);
      Swal.fire("Error", "ไม่สามารถเพิ่มเมนูได้", "error");
    }
  };

  const openEditModal = (menu) => {
    setEditData({
      menu_id: menu.id,
      recipe_id: menu.recipe_id || null,
      menu_category_id: menu.menu_category_id || "",
      price: menu.price || "",
    });
    setEditModalIsOpen(true);
  };

  const handleEditMenu = async () => {
    if (!editData.menu_id) {
      Swal.fire("Error", "ไม่พบเมนูที่ต้องการแก้ไข", "error");
      return;
    }

    const updatedData = {
      price: parseFloat(editData.price),
      menu_category_id: editData.menu_category_id,
    };

    try {
      await axios.put(`${API_URL}/api/menus/${editData.menu_id}`, updatedData);
      setEditModalIsOpen(false);
      fetchMenus();
      Swal.fire("สำเร็จ", "แก้ไขเมนูเรียบร้อย!", "success");
    } catch (error) {
      console.error("❌ Error updating menu:", error.response?.data || error);
      Swal.fire("Error", "ไม่สามารถแก้ไขเมนูได้", "error");
    }
  };

  const handleDelete = async (menu_id) => {
    Swal.fire({
      title: "ยืนยันการลบ?",
      text: "คุณแน่ใจหรือไม่ว่าต้องการลบเมนูนี้?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "ลบ",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`${API_URL}/api/menus/${menu_id}`);
          fetchMenus();
          Swal.fire("ลบสำเร็จ!", "เมนูถูกลบออกจากระบบแล้ว", "success");
        } catch (error) {
          console.error("❌ Error deleting menu:", error);
          Swal.fire("Error", "ไม่สามารถลบเมนูได้", "error");
        }
      }
    });
  };

  return (
    <div className="product-container">
      <Navbar />
      <Sidebar />
      <div className="product-content">
        <h1 className="product-title">จัดการเมนูอาหาร</h1>
        <button className="btn btn-add-menu" onClick={() => setModalIsOpen(true)}>
          + เพิ่มเมนู
        </button>

        <AddMenuModal
        modalIsOpen={modalIsOpen}
        setModalIsOpen={setModalIsOpen}
        menuData={menuData}
        setMenuData={setMenuData}
        categoryOptions={categoryOptions}
        recipes={recipes}
        handleAddMenu={handleAddMenu}
      />
        <table className="product-table">
          <thead>
            <tr>
              <th>ลำดับ</th>
              <th>รูปภาพ</th>
              <th>ชื่อเมนู</th>
              <th>หมวดหมู่</th>
              <th>ราคา</th>
              <th>การดำเนินการ</th>
            </tr>
          </thead>
          <tbody>
            {menus.map((menu, index) => (
              <tr key={menu.id}>
                <td>{index + 1}</td>
                <td>
                  <img
                    src={menu.image || "/images/default.jpg"}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/images/default.jpg";
                    }}
                    alt={menu.name}
                    style={{
                      width: "50px",
                      height: "50px",
                      objectFit: "cover",
                    }}
                  />
                </td>
                <td>{menu.name}</td>
                <td>{menu.category_name || "ไม่ระบุหมวดหมู่"}</td>
                <td>{menu.price} บาท</td>
                <td>
                  <button className="btn btn-edit" onClick={() => openEditModal(menu)}>
                    แก้ไข
                  </button>
                  <button className="btn btn-delete" onClick={() => handleDelete(menu.id)}>
                    ลบ
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ✅ Modal แก้ไขเมนู */}
        <Modal
          className="modal-content"
          isOpen={editModalIsOpen}
          onRequestClose={() => setEditModalIsOpen(false)}
        >
          <h2 className="modal-title">แก้ไขเมนู</h2>

          <Select
            className="modal-select"
            options={categoryOptions}
            value={
              categoryOptions.find(
                (opt) => opt.value === editData.menu_category_id
              ) || ""
            }
            onChange={(e) =>
              setEditData((prev) => ({ ...prev, menu_category_id: e.value }))
            }
            placeholder="เลือกหมวดหมู่..."
          />

          <Select
            className="modal-select"
            options={
              recipes.length > 0
                ? recipes.map((r) => ({
                    value: r.recipe_id,
                    label: r.recipe_name,
                  }))
                : []
            }
            value={
              recipes.find((r) => r.recipe_id === editData.recipe_id) || ""
            }
            onChange={(e) =>
              setEditData((prev) => ({ ...prev, recipe_id: e.value }))
            }
            placeholder="เลือกสูตรอาหาร"
          />

          <input
            className="modal-input"
            type="number"
            value={editData.price || ""}
            onChange={(e) =>
              setEditData((prev) => ({ ...prev, price: e.target.value }))
            }
          />

          <button className="btn btn-save" onClick={handleEditMenu}>
            บันทึก
          </button>
        </Modal>
      </div>
    </div>
  );
};

export default Product;
