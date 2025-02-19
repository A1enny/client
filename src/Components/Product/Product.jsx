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
    fetchRecipes();
  }, []);

  const fetchMenus = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:3002/api/menus");
      console.log("📡 API Response:", response.data);
      setMenus(response.data);
    } catch (error) {
      console.error("Error fetching menus:", error);
    }
    setLoading(false);
  };
  const [categoryOptions, setCategoryOptions] = useState([]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3002/api/menus/category"
      );
      console.log("📡 API Response (Categories):", response.data);
      setCategoryOptions(
        response.data.map((cat) => ({
          value: cat.category_id,
          label: cat.category_name,
        }))
      );
    } catch (error) {
      console.error("❌ Error fetching categories:", error);
    }
  };

  // ✅ โหลดหมวดหมู่เมื่อคอมโพเนนต์ถูกโหลด
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchRecipes = async () => {
    try {
      const response = await axios.get("http://localhost:3002/api/recipes");
      setRecipes(response.data.results);
    } catch (error) {
      console.error("Error fetching recipes:", error);
    }
  };

  const filteredMenus =
    selectedCategory === ""
      ? menus
      : menus.filter((menu) => menu.category_id === parseInt(selectedCategory));

  const handleAddMenu = async () => {
    console.log("📌 Debug menuData:", menuData); // ตรวจสอบค่าก่อนส่งไป API

    if (!menuData.recipe_id || !menuData.menu_category_id || !menuData.price) {
      Swal.fire("Error", "กรุณาเลือกสูตรอาหาร, หมวดหมู่ และกรอกราคา", "error");
      return;
    }

    try {
      await axios.post("http://localhost:3002/api/menus", menuData);
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
          await axios.delete(`http://localhost:3002/api/menus/${menu_id}`);
          fetchMenus();
          Swal.fire("ลบสำเร็จ!", "เมนูถูกลบออกจากระบบแล้ว", "success");
        } catch (error) {
          console.error("Error deleting menu:", error);
          Swal.fire("Error", "ไม่สามารถลบเมนูได้", "error");
        }
      }
    });
  };

  const openEditModal = (menu) => {
    setEditData({
      menu_id: menu.id,
      recipe_id: menu.recipe_id,
      price: menu.price,
    });
    setEditModalIsOpen(true);
  };

  const handleEditMenu = async () => {
    try {
      await axios.put(`http://localhost:3002/api/menus/${editData.menu_id}`, {
        recipe_id: editData.recipe_id,
        price: editData.price,
      });
      setEditModalIsOpen(false);
      fetchMenus();
      Swal.fire("สำเร็จ", "แก้ไขเมนูเรียบร้อย", "success");
    } catch (error) {
      console.error("Error updating menu:", error);
      Swal.fire("Error", "ไม่สามารถแก้ไขเมนูได้", "error");
    }
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
            options={[
              { value: "1", label: "อาหารจานหลัก" },
              { value: "2", label: "อาหารประเภทเส้น" },
              { value: "3", label: "อาหารประเภทของทอด" },
              { value: "4", label: "อาหารประเภทปิ้งย่าง" },
              { value: "5", label: "อาหารประเภทสเต็กหรือเบอร์เกอร์" },
            ]}
            onChange={(e) =>
              setMenuData({ ...menuData, menu_category_id: e.value })
            } // ✅ บันทึกค่า menu_category_id
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
            {filteredMenus.map((menu, index) => (
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
                <td>{menu.category_name}</td>
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
            ))}
          </tbody>
        </table>

        <Modal
          className="modal-content"
          isOpen={modalIsOpen}
          onRequestClose={() => setModalIsOpen(false)}
        >
          <h2 className="modal-title">เพิ่มเมนู</h2>

          {/* ✅ เลือกสูตรอาหาร */}
          <Select
            className="modal-select"
            options={recipes.map((r) => ({ value: r.id, label: r.name }))}
            onChange={(e) =>
              setMenuData((prev) => ({ ...prev, recipe_id: e.value }))
            }
          />

          {/* ✅ เลือกหมวดหมู่ */}
          <Select
            className="modal-select"
            options={[
              { value: "1", label: "อาหารจานหลัก" },
              { value: "2", label: "อาหารประเภทเส้น" },
              { value: "3", label: "อาหารประเภทของทอด" },
              { value: "4", label: "อาหารประเภทปิ้งย่าง" },
              { value: "5", label: "อาหารประเภทสเต็กหรือเบอร์เกอร์" },
            ]}
            onChange={(e) =>
              setMenuData((prev) => ({ ...prev, menu_category_id: e.value }))
            }
          />

          {/* ✅ กรอกราคา */}
          <input
            className="modal-input"
            type="number"
            placeholder="ราคา"
            onChange={(e) =>
              setMenuData((prev) => ({ ...prev, price: e.target.value }))
            }
          />

          <button className="btn btn-save" onClick={handleAddMenu}>
            เพิ่ม
          </button>
        </Modal>

        <Modal
          className="modal-content"
          isOpen={editModalIsOpen}
          onRequestClose={() => setEditModalIsOpen(false)}
        >
          <h2 className="modal-title">แก้ไขเมนู</h2>
          <input
            className="modal-input"
            type="number"
            value={editData.price}
            onChange={(e) =>
              setEditData({ ...editData, price: e.target.value })
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
