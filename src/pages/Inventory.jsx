import { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  addInventory,
  editInventory,
  removeInventory,
} from "../redux/actions/inventoryActions";
import { PlusCircle, Search, Edit, Trash2 } from "lucide-react";
import axios from "axios";

import "../styles/inventory.scss";

const Mode = {
  ADD: "ADD",
  UPDATE: "UPDATE",
  DELETE: "DELETE",
};

const Inventory = () => {
  const inventory = useSelector((state) => state.inventory);
  const dispatch = useDispatch();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mode, setMode] = useState("ADD");
  const [itemId, setItemId] = useState("");

  function handleAdd() {
    setItemId("");
    setMode(Mode.ADD);
    setIsModalOpen(true);
  }

  function handleEdit(itemId) {
    // console.log(itemId)
    setItemId(itemId);
    setMode(Mode.UPDATE);
    setIsModalOpen(true);
  }

  function handleDelete(itemId) {
    setItemId(itemId);
    setMode(Mode.DELETE);
    setIsModalOpen(true);
  }

  return (
    <>
      <title>CDIIS OIS - Inventory</title>
      <main>
        <div className="inventory__header">
          <h1 className="inventory__header-title">Inventory</h1>
          <button
            onClick={() => handleAdd()}
            className="inventory__header-addBtn"
          >
            <PlusCircle size={20} className="icon" />
            Add Item
          </button>
        </div>

        <div className="inventory__search-container">
          <div className="inventory__search">
            <Search className="text-gray-400 icon" />
            <input
              id="searchbar"
              type="text"
              placeholder="Search inventory..."
              className="inventory__search-input"
            />
          </div>
        </div>

        <div className="inventory__data-container">
          <table className="inventory__data-table">
            <thead className="inventory__data-table-header">
              <tr>
                <th className="inventory__data-table-column">ID</th>
                <th className="inventory__data-table-column">Name</th>
                <th className="inventory__data-table-column">Category</th>
                <th className="inventory__data-table-column">Date Added</th>
                <th className="inventory__data-table-column">Actions</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((item) => (
                <tr
                  key={item?._id}
                  className="border-b border-gray-200 hover:bg-gray-50"
                >
                  <td className="inventory__data-content-column">{item?.id}</td>
                  <td className="inventory__data-content-column">
                    {item?.name}
                  </td>
                  <td className="inventory__data-content-column">
                    <span className={`category`}>{item?.category}</span>
                  </td>
                  <td className="inventory__data-content-column">
                    {item?.date_added.split("T")[0]}
                  </td>
                  <td className="inventory__data-content-column actions">
                    <button
                      className="inventory__actions-edit"
                      onClick={() => handleEdit(item?._id)}
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      className="inventory__actions-delete"
                      onClick={() => handleDelete(item?._id)}
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {isModalOpen && (
          <ItemModal
            onClose={() => setIsModalOpen(false)}
            initialInventory={inventory}
            itemId={itemId}
            mode={mode}
            dispatch={dispatch}
          />
        )}
      </main>
    </>
  );
};

const ItemModal = ({ onClose, initialInventory, itemId, mode, dispatch }) => {
  const [removeMode, setRemoveMode] = useState(false);
  const nameRef = useRef();
  const descRef = useRef();
  const colorRef = useRef();
  const categoryRef = useRef();

  const item = useSelector((state) =>
    state.inventory.find((i) => i._id === itemId)
  );
  const isItemNumber = String(itemId || ""); // Ensure password is a string and handle null/undefined

  let title = "Add New Item"; // default
  let submitBtnText = "Add Item";

  let initialData = {
    name: "",
    description: "",
    color: "N/A",
    category: "",
  };

  useEffect(() => {
    if (mode === Mode.DELETE) {
      setRemoveMode(true);
    }
  }, [mode]);

  // Initialize Modal
  switch (mode) {
    case Mode.ADD:
      title = "Add New Item";
      submitBtnText = "Create";

      break;

    case Mode.UPDATE:
      if (isItemNumber.length <= 0) {
        alert("No Item# is given...");
        return;
      }

      if (!item) {
        alert("Item not found");
        return null;
      }

      title = "Update Item";
      submitBtnText = "Edit";
      initialData = {
        name: item.name,
        description: item.description,
        color: item.color ?? "N/A",
        category: item.category,
      };
      break;

    case Mode.DELETE:
      title = "Delete Item";
      submitBtnText = "Delete";
      initialData = {
        name: item.name,
        description: item.description,
        color: item.color ?? "N/A",
        category: item.category,
      };
      break;

    default:
      alert("'mode' should either be ADD or EDIT");
      return;
  }

  // A real implementation would use a proper QR code library
  const generateQrCode = (id) =>
    `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${id}`;
  const newItemId = `EQP-${String(initialInventory.length + 1).padStart(
    3,
    "0"
  )}`;

  function handleSubmit(e) {
    e.preventDefault();

    const name = nameRef.current.value.trim();
    const description = descRef.current.value.trim();
    const color = colorRef.current.value.trim();
    const category = categoryRef.current.value.trim();

    if (!name || !color || !category) {
      alert("Name, Color, and Category are required.");
      return;
    }

    if (
      mode === Mode.UPDATE &&
      name === initialData.name &&
      description === initialData.description &&
      color === initialData.color &&
      category === initialData.category
    ) {
      alert("No changes were made.");
      return;
    }

    const postURL =
      import.meta.env.VITE_DEVELOPMENT === "true"
        ? `http://${import.meta.env.VITE_LOCALHOST}:5000/api/items`
        : `https://cdiis-ois-server.vercel.app/api/items`;

    const confirguation = removeMode
      ? {
          method: "delete",
          url: postURL,
          data: {
            id: itemId,
            type: mode,
          },
        }
      : {
          method: "post",
          url: postURL,
          data: {
            _id: itemId,
            id: newItemId,
            name: name,
            description: description,
            category: category,
            color: color,
            date_added: new Date().toISOString(),
            type: mode,
          },
        };

    axios(confirguation)
      .then((res) => {
        // console.log(res.data)
        // console.log(JSON.stringify(res.data.result))
        if (res.data.type === Mode.ADD) dispatch(addInventory(res.data.result));
        if (res.data.type === Mode.UPDATE)
          dispatch(editInventory(res.data.result));
        if (res.data.type === Mode.DELETE)
          dispatch(removeInventory(res.data.result));
        alert(res.data.message);
        onClose();
      })
      .catch((err) => {
        console.log(err);
        alert(err.response.data.message);
      });
  }

  return (
    <>
      <div className="inventory__modal-container">
        <div className="inventory__modal">
          <h3 className="inventory__modal-title">{title}</h3>
          <form onSubmit={handleSubmit}>
            <div className="modal-input-container">
              <label className="inventory__modal-label" htmlFor="name">
                Item Name
              </label>
              <input
                ref={nameRef}
                className="inventory__modal-input input"
                id="name"
                type="text"
                placeholder="e.g. MacBook Pro"
                defaultValue={initialData.name}
                autoComplete="false"
                required
                readOnly={removeMode || mode === Mode.UPDATE}
                style={
                  mode === Mode.UPDATE || removeMode
                    ? { cursor: "not-allowed" }
                    : null
                }
              />
            </div>
            <div className="modal-input-container">
              <label className="inventory__modal-label" htmlFor="description">
                Description
              </label>
              <textarea
                ref={descRef}
                className="inventory__modal-input input"
                id="description"
                placeholder="Any relevant details"
                defaultValue={initialData.description}
                readOnly={removeMode}
                style={mode === Mode.DELETE ? { cursor: "not-allowed" } : null}
              ></textarea>
            </div>
            <div className="grid-2-cols modal-input-container">
              <div>
                <label className="inventory__modal-label" htmlFor="color">
                  Color
                </label>
                <input
                  ref={colorRef}
                  className="inventory__modal-input"
                  list="colors"
                  id="color"
                  type="text"
                  placeholder="e.g. Silver"
                  defaultValue={initialData.color}
                  required
                  readOnly={removeMode}
                  style={
                    mode === Mode.DELETE ? { cursor: "not-allowed" } : null
                  }
                />
                <datalist id="colors">
                  <option value="Red" />
                  <option value="Green" />
                  <option value="Blue" />
                  <option value="Yellow" />
                  <option value="Black" />
                </datalist>
              </div>
              <div>
                <label className="inventory__modal-label" htmlFor="category">
                  Category
                </label>
                <input
                  ref={categoryRef}
                  className="inventory__modal-input"
                  id="category"
                  type="text"
                  placeholder="e.g. Electronics"
                  defaultValue={initialData.category}
                  required
                  readOnly={removeMode}
                  style={
                    mode === Mode.DELETE ? { cursor: "not-allowed" } : null
                  }
                />
              </div>
            </div>

            <div className="modal-qr-container">
              <p className="modal-qr-description">
                Generated QR Code for ID: {newItemId}
              </p>
              <img
                src={generateQrCode(newItemId)}
                alt="QR Code"
                className="modal-qr-image"
              />
            </div>

            <div className="modal-actions-container">
              <button
                onClick={onClose}
                type="button"
                className="modal-actions-cancel"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="modal-actions-add"
                style={removeMode ? { backgroundColor: "red" } : undefined}
              >
                {submitBtnText}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default Inventory;
