import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "../../../Api/axios";
import Swal from "sweetalert2";
import Select from "react-select";
import Navbar from "../../Layout/Navbar/Navbar";
import Sidebar from "../../Layout/Sidebar/Sidebar";
import "./Addrecipe.scss";

const API_URL = import.meta.env.VITE_API_URL; // ✅ ใช้ค่าจาก .env

const Addrecipe = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const title = id ? "แก้ไขสูตรอาหาร" : "สร้างสูตรอาหารใหม่";

  const [recipe, setRecipe] = useState({
    recipe_name: "",
    category_id: null,
    image: null,
    image_url: `${API_URL}/uploads/recipes/default.jpg`,
  });

  const [ingredients, setIngredients] = useState([]);
  const [ingredientOptions, setIngredientOptions] = useState([]);
  const [selectedIngredient, setSelectedIngredient] = useState(null);
  const [quantity, setQuantity] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 📌 โหลดข้อมูลวัตถุดิบทั้งหมด
  useEffect(() => {
    const fetchMaterials = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`${API_URL}/api/materials?limit=1000`);
        if (!response.data || !Array.isArray(response.data.results)) {
          throw new Error("Invalid response format");
        }

        setIngredientOptions(
          response.data.results.map((item) => ({
            value: item.material_id,
            label: item.name,
          }))
        );
      } catch (error) {
        console.error("❌ Error fetching materials:", error.response?.data || error.message);
        setError("ไม่สามารถดึงข้อมูลวัตถุดิบได้");
      } finally {
        setLoading(false);
      }
    };

    fetchMaterials();
  }, []);

  // 📌 โหลดค่า category_id อัตโนมัติ
  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/categories/default`);
        setRecipe((prev) => ({
          ...prev,
          category_id: response.data.category_id ?? 1, // ถ้า null ให้ใช้ค่าเริ่มต้น 1
        }));
      } catch (error) {
        console.error("❌ Error fetching category:", error);
      }
    };

    fetchCategory();
  }, []);

  // 📌 โหลดข้อมูลสูตรอาหารถ้าเป็นการแก้ไข
  useEffect(() => {
    console.log("🔍 Recipe ID:", id); // ✅ Debugging

    if (!id || id === "undefined") {
      console.warn("⚠️ Invalid Recipe ID, skipping fetch...");
      return; // ❌ หยุดการโหลดถ้า ID ไม่ถูกต้อง
    }

    const fetchRecipe = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_URL}/api/recipes/${id}`);
        const recipeData = response.data;

        setRecipe((prev) => ({
          ...prev,
          recipe_name: recipeData.recipe_name || "",
          category_id: recipeData.category_id || 1,
          image_url: recipeData.image
            ? `${API_URL}/uploads/recipes/${recipeData.image}`
            : `${API_URL}/uploads/recipes/default.jpg`,
        }));

        // ✅ ใช้ material_id แทน ingredient_id
        setIngredients(
          recipeData.ingredients.map((ing) => ({
            material_id: ing.material_id, 
            name: ing.material_name || "ไม่พบชื่อ",
            quantity: ing.amount || 0,
            unit: ing.unit_name || "กรัม",
          }))
        );
      } catch (error) {
        console.error("❌ Error fetching recipe:", error);
        setError("ไม่สามารถโหลดข้อมูลสูตรอาหารได้");
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [id]);

  // 📌 เลือกวัตถุดิบ
  const handleIngredientSelect = (selectedOption) => {
    setSelectedIngredient(selectedOption);
  };

  // 📌 ใส่ค่าปริมาณวัตถุดิบ
  const handleQuantityChange = (e) => {
    setQuantity(e.target.value);
  };

  // 📌 เพิ่มวัตถุดิบในสูตรอาหาร
  const addIngredient = () => {
    if (!selectedIngredient || !quantity) {
      Swal.fire("Error", "กรุณาเลือกวัตถุดิบและปริมาณ", "error");
      return;
    }

    setIngredients((prev) => [
      ...prev,
      {
        material_id: selectedIngredient.value, 
        name: selectedIngredient.label,
        quantity,
        unit: "กรัม", // ✅ กำหนดหน่วยเริ่มต้น
      },
    ]);

    setSelectedIngredient(null);
    setQuantity("");
  };

  // 📌 ส่งข้อมูลสูตรอาหาร
  const submitRecipe = async () => {
    if (!recipe.recipe_name || !recipe.category_id || ingredients.length === 0) {
      Swal.fire("Error", "กรุณากรอกชื่อสูตรอาหาร", "error");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("recipe_name", recipe.recipe_name);
      formData.append("category_id", recipe.category_id);

      if (recipe.image) {
        formData.append("image", recipe.image);
      } else {
        formData.append("image", recipe.image_url?.split("/").pop() || "default.jpg");
      }

      formData.append("ingredients", JSON.stringify(ingredients));

      console.log("📌 FormData Before Submit:");
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }

      const url = id ? `${API_URL}/api/recipes/${id}` : `${API_URL}/api/recipes`;
      const method = id ? "put" : "post";

      await axios({
        method,
        url,
        data: formData,
        headers: { "Content-Type": "multipart/form-data" },
      });

      Swal.fire("สำเร็จ", "บันทึกสูตรอาหารเรียบร้อย", "success").then(() => navigate("/recipe"));
    } catch (error) {
      console.error("❌ Error submitting recipe:", error.response?.data || error.message);
      Swal.fire("Error", "เกิดข้อผิดพลาดในการบันทึกสูตรอาหาร", "error");
    }
  };

  return (
    <div className="add-recipe-container">
      <Navbar />
      <Sidebar />
      <div className="add-recipe-content">
        <h2>{title}</h2>
        <form className="create-form">
          {/* 📌 อัปโหลดรูปภาพ */}
          <div className="form-section">
            <label>อัปโหลดรูปภาพ</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  setRecipe((prev) => ({
                    ...prev,
                    image: file,
                    image_url: URL.createObjectURL(file), // ✅ แสดงรูปตัวอย่าง
                  }));
                }
              }}
            />
            {/* ✅ แสดงภาพที่เคยอัปโหลด หรือภาพที่เลือกใหม่ */}
            {recipe.image_url && (
              <img
                src={recipe.image_url}
                alt="Preview"
                className="recipe-preview"
                style={{
                  maxWidth: "600px",
                  maxHeight: "350px",
                  objectFit: "cover",
                }}
              />
            )}
          </div>
  
          {/* 📌 ชื่อสูตรอาหาร */}
          <div className="form-section">
            <label>ชื่อสูตรอาหาร</label>
            <input
              type="text"
              value={recipe.recipe_name}
              onChange={(e) =>
                setRecipe({ ...recipe, recipe_name: e.target.value })
              }
            />
          </div>
  
          {/* 📌 วัตถุดิบ */}
          <div className="form-section">
            <h3>วัตถุดิบ</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>ชื่อวัตถุดิบ</label>
                <Select
                  options={ingredientOptions}
                  value={selectedIngredient}
                  onChange={handleIngredientSelect}
                  placeholder="ค้นหาวัตถุดิบ..."
                />
              </div>
              <div className="form-group">
                <label>ปริมาณ</label>
                <input
                  type="number"
                  min="0"
                  value={quantity}
                  onChange={handleQuantityChange}
                />
              </div>
  
              {/* 📌 เพิ่มวัตถุดิบ */}
              <button
                type="button"
                className="btn add-btn"
                onClick={addIngredient}
              >
                เพิ่มวัตถุดิบ
              </button>
            </div>
          </div>
  
          {/* 📌 แสดงรายการวัตถุดิบที่เพิ่มแล้ว */}
          {ingredients.length > 0 && (
            <div className="ingredient-list">
              <h4>รายการวัตถุดิบที่เพิ่มแล้ว</h4>
              <table>
                <thead>
                  <tr>
                    <th>ชื่อวัตถุดิบ</th>
                    <th>ปริมาณ</th>
                    <th>หน่วย</th>
                    <th>จัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {ingredients.map((ing, index) => (
                    <tr key={index}>
                      <td>{ing.name || "-"}</td>
                      <td>{ing.quantity || 0}</td>
                      <td>{ing.unit || "กรัม"}</td>
                      <td>
                        <button
                          type="button"
                          className="btn delete-btn"
                          onClick={() =>
                            setIngredients(
                              ingredients.filter((_, i) => i !== index)
                            )
                          }
                        >
                          ลบ
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
  
          {/* 📌 ปุ่มกดบันทึก / ยกเลิก */}
          <div className="form-buttons">
            <button
              type="button"
              className="btn cancel-btn"
              onClick={() => navigate("/recipe")}
            >
              ยกเลิก
            </button>
            <button
              type="button"
              className="btn save-btn"
              onClick={submitRecipe}
            >
              ยืนยัน
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};  

export default Addrecipe;
