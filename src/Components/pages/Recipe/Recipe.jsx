import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../../Api/axios";
import Swal from "sweetalert2"; // ✅ เพิ่ม SweetAlert2
import "./Recipe.scss";
import Navbar from "../../Layout/Navbar/Navbar";
import Sidebar from "../../Layout/Sidebar/Sidebar";

const API_URL = "http://119.59.101.35:5000/api";

const Recipe = () => {
  const [recipes, setRecipes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 📌 ดึงข้อมูลสูตรอาหารจาก backend
  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/recipes`);
        console.log("📢 API Response:", response.data);

        if (Array.isArray(response.data)) {
          const formattedRecipes = response.data.map(recipe => ({
            recipe_id: recipe.recipe_id,
            recipe_name: recipe.recipe_name,
            image: recipe.image?.replace("http://localhost:3002", `${API_URL}`)
          }));
          setRecipes(formattedRecipes);
        } else {
          console.error("❌ Unexpected response format:", response.data);
          setRecipes([]);
        }
      } catch (error) {
        console.error("❌ Error fetching recipes:", error);
        setRecipes([]);
      } finally {
        setLoading(false);
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
      recipe.recipe_name &&
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
          const response = await axios.delete(`${API_URL}/recipes/${id}`);
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

          {loading ? (
            <p>กำลังโหลดข้อมูล...</p>
          ) : (
            <ul>
              {filteredRecipes.length > 0 ? (
                filteredRecipes.map((recipe) => (
                  <li key={recipe.recipe_id}>
                    {recipe.recipe_name}
                    <button className="viewRecipeBtn" onClick={() => handleViewRecipe(recipe)}>
                      ดูสูตรอาหาร
                    </button>
                  </li>
                ))
              ) : (
                <li>ไม่มีสูตรอาหาร</li>
              )}
            </ul>
          )}
        </div>

        {/* 📌 แสดงรายละเอียดสูตรอาหาร */}
        {selectedRecipe && (
          <div className="recipeDetail">
            <h2>{selectedRecipe.recipe_name}</h2>
            {/* ✅ แสดงภาพ พร้อม fallback */}
            {selectedRecipe.image ? (
              <img
                src={selectedRecipe.image}
                alt={selectedRecipe.recipe_name}
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
                {selectedRecipe.ingredients && selectedRecipe.ingredients.length > 0 ? (
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
            <button className="EditRecipeBtn" onClick={() => handleEditRecipe(selectedRecipe.recipe_id)}>
              แก้ไขสูตรอาหาร
            </button>
            <button className="deleteRecipeBtn" onClick={() => handleDeleteRecipe(selectedRecipe.recipe_id)}>
              ❌ ลบสูตรอาหาร
            </button>

            {/* ✅ ปุ่มปิดหน้าต่างรายละเอียด */}
            <button className="closeRecipeBtn" onClick={() => setSelectedRecipe(null)}>
              ❌ ปิด
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Recipe;
