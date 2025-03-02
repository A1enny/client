import { useState, useEffect } from "react";
import Modal from "react-modal";
import axios from "axios";
import Swal from "sweetalert2";
import Select from "react-select";

const AddProduct = ({ isOpen, closeModal }) => {
  const [productData, setProductData] = useState({
    product_name: "",
    category: "",
    recipe_id: "",
    price: 0,
  });
  const [categories, setCategories] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [image, setImage] = useState(null);

  // Fetch Categories and Recipes when modal is opened
  useEffect(() => {
    if (isOpen) {
      fetchCategories();
      fetchRecipes();
    }
  }, [isOpen]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/menus/category`);
      setCategories(
        response.data.results.map((category) => ({
          value: category.menu_category_id,
          label: category.category_name,
        }))
      );
    } catch (error) {
      console.error("❌ Error fetching categories:", error);
      Swal.fire("Error", "ไม่สามารถโหลดข้อมูลหมวดหมู่ได้", "error");
    }
  };

  const fetchRecipes = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/recipes`);
      setRecipes(
        response.data.map((recipe) => ({
          value: recipe.recipe_id,
          label: recipe.recipe_name,
        }))
      );
    } catch (error) {
      console.error("❌ Error fetching recipes:", error);
      Swal.fire("Error", "ไม่สามารถโหลดข้อมูลสูตรอาหารได้", "error");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProductData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSelectChange = (selectedOption, fieldName) => {
    setProductData((prevData) => ({ ...prevData, [fieldName]: selectedOption.value }));
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("product_name", productData.product_name);
    formData.append("category", productData.category);
    formData.append("recipe_id", productData.recipe_id);
    formData.append("price", productData.price);
    if (image) formData.append("image", image);

    try {
      await axios.post(`${API_URL}/api/menus`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      Swal.fire("สำเร็จ", "เพิ่มเมนูใหม่เรียบร้อยแล้ว", "success");
      closeModal();
    } catch (error) {
      Swal.fire("Error", "ไม่สามารถเพิ่มเมนูได้", "error");
      console.error("❌ Error adding product:", error);
    }
  };

  return (
    <Modal isOpen={isOpen} onRequestClose={closeModal}>
      <h2>เพิ่มเมนูใหม่</h2>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>ชื่อเมนู</label>
          <input
            type="text"
            name="product_name"
            value={productData.product_name}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label>หมวดหมู่</label>
          <Select
            options={categories}
            onChange={(e) => handleSelectChange(e, "category")}
            placeholder="เลือกหมวดหมู่"
            required
          />
        </div>

        <div className="form-group">
          <label>สูตรอาหาร</label>
          <Select
            options={recipes}
            onChange={(e) => handleSelectChange(e, "recipe_id")}
            placeholder="เลือกสูตรอาหาร"
            required
          />
        </div>

        <div className="form-group">
          <label>ราคา (บาท)</label>
          <input
            type="number"
            name="price"
            value={productData.price}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label>อัปโหลดรูปภาพ</label>
          <input type="file" onChange={handleImageChange} />
        </div>

        <div className="form-actions">
          <button type="button" onClick={closeModal}>ยกเลิก</button>
          <button type="submit">บันทึก</button>
        </div>
      </form>
    </Modal>
  );
};

export default AddProduct;
