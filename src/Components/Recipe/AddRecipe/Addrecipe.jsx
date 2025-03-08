import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "../../../Api/axios";
import Swal from "sweetalert2";
import Select from "react-select";
import Navbar from "../../Layout/Navbar/Navbar";
import Sidebar from "../../Layout/Sidebar/Sidebar";
import "./Addrecipe.scss";

const API_URL = import.meta.env.VITE_API_URL;

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

  useEffect(() => {
    const fetchMaterials = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`${API_URL}/api/materials?limit=1000`);

        console.log("📌 API Response:", response.data.results); // ✅ ตรวจสอบข้อมูลจาก API

        setIngredientOptions(
          response.data?.results?.map((item) => {
            // ✅ แปลงวันหมดอายุเป็นรูปแบบไทย (DD/MM/YYYY)
            const expirationDate = item.expiration_date
              ? new Date(item.expiration_date).toLocaleDateString("th-TH")
              : "N/A";

            return {
              value: item.material_id,
              label: `${item.material_name} ${expirationDate} (เหลือ ${
                item.total_quantity !== undefined &&
                item.total_quantity !== null
                  ? parseFloat(item.total_quantity).toFixed(2)
                  : "N/A"
              })`,
              availableQuantity: parseFloat(item.total_quantity) ?? 0, // ✅ ใช้ `total_quantity` แทน `quantity`
            };
          }) || []
        );
      } catch (error) {
        console.error("❌ Error fetching materials:", error);
        setError("ไม่สามารถดึงข้อมูลวัตถุดิบได้");
      } finally {
        setLoading(false);
      }
    };
    fetchMaterials();
  }, []);

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/categories/default`);
        setRecipe((prev) => ({
          ...prev,
          category_id: response.data.category_id ?? 1,
        }));
      } catch (error) {
        console.error("❌ Error fetching category:", error);
      }
    };
    fetchCategory();
  }, []);

  useEffect(() => {
    if (!id) return;
    const fetchRecipe = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_URL}/api/recipes/${id}`);
        const recipeData = response.data;

        setRecipe({
          recipe_name: recipeData.recipe_name || "",
          category_id: recipeData.category_id || 1,
          image_url: recipeData.image
            ? `${API_URL}${recipeData.image}`
            : `${API_URL}/uploads/recipes/default.jpg`,
        });

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

  const handleIngredientSelect = (selectedOption) =>
    setSelectedIngredient(selectedOption);
  const handleQuantityChange = (e) => setQuantity(e.target.value);

  const addIngredient = () => {
    if (!selectedIngredient || !quantity) {
      Swal.fire("Error", "กรุณาเลือกวัตถุดิบและปริมาณ", "error");
      return;
    }

    const selectedMaterial = ingredientOptions.find(
      (item) => item.value === selectedIngredient.value
    );

    if (!selectedMaterial) {
      Swal.fire("Error", "ไม่พบข้อมูลวัตถุดิบ", "error");
      return;
    }

    const availableQuantity = selectedMaterial.availableQuantity;
    if (parseFloat(quantity) > availableQuantity) {
      Swal.fire(
        "ข้อผิดพลาด",
        `ปริมาณที่กรอก (${quantity}) มากกว่าจำนวนที่มี (${availableQuantity.toFixed(
          2
        )})`,
        "error"
      );
      return;
    }

    setIngredients((prev) => [
      ...prev,
      {
        material_id: selectedIngredient.value,
        name: selectedIngredient.label,
        quantity: parseFloat(quantity).toFixed(2),
        unit: "กรัม",
      },
    ]);

    setSelectedIngredient(null);
    setQuantity("");
  };

  const submitRecipe = async (e) => {
    e.preventDefault();

    if (!recipe.recipe_name || !recipe.category_id) {
      Swal.fire(
        "❌ ข้อผิดพลาด",
        "กรุณากรอกชื่อสูตรอาหารและเลือกหมวดหมู่",
        "error"
      );
      return;
    }

    if (ingredients.length === 0) {
      Swal.fire("❌ ข้อผิดพลาด", "กรุณาเพิ่มวัตถุดิบในสูตรอาหาร", "error");
      return;
    }

    const formData = new FormData();
    formData.append("recipe_name", recipe.recipe_name);
    formData.append("category_id", recipe.category_id);
    if (recipe.image) formData.append("image", recipe.image);
    formData.append("ingredients", JSON.stringify(ingredients));

    try {
      let response;
      if (id) {
        response = await axios.put(`${API_URL}/api/recipes/${id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        response = await axios.post(`${API_URL}/api/recipes`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      Swal.fire("✅ สำเร็จ", "บันทึกสูตรอาหารเรียบร้อย", "success").then(() => {
        navigate("/recipe");
      });
    } catch (error) {
      console.error("❌ Error saving recipe:", error);
      Swal.fire("❌ ผิดพลาด", "เกิดข้อผิดพลาดในการบันทึกสูตรอาหาร", "error");
    }
  };

  return (
    <div className="add-recipe-container">
      <Navbar />
      <Sidebar />
      <div className="add-recipe-content">
        <h2>{title}</h2>
        <form className="create-form">
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
                    image_url: URL.createObjectURL(file),
                  }));
                }
              }}
            />

            {/* ✅ แสดง Preview เฉพาะเมื่อมีการอัปโหลดรูป */}
            {recipe.image && (
              <img
                src={recipe.image_url}
                alt="Preview"
                className="recipe-preview"
              />
            )}
          </div>

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

          <div className="form-section">
            <h3>วัตถุดิบ</h3>

            <div className="ingredient-inputs">
              <Select
                className="select-ingredient"
                options={ingredientOptions}
                value={selectedIngredient}
                onChange={handleIngredientSelect}
                placeholder="ค้นหาวัตถุดิบ..."
              />
              <input
                className="quantity-input"
                type="number"
                min="0"
                value={quantity}
                onChange={handleQuantityChange}
                placeholder="กรอกปริมาณ..."
              />
              <button
                type="button"
                className="btn add-btn"
                onClick={addIngredient}
              >
                เพิ่มวัตถุดิบ
              </button>
            </div>

            {/* ✅ เพิ่มตารางแสดงวัตถุดิบที่เพิ่มแล้ว */}
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
                        <td>{ing.name}</td>
                        <td>{ing.quantity}</td>
                        <td>{ing.unit}</td>
                        <td>
                          <button
                            type="button"
                            className="btn delete-btn"
                            onClick={() => {
                              setIngredients(
                                ingredients.filter((_, i) => i !== index)
                              );
                            }}
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
          </div>

          <button type="button" className="btn save-btn" onClick={submitRecipe}>
            ยืนยัน
          </button>
        </form>
      </div>
    </div>
  );
};

export default Addrecipe;
