import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { PlusCircle, Search, Edit, Trash2 } from "lucide-react";
import { Mode, Role } from "../helpers/_variables";
import { jwtDecode } from 'jwt-decode';
import Cookies from 'universal-cookie';

import ItemModal from '../components/ItemModal.jsx'


import "../styles/inventory.scss";


const Inventory = () => {
  const cookies = new Cookies()
  const token = cookies.get("CDIIS-OIS")
  const decoded = jwtDecode(token);

  const inventory = useSelector((state) => state.inventory);
  const dispatch = useDispatch();

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mode, setMode] = useState("ADD");
  const [itemId, setItemId] = useState("");

  const filteredInventory = inventory.filter(item =>
    item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

          {(decoded.userRole === Role.ADMIN || decoded.userRole === Role.MANAGER) && (
            <button
              onClick={() => handleAdd()}
              className="inventory__header-addBtn"
            >
              <PlusCircle size={20} className="icon" />
              Add Item
            </button>
          )}
        </div>

        <div className="inventory__search-container">
          <div className="inventory__search">
            <Search className="text-gray-400 icon" />
            <input
              id="searchbar"
              type="text"
              placeholder="Search inventory..."
              className="inventory__search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
                {(decoded.userRole === Role.ADMIN || decoded.userRole === Role.MANAGER) && (
                  <th className="inventory__data-table-column">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {filteredInventory.map((item) => (
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
                  {(decoded.userRole === Role.MANAGER || decoded.userRole === Role.ADMIN) && (
                    <td className="inventory__data-content-column actions">
                      <button
                        className="inventory__actions-edit"
                        onClick={() => handleEdit(item?._id)}
                      >
                        <Edit size={18} />
                      </button>
                      {decoded.userRole === Role.ADMIN && (
                        <button
                          className="inventory__actions-delete"
                          onClick={() => handleDelete(item?._id)}
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </td>
                  )}
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

export default Inventory;
