import jsPDF from "jspdf";
import "jspdf-autotable";
import { font } from "./THSarabunNew-normal";

export const ReportPDF = (filteredReports) => {
  const doc = new jsPDF();

  // เพิ่มฟอนต์ THSarabunNew-normal
  doc.addFileToVFS("MyFont.ttf", font); // เพิ่มฟอนต์ Base64 ที่นี่
  doc.addFont("MyFont.ttf", "MyFont", "normal"); // ใช้ฟอนต์นี้
  doc.setFont("MyFont"); // เลือกฟอนต์ที่ใช้    

  let width = doc.internal.pageSize.getWidth();

  // ทดสอบการแสดงภาษาไทย
  doc.text("รายงานทั้งหมด", width / 2, 10, { align: 'center' });
  doc.text("วันที่: " + new Date().toLocaleDateString(), width / 2, 15, { align: 'center' });

  // สร้างเนื้อหาของตาราง
  const content = {
    startY: 20,
    head: [['ชื่อรายงาน', 'วันที่', 'ประเภทไฟล์', 'ยอดขายรวม']],
    styles:{font:'MyFont'},
    body: filteredReports.map(report => [
      report.name,
      report.date,
      report.type,
      `${report.total_sales} บาท`
    ]),
  };

  // เพิ่มตารางใน PDF
  doc.autoTable(content);

  // บันทึกไฟล์ PDF
  doc.save("รายงาน.pdf");
};
