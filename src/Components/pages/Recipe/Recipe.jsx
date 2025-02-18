import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../../Api/axios";
import Swal from "sweetalert2"; // ✅ เพิ่ม SweetAlert2
import "./Recipe.scss";
import Navbar from "../../Layout/Navbar/Navbar";
import Sidebar from "../../Layout/Sidebar/Sidebar";

const API_URL = "http://192.168.1.44:3002";

const Recipe = () => {
  const [recipes, setRecipes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const navigate = useNavigate();

  // 📌 ดึงข้อมูลเมนูอาหารจาก backend
  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const response = await axios.get("http://192.168.1.44:3002/api/recipes");
        console.log("📢 API Response:", response.data);

        // ตรวจสอบโครงสร้างข้อมูล
        if (Array.isArray(response.data)) {
          // ✅ แปลงข้อมูลให้ใช้ key ที่ถูกต้อง
          const formattedRecipes = response.data.map(recipe => ({
            recipe_id: recipe.recipe_id,
            recipe_name: recipe.recipe_name,
            image: recipe.image?.replace("http://localhost:3002", "http://192.168.1.44:3002")
          }));
          setRecipes(formattedRecipes);
        } else {
          console.error("❌ Unexpected response format:", response.data);
          setRecipes([]);
        }
      } catch (error) {
        console.error("❌ Error fetching recipes:", error);
        setRecipes([]);
      }
    };

    fetchRecipes();
  }, []);

  // 📌 ไปหน้าแก้ไขสูตรอาหาร
  const handleEditRecipe = (id) => {
    if (!id) {
        console.error("❌ Recipe ID is undefined");
        return;
    }
    navigate(`/addrecipe/${id}`);
};

  // 📌 ค้นหาสูตรอาหาร
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // 📌 คัดกรองสูตรอาหารตามคำค้นหา
  const filteredRecipes = recipes.filter(
    (recipe) =>
      recipe.recipe_name && // ✅ ตรวจสอบว่า `recipe.recipe_name` มีค่าก่อนใช้ `.toLowerCase()`
      recipe.recipe_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 📌 ไปหน้าเพิ่มสูตรอาหารใหม่
  const handleAddRecipe = () => {
    navigate("/addrecipe");
  };

  // 📌 ดูรายละเอียดสูตรอาหาร
  const handleViewRecipe = (recipe) => {
    console.log("📢 Viewing Recipe:", recipe);
    setSelectedRecipe(recipe);
  };

  // ✅ ฟังก์ชันลบสูตรอาหาร
  const handleDeleteRecipe = async (id) => {
    if (!id) {
        console.error("❌ Cannot delete recipe, ID is undefined!");
        return;
    }

    Swal.fire({
      title: "ยืนยันการลบ?",
      text: "คุณแน่ใจหรือไม่ว่าต้องการลบสูตรอาหารนี้?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "ลบ",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await axios.delete(`${API_URL}/api/${id}`);
          console.log("✅ Recipe deleted:", response.data);
          setRecipes(recipes.filter((recipe) => recipe.recipe_id !== id));
          Swal.fire("ลบสำเร็จ!", "สูตรอาหารถูกลบออกจากระบบแล้ว", "success");
        } catch (error) {
          console.error("❌ Error deleting recipe:", error.response?.data || error.message);
          Swal.fire("Error", "ไม่สามารถลบสูตรอาหารได้", "error");
        }
      }
    });
};

  return (
    <div className="recipe-container">
      <Navbar />
      <Sidebar />
      <div className="recipe-content">
        <div className="recipeList">
          <h1>สูตรอาหาร</h1>
          <div className="search-add">
            <input
              type="text"
              placeholder="ค้นหาเมนูอาหาร..."
              value={searchTerm}
              onChange={handleSearch}
            />
            <button className="addRecipeBtn" onClick={handleAddRecipe}>
              + เพิ่มสูตรอาหาร
            </button>
          </div>
          <ul>
            {Array.isArray(filteredRecipes) && filteredRecipes.length > 0 ? (
              filteredRecipes.map((recipe) => (
                <li key={recipe.recipe_id}>
                  {recipe.recipe_name}
                  <button
                    className="viewRecipeBtn"
                    onClick={() => handleViewRecipe(recipe)}
                  >
                    ดูสูตรอาหาร
                  </button>
                </li>
              ))
            ) : (
              <li>ไม่มีสูตรอาหาร</li>
            )}
          </ul>
        </div>

        {/* 📌 แสดงรายละเอียดสูตรอาหาร */}
        {selectedRecipe && (
          <div className="recipeDetail">
            <h2>{selectedRecipe.name}</h2>

            {/* ✅ แสดงภาพ พร้อม fallback */}
            {selectedRecipe.image ? (
              <img
                src={selectedRecipe.image}
                alt={selectedRecipe.name}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/images/default.jpg";
                }}
                style={{ width: "200px", height: "200px", objectFit: "cover" }}
              />
            ) : (
              <p>ไม่มีภาพ</p>
            )}

            <h3>วัตถุดิบที่ใช้</h3>
            <table>
              <thead>
                <tr>
                  <th>วัตถุดิบ</th>
                  <th>ประเภท</th>
                  <th>ปริมาณ</th>
                  <th>หน่วย</th>
                </tr>
              </thead>
              <tbody>
                {selectedRecipe.ingredients &&
                selectedRecipe.ingredients.length > 0 ? (
                  selectedRecipe.ingredients.map((ingredient, index) => (
                    <tr key={index}>
                      <td>{ingredient.name}</td>
                      <td>{ingredient.type || "ไม่พบข้อมูล"}</td>
                      <td>{ingredient.quantity}</td>
                      <td>{ingredient.unit || "กรัม"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4">ไม่มีข้อมูลวัตถุดิบ</td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* ✅ ปุ่มลบและแก้ไขสูตรอาหาร */}
            <button
              className="EditRecipeBtn"
              onClick={() => handleEditRecipe(selectedRecipe.id)}
            >
              แก้ไขสูตรอาหาร
            </button>
            <button
              className="deleteRecipeBtn"
              onClick={() => handleDeleteRecipe(selectedRecipe.id)}
            >
              ❌ ลบสูตรอาหาร
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Recipe;
