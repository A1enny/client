import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "../../../../Api/axios";
import Swal from "sweetalert2";
import Select from "react-select";
import Navbar from "../../../../Components/Layout/Navbar/Navbar";
import Sidebar from "../../../../Components/Layout/Sidebar/Sidebar";
import "./Addrecipe.scss";

const unitOptions = [
  { value: "กรัม", label: "กรัม" },
  { value: "กิโลกรัม", label: "กิโลกรัม" },
  { value: "ฟอง", label: "ฟอง" },
  { value: "ใบ", label: "ใบ" },
];

const API_URL = "http://119.59.101.35:5000/api";

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
        const res = await axios.get(`${API_URL}/ingredients`);
        if (!Array.isArray(res.data.results)) {
          console.error("❌ ingredients API did not return an array:", res.data);
          return;
        }

        const formattedData = res.data.results.map((item) => ({
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
        const response = await axios.get(`${API_URL}/recipes/${id}`);
        const recipeData = response.data;

        setRecipe({
          recipe_name: recipeData.name || "",
          image_url: recipeData.image || "/default-image.jpg",
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
        console.error("❌ Error fetching recipe:", error);
        Swal.fire("Error", "ไม่สามารถโหลดข้อมูลสูตรอาหารได้", "error");
      }
    };
    fetchRecipe();
  }, [id]);

  const handleIngredientSelect = (selectedOption) => {
    if (!selectedOption) return;

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

      const url = id ? `${API_URL}/recipes/${id}` : `${API_URL}/recipes`;
      const method = id ? "put" : "post";

      await axios({
        method,
        url,
        data: formData,
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log("✅ API request successful");
      

      Swal.fire(
        "สำเร็จ",
        id ? "อัปเดตสูตรอาหารเรียบร้อย" : "บันทึกสูตรอาหารเรียบร้อย",
        "success"
      ).then(() => navigate("/recipe"));
    } catch (error) {
      console.error("❌ Error submitting recipe:", error);
      Swal.fire("Error", "เกิดข้อผิดพลาดในการบันทึกสูตรอาหาร", "error");
    }
  };

  const addIngredient = () => {
    if (!ingredient.ingredient_id || !ingredient.quantity || parseFloat(ingredient.quantity) <= 0) {
      Swal.fire("Error", "กรุณากรอกข้อมูลวัตถุดิบให้ครบถ้วนและถูกต้อง", "error");
      return;
    }

    setIngredients((prev) => [...prev, ingredient]);

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
            {recipe.image_url && <img src={recipe.image_url} alt="Preview" className="recipe-preview" />}
          </div>

          <div className="form-section">
            <label>ชื่อสูตรอาหาร</label>
            <input
              type="text"
              value={recipe.recipe_name}
              onChange={(e) => setRecipe({ ...recipe, recipe_name: e.target.value })}
            />
          </div>

          <div className="form-section">
            <h3>วัตถุดิบ</h3>
            <Select options={ingredientOptions} onChange={handleIngredientSelect} placeholder="ค้นหาวัตถุดิบ..." />
            <input type="number" name="quantity" value={ingredient.quantity} onChange={handleIngredientsChange} />
            <Select options={unitOptions} onChange={(selectedOption) => setIngredient((prev) => ({ ...prev, unit: selectedOption.value }))} />
            <button type="button" onClick={addIngredient}>เพิ่มวัตถุดิบ</button>
          </div>

          <button type="button" onClick={submitRecipe}>บันทึก</button>
        </form>
      </div>
    </div>
  );
};

export default Addrecipe;
