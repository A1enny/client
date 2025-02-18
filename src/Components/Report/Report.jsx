import React, { useState } from "react";
import Navbar from "../Layout/Navbar/Navbar";
import Sidebar from "../Layout/Sidebar/Sidebar";
import "./Report.scss";

const Report = () => {
  const [reports, setReports] = useState([
    { id: 1, name: "รายงานยอดขายประจำวัน", date: "2025-01-10", type: "PDF" },
    { id: 2, name: "รายงานยอดขายประจำเดือน", date: "2025-01-09", type: "Excel" },
    { id: 3, name: "รายงานสต็อกคงเหลือ", date: "2025-01-08", type: "PDF" },
  ]);

  const handleDownload = (report) => {
    alert(`Downloading ${report.name} (${report.type})`);
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
            placeholder="ค้นหารายงาน"
            className="search-input"
          />
          <button className="filter-button">กรองข้อมูล</button>
        </div>
        <table className="report-table">
          <thead>
            <tr>
              <th>ชื่อรายงาน</th>
              <th>วันที่</th>
              <th>ประเภทไฟล์</th>
              <th>การจัดการ</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => (
              <tr key={report.id}>
                <td>{report.name}</td>
                <td>{report.date}</td>
                <td>{report.type}</td>
                <td>
                  <button
                    className="download-button"
                    onClick={() => handleDownload(report)}
                  >
                    ดาวน์โหลด
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Report;
