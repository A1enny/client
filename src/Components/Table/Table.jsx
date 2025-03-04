import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../Api/axios";
import socket from "../../Api/socket";
import Swal from "sweetalert2";
import { QRCodeCanvas } from "qrcode.react";
import Sidebar from "../Layout/Sidebar/Sidebar";
import Navbar from "../Layout/Navbar/Navbar";
import "./Table.scss";

const API_URL = import.meta.env.VITE_API_URL;

socket.on("connect", () => console.log("✅ WebSocket connected"));

const Table = () => {
  const [tables, setTables] = useState([]);
  const [filters, setFilters] = useState({ search: "", status: "", zone: "" });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTable, setNewTable] = useState({
    table_number: "",
    seats: "",
    zone: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const searchTimeout = useRef(null);

  // ✅ ดึงข้อมูลโต๊ะจาก API
  const fetchTables = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const response = await axios.get(`${API_URL}/api/tables?${queryParams}`);
      setTables(response.data);
    } catch (error) {
      console.error("❌ ดึงข้อมูลโต๊ะผิดพลาด:", error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(fetchTables, 500);
  }, [filters, fetchTables]);

  useEffect(() => {
    const eventSource = new EventSource(`${API_URL}/api/tables/updates`);
    eventSource.onmessage = (event) => setTables(JSON.parse(event.data));
    return () => eventSource.close();
  }, []);

  const updateTableStatus = (tableId, newStatus) => {
    setTables((prev) =>
      prev.map((t) =>
        t.table_id === tableId ? { ...t, status: newStatus } : t
      )
    );
  };

  const handleTableAction = async (tableId, action, message, newStatus) => {
    try {
      await axios.put(`${API_URL}/api/tables/${tableId}/${action}`);
      Swal.fire("✅ สำเร็จ", message, "success");
      updateTableStatus(tableId, newStatus);
    } catch (error) {
      Swal.fire("❌ ผิดพลาด", "กรุณาลองใหม่", "error");
    }
  };

  const handleAddTable = async () => {
    if (!newTable.table_number || !newTable.seats || !newTable.zone) {
      Swal.fire("❌ กรุณากรอกข้อมูลให้ครบ", "", "error");
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/api/tables`, {
        ...newTable,
        status: "available",
      });

      Swal.fire("✅ เพิ่มโต๊ะสำเร็จ!", "", "success");
      setIsModalOpen(false);
      setTables((prev) => [...prev, response.data]);
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
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="">ทั้งหมด</option>
            <option value="available">Available</option>
            <option value="reserved">Reserved</option>
            <option value="in-use">In Use</option>
            <option value="needs-cleaning">Needs Cleaning</option>
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
                  <td className={`status ${table.status}`}>{table.status}</td>
                  <td>
                    <QRCodeCanvas
                      value={`${window.location.origin}/order/${table.table_id}?guest=true`}
                      size={100}
                    />
                  </td>
                  <td>
                    <button
                      onClick={() =>
                        navigate(`/table-details/${table.table_id}`)
                      }
                    >
                      ℹ️ ดูรายละเอียด
                    </button>
                    {table.status === "available" && (
                      <button
                        onClick={() =>
                          handleTableAction(
                            table.table_id,
                            "reserve",
                            "โต๊ะถูกจองแล้ว",
                            "reserved"
                          )
                        }
                      >
                        📌 จองโต๊ะ
                      </button>
                    )}
                    {table.status === "reserved" && (
                      <button
                        onClick={() =>
                          handleTableAction(
                            table.table_id,
                            "start",
                            "โต๊ะถูกใช้งานแล้ว",
                            "in-use"
                          )
                        }
                      >
                        ▶ เริ่มใช้งาน
                      </button>
                    )}
                    {table.status === "in-use" && (
                      <button
                        onClick={() =>
                          handleTableAction(
                            table.table_id,
                            "reset",
                            "โต๊ะพร้อมใช้งานแล้ว",
                            "available"
                          )
                        }
                      >
                        🔄 คืนโต๊ะ
                      </button>
                    )}
                    <button
                      className="delete-button"
                      onClick={() =>
                        handleTableAction(
                          table.table_id,
                          "delete",
                          "โต๊ะถูกลบแล้ว"
                        )
                      }
                    >
                      🗑 ลบ
                    </button>
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
