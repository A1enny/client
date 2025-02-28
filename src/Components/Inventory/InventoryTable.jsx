import { FaEdit, FaTrash, FaInfoCircle } from "react-icons/fa";
import "./InventoryTable.scss";

const InventoryTable = ({ data, type, handleDelete, handleDetail }) => {
  const getStatus = (expirationDate) => {
    if (!expirationDate || expirationDate === "N/A") return "ปกติ";
    const today = new Date();
    const expDate = new Date(expirationDate);
    const diffDays = (expDate - today) / (1000 * 60 * 60 * 24);

    if (diffDays < 0) return "หมดอายุแล้ว";
    if (diffDays <= 7) return "ใกล้หมดอายุ";
    return "ปกติ";
  };

  const getStatusColor = (status) => {
    if (status === "ปกติ") return "🟢";
    if (status === "ใกล้หมดอายุ") return "🟡";
    return "🔴";
  };

  return (
    <table className="inventory-table">
      <thead>
        <tr>
          <th>📑 {type === "batches" ? "รหัสล็อต" : "รหัสวัตถุดิบ"}</th>
          <th>📌 ชื่อวัตถุดิบ</th>
          <th>📦 หมวดหมู่</th>
          <th>📅 วันที่รับเข้า</th>
          <th>📊 ใช้ไปแล้ว / ทั้งหมด</th>
          <th>⏳ วันที่หมดอายุ</th>
          <th>🟢 สถานะ</th>
          <th>⚙️ จัดการ</th>
        </tr>
      </thead>
      <tbody>
        {data.length > 0 ? (
          data.map((item) => {
            const status = getStatus(item.expiration_date);
            const percentageUsed =
              item.quantity && item.quantity > 0
                ? ((item.used_quantity / item.quantity) * 100).toFixed(0) + "%"
                : "0%";

            return (
              <tr key={item.batch_id || item.material_id}>
                <td>{type === "batches" ? item.batch_id : item.material_id}</td>
                <td>{item.material_name}</td>
                <td>{item.category_name || "ไม่ระบุหมวดหมู่"}</td>
                <td>{item.received_date || "N/A"}</td>
                <td>
                  {item.used_quantity || 0}g / {item.quantity}g{" "}
                  <span className={`progress ${status}`}>
                    ({percentageUsed})
                  </span>
                </td>
                <td>{item.expiration_date || "N/A"}</td>
                <td style={{ fontWeight: "bold" }}>
                  {getStatusColor(status)} {status}
                </td>
                <td>
                  <button className="edit-btn">
                    <FaEdit /> แก้ไข
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(item)} // ส่งข้อมูลที่ถูกต้องไป
                  >
                    <FaTrash /> ลบ
                  </button>
                  <button
                    className="detail-btn"
                    onClick={() => handleDetail(item)}
                  >
                    <FaInfoCircle /> รายละเอียด
                  </button>
                </td>
              </tr>
            );
          })
        ) : (
          <tr>
            <td colSpan="8" style={{ textAlign: "center" }}>
              ไม่มีข้อมูล
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
};

export default InventoryTable;
