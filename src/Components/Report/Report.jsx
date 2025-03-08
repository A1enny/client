import React, { useState, useEffect } from "react";
import Navbar from "../Layout/Navbar/Navbar";
import Sidebar from "../Layout/Sidebar/Sidebar";
import axios from "axios";
import * as XLSX from "xlsx";
import { ReportPDF } from "./ReportPDF"; // นำเข้าฟังก์ชันจากไฟล์ ReportPDF
import "./Report.scss";

const API_URL = import.meta.env.VITE_API_URL;

const Report = () => {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const salesDaily = await axios.get(`${API_URL}/api/report/sales/daily`);
      const salesByMenu = await axios.get(
        `${API_URL}/api/report/sales/by-menu`
      );

      const formattedReports = [
        ...salesDaily.data.map((item) => ({
          name: "ยอดขายรายวัน",
          date: item.date,
          type: "PDF",
          total_sales: item.total_sales,
        })),
        ...salesByMenu.data.map((item) => ({
          name: `ยอดขายเมนู: ${item.menu_name}`,
          date: new Date().toISOString().split("T")[0],
          type: "Excel",
          total_sales: item.total_sales,
        })),
      ];

      setReports(formattedReports);
      setFilteredReports(formattedReports);
    } catch (error) {
      console.error("❌ Error fetching reports:", error);
      setError("เกิดข้อผิดพลาดในการดึงข้อมูล");
    } finally {
      setLoading(false);
    }
  };

  // ฟังก์ชันกรองข้อมูล
  const filterReports = () => {
    return reports.filter((report) => {
      const matchesSearch = report.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesDate =
        (!startDate || report.date >= startDate) &&
        (!endDate || report.date <= endDate);
      return matchesSearch && matchesDate;
    });
  };
  // ฟังก์ชันดาวน์โหลดเป็น Excel
  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredReports);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Reports");
    XLSX.writeFile(wb, "รายงาน.xlsx");
  };

  // ฟังก์ชันส่งออกไปยัง Google Docs
  const exportToGoogleDocs = () => {
    const docContent = `
    รายงานยอดขาย
    ----------------------
    ${filteredReports
      .map((r) => `${r.name} | ${r.date} | ${r.total_sales} บาท`)
      .join("\n")}
  `;
    const url = `https://docs.google.com/document/create?usp=docs_web`;
    window.open(url, "_blank");
    // Send the content to Google Docs API or convert it to a .txt file and send
  };

  // ฟังก์ชันส่งออกไปยัง Google Sheets
  const exportToGoogleSheets = () => {
    const url = `https://docs.google.com/spreadsheets/create?usp=docs_web`;
    window.open(url, "_blank");
  };

  // กรองข้อมูลเมื่อมีการเปลี่ยนแปลง
  useEffect(() => {
    setFilteredReports(filterReports());
  }, [searchTerm, startDate, endDate, reports]);

  // รีเซ็ตการกรองข้อมูล
  const resetFilters = () => {
    setSearchTerm("");
    setStartDate("");
    setEndDate("");
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
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
          <button className="refresh" onClick={fetchReports}>
            🔄 โหลดใหม่
          </button>
          <button className="reset" onClick={resetFilters}>
            🔄 รีเซ็ต
          </button>
        </div>
        {loading && <div>กำลังโหลดข้อมูล...</div>}
        {error && <div className="error-message">{error}</div>}
        <div className="export-buttons">
          <button
            className="export-pdf-button"
            onClick={() => ReportPDF(filteredReports)}
          >
            📄 PDF
          </button>
          <button className="export-excel-button" onClick={exportExcel}>
            📊 Excel
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
                <td colSpan="4">ไม่มีข้อมูลรายงาน</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Report;
