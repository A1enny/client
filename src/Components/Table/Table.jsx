import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../Api/axios";
import socket from "../../Api/socket";
import Swal from "sweetalert2";
import { QRCodeCanvas } from "qrcode.react";
import Sidebar from "../Layout/Sidebar/Sidebar";
import Navbar from "../Layout/Navbar/Navbar";
import "./Table.scss";
import EditTableModal from "./EditTable/EditTable";

const API_URL = import.meta.env.VITE_API_URL;

const Table = () => {
  const [tables, setTables] = useState([]);
  const [filters, setFilters] = useState({ search: "", sort: "asc" });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);
  const [newTable, setNewTable] = useState({ table_number: "", seats: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const searchTimeout = useRef(null);

  const handleDeleteTable = async (tableId) => {
    try {
      await axios.delete(`${API_URL}/api/tables/${tableId}`);
      Swal.fire("✅", "ลบโต๊ะสำเร็จ", "success");
      fetchTables(); // โหลดข้อมูลใหม่หลังจากลบ
    } catch (error) {
      Swal.fire("❌", "ลบโต๊ะไม่สำเร็จ", "error");
    }
  };
  
  const fetchTables = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/tables`, { params: filters });
      const sortedTables = response.data.sort((a, b) => filters.sort === "asc" ? a.table_number - b.table_number : b.table_number - a.table_number);
      setTables(sortedTables);
    } catch (error) {
      console.error("❌ Error:", error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(fetchTables, 500);
  }, [filters, fetchTables]);

  useEffect(() => {
    socket.on("tableUpdated", fetchTables);
    return () => socket.off("tableUpdated");
  }, [fetchTables]);

  return (
    <div className="table-page">
      <Navbar />
      <Sidebar />
      <div className="table-main">
        <div className="table-header">
          <h1>จัดการโต๊ะอาหาร</h1>
          <button className="btn-add" onClick={() => setIsModalOpen(true)}>เพิ่มโต๊ะ</button>
        </div>

        <div className="filter-section">
          <select
            className="sort-select"
            value={filters.sort}
            onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
          >
            <option value="asc">🔼 หมายเลขโต๊ะ: น้อยไปมาก</option>
            <option value="desc">🔽 หมายเลขโต๊ะ: มากไปน้อย</option>
          </select>
          <input
            className="table-search"
            type="text"
            placeholder="ค้นหาโต๊ะ..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
        </div>

        {loading ? (
          <div className="loading">⏳ Loading...</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>หมายเลขโต๊ะ</th>
                <th>ที่นั่ง</th>
                <th>QR Code</th>
                <th>จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {tables.map((table) => (
                <tr key={table.table_id}>
                  <td>{table.table_number}</td>
                  <td>{table.seats}</td>
                  <td>
                    <QRCodeCanvas
                      value={`${window.location.origin}/order/${table.table_id}?guest=true`}
                      size={90}
                    />
                  </td>
                  <td>
                    <button onClick={() => {
                      setSelectedTable(table);
                      setIsEditModalOpen(true);
                    }}>✏️ แก้ไข</button>
                    <button onClick={() => navigate(`/table-details/${table.table_id}`)}>ℹ️ รายละเอียด</button>
                    <button onClick={() => handleDeleteTable(table.table_id)}>🗑️ ลบ</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <EditTableModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          tableData={selectedTable}
          onUpdated={fetchTables}
        />
      </div>
    </div>
  );
};

export default Table;