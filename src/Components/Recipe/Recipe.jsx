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
          const formattedRecipes = response.data.map((recipe) => ({
            id: recipe.recipe_id, // ✅ ใช้ recipe_id แทน id
            name: recipe.recipe_name || "ไม่มีชื่อ",
            image: recipe.image
              ? `${API_URL}${recipe.image}`
              : "/images/default.jpg",
            ingredients: recipe.ingredients || [],
          }));

          console.log("📌 Recipes State:", formattedRecipes);
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
      console.log("📢 Recipe Details Response:", response.data);

      if (
        !response.data.ingredients ||
        response.data.ingredients.length === 0
      ) {
        console.warn("⚠️ ไม่มีวัตถุดิบในสูตรอาหารนี้");
      }

      setSelectedRecipe({
        ...response.data,
        id: recipe.id, // ✅ กำหนด id ให้ `selectedRecipe`
        ingredients: response.data.ingredients || [], // ✅ ป้องกัน undefined
      });
    } catch (error) {
      console.error("❌ Error fetching recipe details:", error);
    }
  };

  // 📌 ฟังก์ชันลบสูตรอาหาร
  const handleDeleteRecipe = async (id) => {
    console.log("🔴 ลบสูตรอาหาร ID:", id); // ตรวจสอบค่า ID

    if (!id) {
      Swal.fire("❌ ข้อผิดพลาด", "ไม่พบ ID ของสูตรอาหาร", "error");
      return;
    }

    const confirm = await Swal.fire({
      title: "⚠ ลบสูตรอาหารนี้?",
      text: "คุณแน่ใจหรือไม่? การลบนี้จะไม่สามารถกู้คืนได้",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "ลบ",
      cancelButtonText: "ยกเลิก",
    });

    if (confirm.isConfirmed) {
      try {
        await axios.delete(`${API_URL}/api/recipes/${id}`);
        Swal.fire("✅ ลบสำเร็จ!", "สูตรอาหารถูกลบออกจากระบบ", "success");

        // ✅ ลบข้อมูลจาก state ด้วยค่าที่ถูกต้อง
        setRecipes((prev) => prev.filter((r) => r.id !== id));

        // ✅ รีเซ็ต `selectedRecipe` ถ้าถูกลบ
        if (selectedRecipe && selectedRecipe.id === id) {
          setSelectedRecipe(null);
        }
      } catch (error) {
        console.error("❌ Error deleting recipe:", error);
        Swal.fire("❌ ลบไม่สำเร็จ", "เกิดข้อผิดพลาด", "error");
      }
    }
  };

  return (
    <div className="recipe-container">
      <Navbar />
      <Sidebar />
      <div className="recipe-content">
        <div className="recipeList">
          <h1>สูตรอาหาร</h1>
          <button className="addRecipeBtn" onClick={handleAddRecipe}>
            + เพิ่มสูตรอาหาร
          </button>
          <div className="search-add">
            <input
              type="text"
              placeholder="ค้นหาเมนูอาหาร..."
              value={searchTerm}
              onChange={handleSearch}
            />
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
                {selectedRecipe.ingredients.length > 0 ? (
                  selectedRecipe.ingredients.map((ingredient, index) => (
                    <tr key={index}>
                      <td>{ingredient.material_name || "ไม่พบชื่อ"}</td>
                      <td>{ingredient.category_name || "ไม่พบหมวดหมู่"}</td>
                      <td>{ingredient.quantity || 0}</td>
                      <td>{ingredient.unit_name || "กรัม"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" style={{ textAlign: "center", color: "red" }}>
                      ❌ ไม่มีข้อมูลวัตถุดิบในสูตรนี้
                    </td>
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
              onClick={() => {
                console.log("🔴 ลบสูตรอาหาร ID:", selectedRecipe.id);
                handleDeleteRecipe(selectedRecipe.id);
              }}
            >
              ลบสูตรอาหาร
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Recipe;
