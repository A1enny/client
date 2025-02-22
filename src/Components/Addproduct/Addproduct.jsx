import { useState, useEffect } from "react";
import Navbar from "../Layout/Navbar/Navbar";
import Sidebar from "../Layout/Sidebar/Sidebar";
import "./Addproduct.scss";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

const Addproduct = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const categoryOptions = [
    "อาหารจานหลัก",
    "อาหารทานเล่น",
    "น้ำดื่ม",
    "ขนมหวาน",
    "สลัด",
  ];

  const ingredientsTypeOptions = [
    "เนื้อสัตว์",
    "แป้ง",
    "เครื่องปรุง",
    "ซอสปรุงรส",
    "ผัก",
    "น้ำมัน",
    "ไข่",
  ];

  const [product, setProduct] = useState({
    product_code: "",
    product_name: "",
    category: "",
    price: 0,
    amount: 0,
    status: 1,
    image_url: null,
  });
  const [image, setImage] = useState(null);
  const [ingredients, setIngredients] = useState([]);
  const [ingredient, setIngredient] = useState({
    name: "",
    type: "",
    quantity: 0,
    unit: "กรัม",
  });

  useEffect(() => {
    const productData = location.state?.product;
    if (productData?.id) {
      fetchProductData(productData.id);
    } else {
      resetProductState();
    }
  }, [location.state]);

  const fetchProductData = async (productId) => {
    try {
      const { data } = await axios.get(
        `http://119.59.101.35:5000/api/products/${productId}`
      );
      setProduct({
        ...data.product,
        image_url: data.product.image_url
          ? `http://119.59.101.35:5000${data.product.image_url}`
          : null,
      });
      setIngredients(data.ingredients || []);
    } catch (error) {
      console.error("Error fetching product data:", error);
      Swal.fire("เกิดข้อผิดพลาด", "ไม่สามารถโหลดข้อมูลสินค้าได้", "error");
    }
  };

  const resetProductState = () => {
    setProduct({
      product_code: "",
      product_name: "",
      category: "",
      price: 0,
      amount: 0,
      status: 1,
      image_url: null,
    });
    setIngredients([]);
  };

  const handleInputChange = (e, setState) => {
    const { name, value } = e.target;
    setState((prev) => ({ ...prev, [name]: value }));
  };

  const handleIngredientsChange = (e) => {
    const { name, value } = e.target;
    setIngredient((prev) => ({
      ...prev,
      [name]: value,
      unit: name === "type" && value === "ไข่" ? "ฟอง" : "กรัม",
    }));
  };

  const addIngredients = () => {
    if (!ingredient.name || !ingredient.type || ingredient.quantity <= 0) {
      Swal.fire("ข้อมูลไม่ครบ!", "กรุณากรอกข้อมูลวัตถุดิบให้ครบ", "warning");
      return;
    }
    setIngredients((prev) => [...prev, ingredient]);
    setIngredient({ name: "", type: "", quantity: 0, unit: "กรัม" });
  };

  const removeIngredients = (index) => {
    Swal.fire({
      title: "คุณแน่ใจหรือไม่?",
      text: "ต้องการลบวัตถุดิบนี้หรือไม่",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "ใช่, ลบเลย!",
      cancelButtonText: "ยกเลิก",
    }).then((result) => {
      if (result.isConfirmed) {
        setIngredients((prev) => prev.filter((_, i) => i !== index));
      }
    });
  };

  const saveProduct = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.keys(product).forEach((key) => formData.append(key, product[key]));
    if (image) formData.append("image", image);
    formData.append("ingredients", JSON.stringify(ingredients));

    console.log("Product data to be sent:", product);
    console.log("Ingredients data to be sent:", ingredients);
    console.log("Image file to be sent:", image);

    try {
      const endpoint = product.id
        ? `http://119.59.101.35:5000/api/products/${product.id}`
        : "http://119.59.101.35:5000/api/products";
      const method = product.id ? "put" : "post";

      await axios[method](endpoint, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      Swal.fire(
        "สำเร็จ!",
        product.id ? "แก้ไขสินค้าเรียบร้อยแล้ว" : "เพิ่มสินค้าเรียบร้อยแล้ว",
        "success"
      );
      navigate("/product");
    } catch (error) {
      if (error.response) {
        Swal.fire(
          "เกิดข้อผิดพลาด!",
          error.response.data.message || "ไม่สามารถบันทึกสินค้าได้",
          "error"
        );
      } else if (error.request) {
        Swal.fire(
          "เกิดข้อผิดพลาด!",
          "การเชื่อมต่อกับเซิร์ฟเวอร์ล้มเหลว",
          "error"
        );
      } else {
        Swal.fire("เกิดข้อผิดพลาด!", "เกิดปัญหาในการบันทึกสินค้า", "error");
      }
      console.error("Error saving product: ", error);
    }
  };

  return (
    <div className="add-product-container">
      <Navbar />
      <Sidebar />
      <div className="add-product-content">
        <h2>{product.id ? "แก้ไขสินค้า" : "สร้างสินค้าใหม่"}</h2>
        <form className="create-form" onSubmit={saveProduct}>
          <div className="form-section">
            <label>อัปโหลดรูปภาพ</label>
            <div className="upload-image">
              {product.image_url && (
                <img
                  src={product.image_url}
                  alt="Product"
                  style={{ maxWidth: "200px" }}
                />
              )}
              <input
                type="file"
                onChange={(e) => setImage(e.target.files[0])}
              />
            </div>
          </div>

          <div className="form-section">
            <h3>ข้อมูลสินค้า</h3>
            <div className="form-grid">
              {[
                { label: "รหัสสินค้า", name: "product_code", type: "text" },
                { label: "ชื่อสินค้า", name: "product_name", type: "text" },
                {
                  label: "หมวดหมู่",
                  name: "category",
                  type: "select",
                  options: categoryOptions,
                },
                { label: "จำนวนสินค้า", name: "amount", type: "number" },
                { label: "ราคา (บาท)", name: "price", type: "number" },
              ].map((field, index) => (
                <div className="form-group" key={index}>
                  <label>{field.label}</label>
                  {field.type === "select" ? (
                    <select
                      name={field.name}
                      value={product[field.name]}
                      onChange={(e) => handleInputChange(e, setProduct)}
                    >
                      <option value="">-- เลือก{field.label} --</option>
                      {field.options.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={field.type}
                      name={field.name}
                      placeholder={field.label}
                      value={product[field.name]}
                      onChange={(e) => handleInputChange(e, setProduct)}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="form-section">
            <h3>สูตรอาหาร</h3>
            <div className="form-grid">
              {[
                { label: "ชื่อวัตถุดิบ", name: "name" },
                {
                  label: "ประเภทวัตถุดิบ",
                  name: "type",
                  type: "select",
                  options: ingredientsTypeOptions,
                },
                { label: "ปริมาณ", name: "quantity", type: "number" },
              ].map((field, index) => (
                <div className="form-group" key={index}>
                  <label>{field.label}</label>
                  {field.type === "select" ? (
                    <select
                      name={field.name}
                      value={ingredient[field.name]}
                      onChange={handleIngredientsChange}
                    >
                      <option value="">-- เลือก{field.label} --</option>
                      {field.options.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={field.type || "text"}
                      name={field.name}
                      placeholder={field.label}
                      value={ingredient[field.name]}
                      onChange={handleIngredientsChange}
                    />
                  )}
                </div>
              ))}
              <div className="form-group">
                <button
                  type="button"
                  className="btn add-btn"
                  onClick={addIngredients}
                >
                  เพิ่ม
                </button>
              </div>
            </div>

            <div className="ingredient-list">
              <h4>รายการวัตถุดิบที่เพิ่มแล้ว</h4>
              <table>
                <thead>
                  <tr>
                    <th>ชื่อวัตถุดิบ</th>
                    <th>ประเภทวัตถุดิบ</th>
                    <th>ปริมาณ</th>
                    <th>การจัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {ingredients.map((ing, index) => (
                    <tr key={index}>
                      <td>{ing.name}</td>
                      <td>{ing.type}</td>
                      <td>
                        {ing.quantity} {ing.unit}
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn delete-btn"
                          onClick={() => removeIngredients(index)}
                        >
                          ลบ
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="form-buttons">
            <button
              type="button"
              className="btn cancel-btn"
              onClick={() => navigate("/product")}
            >
              ยกเลิก
            </button>
            <button type="submit" className="btn save-btn">
              บันทึก
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Addproduct;
