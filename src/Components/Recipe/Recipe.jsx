import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import Navbar from "../Layout/Navbar/Navbar";
import Sidebar from "../Layout/Sidebar/Sidebar";
import "./Recipe.scss";

const API_URL = import.meta.env.VITE_API_URL;

const Recipe = () => {
  const [recipes, setRecipes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const navigate = useNavigate();

  // 📌 ดึงข้อมูลเมนูอาหารจาก backend
  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/recipes`);
        console.log("📢 API Response:", response.data);

        if (Array.isArray(response.data)) {
          setRecipes(
            response.data.map((recipe) => ({
              id: recipe.recipe_id,
              name: recipe.recipe_name || "ไม่มีชื่อ",
              image: recipe.image
                ? `${API_URL}${recipe.image}`
                : "/images/default.jpg",
              ingredients: recipe.ingredients || [],
            }))
          );
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

  // 📌 ค้นหาสูตรอาหาร
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // 📌 คัดกรองสูตรอาหารตามคำค้นหา
  const filteredRecipes = recipes.filter((recipe) =>
    recipe.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 📌 ไปหน้าเพิ่มสูตรอาหารใหม่
  const handleAddRecipe = () => {
    navigate("/addrecipe");
  };

  // 📌 ไปหน้าแก้ไขสูตรอาหาร
  const handleEditRecipe = (id) => {
    navigate(`/addrecipe/${id}`);
  };

  // 📌 ดูรายละเอียดสูตรอาหาร
  const handleViewRecipe = async (recipe) => {
    try {
      const response = await axios.get(`${API_URL}/api/recipes/${recipe.id}`);
      console.log("📢 Recipe Details Response:", response.data); // ✅ ตรวจสอบ API Response
      setSelectedRecipe(response.data);
    } catch (error) {
      console.error("❌ Error fetching recipe details:", error);
    }
  };

  // ✅ ฟังก์ชันลบสูตรอาหาร
  const handleDeleteRecipe = async (id) => {
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
          await axios.delete(`${API_URL}/api/recipes/${id}`);
          setRecipes(recipes.filter((recipe) => recipe.id !== id));
          setSelectedRecipe(null);
          Swal.fire("ลบสำเร็จ!", "สูตรอาหารถูกลบออกจากระบบแล้ว", "success");
        } catch (error) {
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
            {filteredRecipes.map((recipe) => (
              <li key={recipe.id}>
                {recipe.name}
                <button
                  className="viewRecipeBtn"
                  onClick={() => handleViewRecipe(recipe)}
                >
                  ดูสูตรอาหาร
                </button>
              </li>
            ))}
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
                  e.target.src = "/images/default.jpg"; // ✅ ใช้ภาพเริ่มต้นถ้าภาพโหลดไม่ได้
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
                      <td>{ingredient.material_name}</td>
                      <td>{ingredient.unit_name || "ไม่พบข้อมูล"}</td>
                      <td>{ingredient.quantity}</td>
                      <td>{ingredient.unit_name || "กรัม"}</td>
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
