import React from "react";
import Modal from "react-modal";
import Select from "react-select";
import "./AddMenuModal.scss"

const AddMenuModal = ({ 
  modalIsOpen, 
  setModalIsOpen, 
  menuData, 
  setMenuData, 
  categoryOptions, 
  recipes, 
  handleAddMenu 
}) => {
  return (
    <Modal
      className="modal-content"
      isOpen={modalIsOpen}
      onRequestClose={() => setModalIsOpen(false)}
    >
      <h2 className="modal-title">เพิ่มเมนู</h2>

      {/* ✅ เลือกหมวดหมู่ */}
      <Select
        className="modal-select"
        options={categoryOptions}
        value={categoryOptions.find(
          (opt) => opt.value === menuData.menu_category_id
        )}
        onChange={(e) =>
          setMenuData((prev) => ({ ...prev, menu_category_id: e.value }))
        }
        placeholder="เลือกหมวดหมู่..."
      />

      {/* ✅ เลือกสูตรอาหาร */}
      <Select
        className="modal-select"
        options={recipes.map((r) => ({
          value: r.recipe_id,
          label: r.recipe_name,
        }))}
        value={recipes.find((r) => r.recipe_id === menuData.recipe_id) || ""}
        onChange={(e) =>
          setMenuData((prev) => ({ ...prev, recipe_id: e.value }))
        }
        placeholder="เลือกสูตรอาหาร"
      />

      {/* ✅ กรอกราคา */}
      <input
        className="modal-input"
        type="number"
        placeholder="ราคา"
        value={menuData.price || ""}
        onChange={(e) =>
          setMenuData((prev) => ({ ...prev, price: e.target.value }))
        }
      />

      <button className="btn btn-save" onClick={handleAddMenu}>
        เพิ่ม
      </button>
    </Modal>
  );
};

export default AddMenuModal;
