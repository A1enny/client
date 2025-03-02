const API_URL = import.meta.env.VITE_API_URL;
import { useState, useEffect } from "react";
import "./Product.scss";
import Navbar from "../Layout/Navbar/Navbar";
import Sidebar from "../Layout/Sidebar/Sidebar";
import axios from "../../Api/axios";
import Swal from "sweetalert2";
import Select from "react-select";
import Modal from "react-modal";

const Product = () => {
  const [menus, setMenus] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [editModalIsOpen, setEditModalIsOpen] = useState(false);
  const [menuData, setMenuData] = useState({ recipe_id: null, price: "" });
  const [editData, setEditData] = useState({
    menu_id: null,
    recipe_id: null,
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
    console.log("📡 API Response (Menus):", response.data);

    // ตรวจสอบว่า response.data มีผลลัพธ์ที่ถูกต้อง
    if (response.data.success && Array.isArray(response.data.results)) {
      setMenus(response.data.results); // กำหนดค่า menus ที่ได้จาก API
    } else {
      throw new Error("ข้อมูลเมนูไม่ถูกต้อง");
    }
  } catch (error) {
    console.error("❌ Error fetching menus:", error);
    Swal.fire("Error", "ไม่สามารถดึงข้อมูลเมนูได้", "error");
    setMenus([]); // ตั้งค่า menus เป็น [] เมื่อมีข้อผิดพลาด
  }
  setLoading(false);
};

  const openEditModal = (menu) => {
    setEditData({
      menu_id: menu.id,
      recipe_id: menu.recipe_id || null, // ถ้าไม่มีค่า ให้เป็น null
      menu_category_id: menu.menu_category_id || null,
      price: menu.price || "",
    });
    setEditModalIsOpen(true);
  };

  const handleEditMenu = async () => {
    if (
      !editData.menu_id ||
      !editData.recipe_id ||
      !editData.menu_category_id ||
      !editData.price
    ) {
      Swal.fire("Error", "กรุณากรอกข้อมูลให้ครบถ้วน", "error");
      return;
    }

    try {
      await axios.put(`${API_URL}/api/menus/${editData.menu_id}`, {
        recipe_id: editData.recipe_id,
        menu_category_id: editData.menu_category_id,
        price: editData.price,
      });

      setEditModalIsOpen(false);
      fetchMenus(); // โหลดข้อมูลใหม่หลังแก้ไขสำเร็จ
      Swal.fire("สำเร็จ", "แก้ไขเมนูเรียบร้อย!", "success");
    } catch (error) {
      console.error("❌ Error updating menu:", error.response?.data || error);
      Swal.fire("Error", "ไม่สามารถแก้ไขเมนูได้", "error");
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/menus/category`);
      console.log("📡 API Response (Categories):", response.data);
  
      if (response.data.success && Array.isArray(response.data.results)) {
        setCategoryOptions(
          response.data.results.map((cat) => ({
            value: cat.menu_category_id,  // ใช้ menu_category_id เป็น value
            label: cat.category_name,     // ใช้ category_name เป็น label
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

  const filteredMenus = menus.filter((menu) =>
    selectedCategory === ""
      ? true
      : menu.menu_category_id === parseInt(selectedCategory)
  );

  const handleAddMenu = async () => {
    console.log("📌 Debug menuData:", menuData);

    if (!menuData.recipe_id || !menuData.menu_category_id || !menuData.price) {
      Swal.fire("Error", "กรุณาเลือกสูตรอาหาร, หมวดหมู่ และกรอกราคา", "error");
      return;
    }

    try {
      await axios.post(`${API_URL}/api/menus`, menuData);
      setModalIsOpen(false);
      fetchMenus();
      Swal.fire("สำเร็จ", "เพิ่มเมนูเรียบร้อย", "success");
    } catch (error) {
      console.error("❌ Error adding menu:", error.response?.data || error);
      Swal.fire("Error", "ไม่สามารถเพิ่มเมนูได้", "error");
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

        <button
          className="btn btn-add-menu"
          onClick={() => setModalIsOpen(true)}
        >
          + เพิ่มเมนู
        </button>

        <div className="filters">
          <input
            type="text"
            placeholder="ค้นหาชื่อเมนูอาหาร..."
            className="search-bar"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <Select
            className="modal-select"
            options={categoryOptions}
            onChange={(e) => setSelectedCategory(e.value)}
            placeholder="เลือกหมวดหมู่..."
          />
        </div>

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
            {filteredMenus && filteredMenus.length > 0 ? (
              filteredMenus.map((menu, index) => (
                <tr key={menu.id}>
                  <td>{index + 1}</td>
                  <td>
                    <img
                      className="menu-image"
                      src={menu.image}
                      alt={menu.name}
                    />
                  </td>
                  <td>{menu.name}</td>
                  <td>{menu.category_name || "ไม่ระบุหมวดหมู่"}</td>
                  <td>{menu.price} บาท</td>
                  <td className="action-buttons">
                    <button
                      className="btn btn-edit"
                      onClick={() => openEditModal(menu)}
                    >
                      แก้ไข
                    </button>
                    <button
                      className="btn btn-delete"
                      onClick={() => handleDelete(menu.id)}
                    >
                      ลบ
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6">❌ ไม่มีข้อมูลเมนู</td>
              </tr>
            )}
          </tbody>
        </table>

        {/* ✅ Modal เพิ่มเมนู */}
        <Modal
          className="modal-content"
          isOpen={modalIsOpen}
          onRequestClose={() => setModalIsOpen(false)}
        >
          <h2 className="modal-title">เพิ่มเมนู</h2>

          {/* ✅ เลือกสูตรอาหาร */}
          <Select
            className="modal-select"
            options={
              categoryOptions.length > 0
                ? categoryOptions
                : [{ value: "", label: "กรุณารอ..." }]
            }
            onChange={(e) =>
              setMenuData((prev) => ({ ...prev, menu_category_id: e.value }))
            }
            placeholder="เลือกหมวดหมู่"
          />

          <Select
            className="modal-select"
            options={
              recipes.length > 0
                ? recipes.map((r) => ({
                    value: r.recipe_id,
                    label: r.recipe_name,
                  }))
                : [{ value: "", label: "กรุณารอ..." }]
            }
            onChange={(e) =>
              setMenuData((prev) => ({ ...prev, recipe_id: e.value }))
            }
            placeholder="เลือกสูตรอาหาร"
          />

          {/* ✅ กรอกราคา */}
          <input
            className="modal-input"
            type="number"
            placeholder="ราคา"
            value={menuData.price || ""}
            onChange={(e) =>
              setMenuData((prev) => ({ ...prev, price: e.target.value }))
            }
          />

          <button className="btn btn-save" onClick={handleAddMenu}>
            เพิ่ม
          </button>
        </Modal>

        {/* ✅ Modal แก้ไขเมนู */}
        <Modal
          className="modal-content"
          isOpen={editModalIsOpen}
          onRequestClose={() => setEditModalIsOpen(false)}
        >
          <h2 className="modal-title">แก้ไขเมนู</h2>

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
