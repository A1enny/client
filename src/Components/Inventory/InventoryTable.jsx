import React from "react";
import "./InventoryTable.scss";

const InventoryTable = ({ activeTab, data, onEditIngredient, onDeleteIngredient, onEditBatch, onDeleteBatch, onViewBatch }) => {
  return (
    <div className="inventory-table">
      <table>
        <thead>
          <tr>
            {activeTab === "batches" ? (
              <>
                <th>📑 รหัสล็อต</th>
                <th>📅 วันที่รับเข้า</th>
                <th>⏳ วันหมดอายุ</th>
                <th>🟢 สถานะ</th>
                <th>⚙️ จัดการ</th>
              </>
            ) : (
              <>
                <th>📑 รหัสวัตถุดิบ</th>
                <th>📌 ชื่อวัตถุดิบ</th>
                <th>📦 หมวดหมู่</th>
                <th>📅 วันที่รับเข้า</th>
                <th>📊 ทั้งหมด</th>
                <th>⏳ วันที่หมดอายุ</th>
                <th>🟢 สถานะ</th>
                <th>⚙️ จัดการ</th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => {
            const receivedDate =
              item.received_date && item.received_date !== "N/A"
                ? new Date(item.received_date).toLocaleDateString("th-TH")
                : "N/A";

            const expirationDate =
              item.expiration_date && item.expiration_date !== "N/A"
                ? new Date(item.expiration_date).toLocaleDateString("th-TH")
                : "N/A";

            const today = new Date();
            const expireDate = new Date(item.expiration_date);
            let status = item.status || "ปกติ";

            if (expireDate <= today) {
              status = "หมดอายุแล้ว";
            } else if (expireDate - today <= 3 * 24 * 60 * 60 * 1000) {
              status = "ใกล้หมดอายุ";
            }

            return (
              <tr key={index}>
                {activeTab === "batches" ? (
                  <>
                    <td>{item.batch_id}</td>
                    <td>{receivedDate}</td>
                    <td>{expirationDate}</td>
                    <td>
                      <span className={`status ${status}`}>{status}</span>
                    </td>
                    <td>
                      <button className="view-btn" onClick={() => onViewBatch(item)}>
                        🔍 ดูรายละเอียด
                      </button>
                      <button className="edit-btn" onClick={() => onEditBatch(item)}>
                        ✏️ แก้ไข
                      </button>
                      <button className="delete-btn" onClick={() => onDeleteBatch(item.batch_id)}>
                        🗑 ลบ
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td>{item.material_id}</td>
                    <td>{item.material_name || "ไม่ระบุ"}</td>
                    <td>{item.category_name || "ไม่ระบุ"}</td>
                    <td>{receivedDate}</td>
                    <td>{`${item.total_quantity || 0} g`}</td>
                    <td>{expirationDate}</td>
                    <td>
                      <span className={`status ${status}`}>{status}</span>
                    </td>
                    <td>
                      <button className="edit-btn" onClick={() => onEditIngredient(item)}>
                        ✏️ แก้ไข
                      </button>
                      <button className="delete-btn" onClick={() => onDeleteIngredient(item.material_id)}>
                        🗑 ลบ
                      </button>
                    </td>
                  </>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default InventoryTable;