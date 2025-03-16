import React from "react";
import Modal from "react-modal";
import "./AddTableModal.scss"; // ✅ Import SCSS

const AddTableModal = ({
  isOpen,
  onClose,
  newTable,
  setNewTable,
  handleAddTable,
}) => {
  return (
    <Modal className="modal-content" isOpen={isOpen} onRequestClose={onClose}>
      <h2 className="modal-title">เพิ่มโต๊ะ</h2>

      {/* ✅ หมายเลขโต๊ะ */}
      <input
        className="modal-input"
        type="number"
        placeholder="หมายเลขโต๊ะ"
        value={newTable.table_number || ""}
        onChange={(e) =>
          setNewTable((prev) => ({ ...prev, table_number: e.target.value }))
        }
      />

      {/* ✅ จำนวนที่นั่ง */}
      <input
        className="modal-input"
        type="number"
        placeholder="จำนวนที่นั่ง"
        value={newTable.seats || ""}
        onChange={(e) =>
          setNewTable((prev) => ({ ...prev, seats: e.target.value }))
        }
      />

      {/* ✅ ปรับให้ปุ่มเรียงทางขวา */}
      <div className="modal-footer">
        <button className="btn btn-save" onClick={handleAddTable}>
          เพิ่มโต๊ะ
        </button>
        <button className="btn btn-cancel" onClick={onClose}>
          ยกเลิก
        </button>
      </div>
    </Modal>
  );
};

export default AddTableModal;
