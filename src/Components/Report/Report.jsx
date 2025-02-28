import React, { useState, useEffect } from "react";
import Navbar from "../Layout/Navbar/Navbar";
import Sidebar from "../Layout/Sidebar/Sidebar";
import axios from "axios";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import "./Report.scss";

const API_URL = import.meta.env.VITE_API_URL;

const Report = () => {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const salesDaily = await axios.get(`${API_URL}/api/report/sales/daily`);
        const salesByMenu = await axios.get(`${API_URL}/api/report/sales/by-menu`);

        const formattedReports = [
          ...salesDaily.data.map((item) => ({
            name: "ยอดขายรายวัน",
            date: item.date,
            type: "PDF",
            total_sales: item.total_sales,
          })),
          ...salesByMenu.data.map((item) => ({
            name: `ยอดขายเมนู: ${item.menu_name}`,
            date: new Date().toISOString().split("T")[0], // ใช้วันที่ปัจจุบัน
            type: "Excel",
            total_sales: item.total_sales,
          })),
        ];

        setReports(formattedReports);
        setFilteredReports(formattedReports);
      } catch (error) {
        console.error("❌ Error fetching reports:", error);
      }
    };

    fetchReports();
  }, []);

  // ฟังก์ชันค้นหารายงาน
  useEffect(() => {
    const filtered = reports.filter((report) =>
      report.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredReports(filtered);
  }, [searchTerm, reports]);

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("รายงานทั้งหมด", 20, 10);
    doc.autoTable({
      head: [["ชื่อรายงาน", "วันที่", "ประเภทไฟล์", "ยอดขายรวม"]],
      body: filteredReports.map((report) => [report.name, report.date, report.type, report.total_sales]),
    });
    doc.save("รายงาน.pdf");
  };

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredReports);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Reports");
    XLSX.writeFile(wb, "รายงาน.xlsx");
  };

  return (
    <div className="report-container">
      <Navbar />
      <Sidebar />
      <div className="report-content">
        <div className="reportheader">
          <h1>ออกรายงาน</h1>
        </div>
        <div className="report-filters">
          <input
            type="text"
            placeholder="ค้นหารายงาน..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="filter-button">กรองข้อมูล</button>
        </div>
        <div className="export-buttons">
          <button className="export-pdf-button" onClick={exportPDF}>
            ดาวน์โหลด PDF
          </button>
          <button className="export-excel-button" onClick={exportExcel}>
            ดาวน์โหลด Excel
          </button>
        </div>
        <table className="report-table">
          <thead>
            <tr>
              <th>ชื่อรายงาน</th>
              <th>วันที่</th>
              <th>ประเภทไฟล์</th>
              <th>ยอดขายรวม</th>
            </tr>
          </thead>
          <tbody>
            {filteredReports.length > 0 ? (
              filteredReports.map((report, index) => (
                <tr key={index}>
                  <td>{report.name}</td>
                  <td>{report.date}</td>
                  <td>{report.type}</td>
                  <td>{report.total_sales} บาท</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" style={{ textAlign: "center", color: "gray" }}>
                  ไม่มีข้อมูลรายงาน
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Report;
