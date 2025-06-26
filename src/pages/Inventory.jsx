import { useState } from "react";
import { useSelector } from 'react-redux';
import { PlusCircle, Search, Edit, Trash2 } from "lucide-react";

import '../styles/inventory.scss'

const Inventory = () => {
    const inventory = useSelector(state => state.inventory);
    // const dispatch = useDispatch();

    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            <title>CDIIS OIS - Inventory</title>
            <main>
                <div className="inventory__header">
                    <h1 className="inventory__header-title">Inventory</h1>
                    <button onClick={() => setIsModalOpen(true)} className="inventory__header-addBtn">
                        <PlusCircle size={20} className="icon"/>
                        Add Item
                    </button>
                </div>

                <div className="inventory__search-container">
                    <div className="inventory__search">
                        <Search className="text-gray-400 icon"/>
                        <input type="text" placeholder="Search inventory..." className="inventory__search-input"/>
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
                                <tr key={item._id} className="border-b border-gray-200 hover:bg-gray-50">
                                    <td className="inventory__data-content-column">{item.id}</td>
                                    <td className="inventory__data-content-column">{item.name}</td>
                                    <td className="inventory__data-content-column">
                                        <span className={`category`}>{item.category}</span>
                                    </td>
                                    <td className="inventory__data-content-column">{item.date_added}</td>
                                    <td className="inventory__data-content-column actions">
                                        <button className="inventory__actions-edit"><Edit size={18}/></button>
                                        <button className="inventory__actions-delete"><Trash2 size={18}/></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {isModalOpen && <AddItemModal onClose={() => setIsModalOpen(false)} initialInventory={inventory} />}
            </main>
        </>
    )
}

const AddItemModal = ({ onClose, initialInventory }) => {
    // A real implementation would use a proper QR code library
    const generateQrCode = (id) => `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${id}`;

    const newItemId = `EQP-${String(initialInventory.length + 1).padStart(3, '0')}`;

    return (
        <>
            <div className="inventory__modal-container">
                <div className="inventory__modal">
                    <h3 className="inventory__modal-title">Add New Item</h3>
                    <form>
                        <div className="modal-input-container">
                            <label className="inventory__modal-label" htmlFor="name">Item Name</label>
                            <input className="inventory__modal-input input" id="name" type="text" placeholder="e.g. MacBook Pro"/>
                        </div>
                        <div className="modal-input-container">
                            <label className="inventory__modal-label" htmlFor="description">Description</label>
                            <textarea className="inventory__modal-input input" id="description" placeholder="Any relevant details"></textarea>
                        </div>
                        <div className="grid-2-cols modal-input-container">
                            <div>
                            <label className="inventory__modal-label" htmlFor="color">Color</label>
                            <input className="inventory__modal-input" id="color" type="text" placeholder="e.g. Silver"/>
                            </div>
                            <div>
                            <label className="inventory__modal-label" htmlFor="category">Category</label>
                            <input className="inventory__modal-input" id="category" type="text" placeholder="e.g. Electronics"/>
                            </div>
                        </div>

                        <div className="modal-qr-container">
                            <p className="modal-qr-description">Generated QR Code for ID: {newItemId}</p>
                            <img src={generateQrCode(newItemId)} alt="QR Code" className="modal-qr-image"/>
                        </div>

                        <div className="modal-actions-container">
                            <button onClick={onClose} type="button" className="modal-actions-cancel">Cancel</button>
                            <button type="submit" className="modal-actions-add">Add Item</button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default Inventory