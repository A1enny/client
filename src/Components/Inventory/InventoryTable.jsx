import React from "react";
import "./InventoryTable.scss";

const InventoryTable = ({ data, onEditIngredient, onDeleteIngredient }) => {
  return (
    <div className="inventory-table">
      <table>
        <thead>
          <tr>
            <th>📑 รหัสวัตถุดิบ</th>
            <th>📌 ชื่อวัตถุดิบ</th>
            <th>📦 หมวดหมู่</th>
            <th>📅 วันที่รับเข้า</th>
            <th>📊 ทั้งหมด</th>
            <th>⏳ วันที่หมดอายุ</th>
            <th>🟢 สถานะ</th>
            <th>⚙️ จัดการ</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => {
            console.log(`📝 รายการที่ ${index + 1}:`, item); // ✅ ตรวจสอบข้อมูลแต่ละแถว

            const receivedDate =
              item.received_date && item.received_date !== "N/A"
                ? new Date(item.received_date).toLocaleDateString("th-TH")
                : "N/A";

            const expirationDate =
              item.expiration_date && item.expiration_date !== "N/A"
                ? new Date(item.expiration_date).toLocaleDateString("th-TH")
                : "N/A";

            return (
              <tr key={index}>
                <td>{item.material_id}</td>
                <td>{item.material_name || "ไม่ระบุ"}</td>
                <td>{item.category_name || "ไม่ระบุ"}</td>
                <td>{receivedDate}</td>
                <td>{`${item.total_quantity || 0} g`}</td>
                <td>{expirationDate}</td>
                <td>
                  <span className={`status ${item.status}`}>
                    {item.status || "N/A"}
                  </span>
                </td>
                <td>
                  <button
                    className="edit-btn"
                    onClick={() => onEditIngredient(item)}
                  >
                    ✏️ แก้ไข
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => onDeleteIngredient(item.material_id)}
                  >
                    🗑 ลบ
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default InventoryTable;
