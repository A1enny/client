import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "../../../../Api/axios";
import Swal from "sweetalert2";
import Select from "react-select";
import Navbar from "../../../../Components/Layout/Navbar/Navbar";
import Sidebar from "../../../../Components/Layout/Sidebar/Sidebar";
import "./Addrecipe.scss"

const unitOptions = [
  { value: "กรัม", label: "กรัม" },
  { value: "กิโลกรัม", label: "กิโลกรัม" },
  { value: "ฟอง", label: "ฟอง" },
  { value: "ใบ", label: "ใบ" },
];

const API_URL = "http://192.168.1.44:3002";

const Addrecipe = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const title = id ? "แก้ไขสูตรอาหาร" : "สร้างสูตรอาหารใหม่";

  const [recipe, setRecipe] = useState({
    recipe_name: "",
    image: null,
    image_url: "",
  });

  const [ingredients, setIngredients] = useState([]);
  const [ingredient, setIngredient] = useState({
    ingredient_id: null,
    name: "",
    quantity: "",
    unit: "กรัม",
  });

  const [ingredientOptions, setIngredientOptions] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/ingredients`);
        if (!Array.isArray(res.data)) {
          console.error(
            "❌ ingredients API did not return an array:",
            res.data
          );
          return;
        }

        const formattedData = res.data.map((item) => ({
          value: item.ingredient_id,
          label: item.ingredient_name,
        }));

        setIngredientOptions(formattedData);
      } catch (error) {
        console.error("❌ Error fetching ingredients:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!id) return;
    const fetchRecipe = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/recipes/${id}`);
        const recipeData = response.data;

        setRecipe({
          recipe_name: recipeData.name || "",
          image_url: recipeData.image?.startsWith("http")
            ? recipeData.image
            : `${API_URL}/uploads/recipes/${recipeData.image}`,
          image: null,
        });

        setIngredients(
          recipeData.ingredients.map((ing) => ({
            ingredient_id: ing.ingredient_id,
            name: ing.name,
            quantity: ing.quantity,
            unit: ing.unit,
          }))
        );
      } catch (error) {
        console.error("Error fetching recipe:", error);
        Swal.fire("Error", "ไม่สามารถโหลดข้อมูลสูตรอาหารได้", "error");
      }
    };
    fetchRecipe();
  }, [id]);

  const handleIngredientSelect = (selectedOption) => {
    if (!selectedOption) return;

    const selectedIngredient = ingredientOptions.find(
      (item) => item.value === selectedOption.value
    );

    setIngredient({
      ingredient_id: selectedOption.value,
      name: selectedOption.label,
      quantity: "",
      unit: "กรัม",
    });
  };

  const handleIngredientsChange = (e) => {
    setIngredient((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const submitRecipe = async () => {
    console.log("📌 Recipe Data:", recipe);
    console.log("📌 Ingredients:", JSON.stringify(ingredients, null, 2)); // ✅ เช็คค่าก่อนส่ง

    if (!recipe.recipe_name || ingredients.length === 0) {
        Swal.fire("Error", "กรุณากรอกข้อมูลให้ครบถ้วนทุกช่อง", "error");
        return;
    }

    try {
        const formData = new FormData();
        formData.append("recipe_name", recipe.recipe_name);
        if (recipe.image) {
            formData.append("image", recipe.image);
        }
        formData.append("ingredients", JSON.stringify(ingredients));

        console.log("📌 FormData:", formData); // ✅ ดูค่าที่จะถูกส่งไป API

        const url = id ? `${API_URL}/api/recipes/${id}` : `${API_URL}/api/recipes`;
        const method = id ? "put" : "post";

        const response = await axios({
            method,
            url,
            data: formData,
            headers: { "Content-Type": "multipart/form-data" },
        });

        console.log("✅ API Response:", response.data);

        Swal.fire(
            "สำเร็จ",
            id ? "อัปเดตสูตรอาหารเรียบร้อย" : "บันทึกสูตรอาหารเรียบร้อย",
            "success"
        ).then(() => navigate("/recipe"));
    } catch (error) {
        console.error("❌ Error submitting recipe:", error.response?.data || error.message);
        Swal.fire("Error", "เกิดข้อผิดพลาดในการบันทึกสูตรอาหาร", "error");
    }
};



  const addIngredient = () => {
    if (!ingredient.ingredient_id || !ingredient.quantity || !ingredient.unit) {
        Swal.fire("Error", "กรุณากรอกข้อมูลวัตถุดิบให้ครบถ้วน", "error");
        return;
    }

    const newIngredient = {
        ingredient_id: ingredient.ingredient_id,
        name: ingredient.name,
        quantity: ingredient.quantity,
        unit: ingredient.unit,
    };

    console.log("🛠 Adding Ingredient:", newIngredient); // ✅ ตรวจสอบค่า ingredients

    setIngredients((prev) => [...prev, newIngredient]);

    setIngredient({
        ingredient_id: null,
        name: "",
        quantity: "",
        unit: "กรัม",
    });
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
            {recipe.image_url && (
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
            <div className="form-grid">
              <div className="form-group">
                <label>ชื่อวัตถุดิบ</label>
                <Select
                  options={ingredientOptions}
                  value={
                    ingredientOptions.find(
                      (opt) => opt.value === ingredient.ingredient_id
                    ) || null
                  }
                  onChange={handleIngredientSelect}
                  placeholder="ค้นหาวัตถุดิบ..."
                />
              </div>

              <div className="form-group">
                <label>ปริมาณ</label>
                <input
                  type="number"
                  name="quantity"
                  min="0"
                  value={ingredient.quantity}
                  onChange={handleIngredientsChange}
                />
              </div>

              <div className="form-group">
                <label>หน่วย</label>
                <Select
                  options={unitOptions}
                  value={
                    unitOptions.find((opt) => opt.value === ingredient.unit) ||
                    null
                  }
                  onChange={(selectedOption) =>
                    setIngredient((prev) => ({
                      ...prev,
                      unit: selectedOption.value,
                    }))
                  }
                  placeholder="เลือกหน่วย..."
                />
              </div>

              <button
                type="button"
                className="btn add-btn"
                onClick={addIngredient}
              >
                เพิ่มวัตถุดิบ
              </button>
            </div>
          </div>

          {/* ✅ ตรวจสอบว่า ingredients มีข้อมูลก่อนแสดงตาราง */}
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
                      <td>{ing.name.trim()}</td>
                      <td>{ing.quantity}</td>
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
