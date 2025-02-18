import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom"; // For navigation and fetching params

const EditTable = () => {
  const [table, setTable] = useState({ table_number: "", seats: "", status: "" });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { id } = useParams(); // To get the table id from the URL params

  useEffect(() => {
    // Fetch table data based on the id from the URL
    const fetchTable = async () => {
      try {
        const response = await axios.get(`/api/tables/${id}`);
        setTable(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching table:", error);
        setLoading(false);
      }
    };

    fetchTable();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Send updated table data to backend API
      await axios.put(`/api/tables/${id}`, table);
      alert("Table updated successfully!");
      navigate("/table"); // Redirect to the table management page
    } catch (error) {
      console.error("Error updating table:", error);
      alert("Failed to update table. Please try again.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTable((prevTable) => ({
      ...prevTable,
      [name]: value,
    }));
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="EditTable-container">
      <h1>แก้ไขข้อมูลโต๊ะ</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>หมายเลขโต๊ะ:</label>
          <input
            type="text"
            name="table_number"
            value={table.table_number}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>จำนวนที่นั่ง:</label>
          <input
            type="number"
            name="seats"
            value={table.seats}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>สถานะ:</label>
          <select
            name="status"
            value={table.status}
            onChange={handleChange}
            required
          >
            <option value="available">ว่าง</option>
            <option value="active">ใช้งาน</option>
            <option value="reserved">จอง</option>
            <option value="unavailable">ไม่พร้อมใช้งาน</option>
            <option value="in-use">กำลังใช้งาน</option>
          </select>
        </div>
        <div>
          <button type="submit">บันทึกการเปลี่ยนแปลง</button>
        </div>
      </form>
    </div>
  );
};

export default EditTable;
