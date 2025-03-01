import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../Api/axios";
import socket from "../../Api/socket";
import Swal from "sweetalert2";
import { QRCodeCanvas } from "qrcode.react";
import Sidebar from "../Layout/Sidebar/Sidebar";
import Navbar from "../Layout/Navbar/Navbar";
import "./Table.scss";

const API_URL = import.meta.env.VITE_API_URL;

socket.on("connect", () => {
  console.log("WebSocket connected");
});

const Table = () => {
  const [tables, setTables] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTable, setNewTable] = useState({ table_number: "", seats: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const searchTimeout = useRef(null);

  // ✅ ดึงข้อมูลโต๊ะจาก API
  const fetchTables = async () => {
    setLoading(true);
    try {
      let url = `${API_URL}/api/tables`;
      const queryParams = [];
      if (search) queryParams.push(`search=${encodeURIComponent(search)}`);
      if (statusFilter)
        queryParams.push(`status=${encodeURIComponent(statusFilter)}`);
      if (queryParams.length > 0) url += `?${queryParams.join("&")}`;

      const response = await axios.get(url);
      setTables(response.data);
    } catch (error) {
      console.error("❌ ดึงข้อมูลโต๊ะผิดพลาด:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // ✅ ใช้ debounce เพื่อลด API calls
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      fetchTables();
    }, 500);
  }, [search, statusFilter]);

  useEffect(() => {
    // ✅ EventSource สำหรับอัปเดตแบบ real-time
    const eventSource = new EventSource(`${API_URL}/api/tables/updates`);
    eventSource.onmessage = (event) => {
      setTables(JSON.parse(event.data));
    };

    return () => {
      eventSource.close();
    };
  }, []);

  // ✅ ใช้การอัปเดต state แทนการ fetch ใหม่หลังจากเปลี่ยนสถานะ
  const updateTableStatus = (tableId, newStatus) => {
    setTables((prevTables) =>
      prevTables.map((table) =>
        table.table_id === tableId ? { ...table, status: newStatus } : table
      )
    );
  };

  const handleAction = async (url, successMessage, tableId, newStatus) => {
    try {
      await axios.put(url);
      Swal.fire({
        title: "✅ สำเร็จ",
        text: successMessage,
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
      updateTableStatus(tableId, newStatus);
    } catch (error) {
      console.error("❌ Error:", error.response?.data || error.message);
      Swal.fire("❌ ไม่สามารถดำเนินการได้", "กรุณาลองใหม่", "error");
    }
  };

  const handleAddTable = async () => {
    if (!newTable.table_number || !newTable.seats) {
      Swal.fire("❌ กรุณากรอกข้อมูลให้ครบ", "", "error");
      return;
    }

    // ✅ ป้องกันการเพิ่มหมายเลขโต๊ะซ้ำ
    if (tables.some((t) => t.table_number === newTable.table_number)) {
      Swal.fire("❌ หมายเลขโต๊ะนี้มีอยู่แล้ว!", "", "error");
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/api/tables`, {
        ...newTable,
        status: "available",
      });

      Swal.fire("✅ เพิ่มโต๊ะสำเร็จ!", "", "success");
      setIsModalOpen(false);
      setTables((prev) => [...prev, response.data]); // ✅ อัปเดต state ทันที
    } catch (error) {
      console.error("❌ Error:", error);
      Swal.fire("❌ ไม่สามารถเพิ่มโต๊ะได้", "กรุณาลองใหม่", "error");
    }
  };

  return (
    <div className="Table-container">
      <Navbar />
      <Sidebar />
      <div className="Table-content">
        <h1>จัดการโต๊ะอาหาร</h1>

        <button className="add-table-btn" onClick={() => setIsModalOpen(true)}>
          ➕ เพิ่มโต๊ะ
        </button>

        <div className="table-controls">
          <input
            type="text"
            placeholder="ค้นหาโต๊ะ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">ทั้งหมด</option>
            <option value="available">Available</option>
            <option value="in-use">In Use</option>
          </select>
        </div>

        {loading ? (
          <p>⏳ กำลังโหลดข้อมูล...</p>
        ) : (
          <table className="Table-data">
            <thead>
              <tr>
                <th>หมายเลขโต๊ะ</th>
                <th>จำนวนที่นั่ง</th>
                <th>สถานะ</th>
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
                    <span className={`status ${table.status}`}>
                      {table.status}
                    </span>
                  </td>
                  <td>
                    <QRCodeCanvas
                      value={`${window.location.origin}/order/${table.table_id}?guest=true`}
                      size={100}
                    />
                  </td>
                  <td>
                    <div className="button-group">
                      {table.status === "available" && (
                        <button
                          className="start-btn"
                          onClick={() =>
                            handleAction(
                              `${API_URL}/api/tables/${table.table_id}/start`,
                              "โต๊ะถูกใช้งานแล้ว",
                              table.table_id,
                              "in-use"
                            )
                          }
                        >
                          ▶ เริ่มใช้งาน
                        </button>
                      )}
                      {table.status === "in-use" && (
                        <button
                          className="reset-btn"
                          onClick={() =>
                            handleAction(
                              `${API_URL}/api/tables/${table.table_id}/reset`,
                              "โต๊ะกลับมาใช้งานได้แล้ว",
                              table.table_id,
                              "available"
                            )
                          }
                        >
                          🔄 คืนโต๊ะ
                        </button>
                      )}
                      <button
                        onClick={() =>
                          navigate(`/table-details/${table.table_id}`)
                        }
                      >
                        ℹ️ ดูรายละเอียด
                      </button>
                      <button
                        className="delete-button"
                        onClick={() =>
                          handleAction(
                            `${API_URL}/api/tables/${table.table_id}/delete`,
                            "โต๊ะถูกลบแล้ว",
                            table.table_id
                          )
                        }
                      >
                        🗑 ลบ
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>➕ เพิ่มโต๊ะใหม่</h2>
            <input
              type="text"
              placeholder="หมายเลขโต๊ะ"
              value={newTable.table_number}
              onChange={(e) =>
                setNewTable({ ...newTable, table_number: e.target.value })
              }
            />
            <input
              type="number"
              placeholder="จำนวนที่นั่ง"
              value={newTable.seats}
              onChange={(e) =>
                setNewTable({ ...newTable, seats: e.target.value })
              }
            />
            <button onClick={handleAddTable}>✅ เพิ่มโต๊ะ</button>
            <button onClick={() => setIsModalOpen(false)}>❌ ยกเลิก</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Table;
