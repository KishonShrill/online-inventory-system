import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { addRecord } from "../redux/actions/recordActions";
import { editInventory } from "../redux/actions/inventoryActions";
import { ScanIcon } from "lucide-react";
import { useSelector } from "react-redux";
import { validateRecord } from "../helpers/validate";
import QRScannerModal from "./QRScannerModal";

import axios from "axios";

const postURL =
    import.meta.env.VITE_DEVELOPMENT === "true"
        ? `http://${import.meta.env.VITE_LOCALHOST}:5000/api/records`
        : `https://cdiis-ois-server.vercel.app/api/records`;
        

const RecordModal = ({ isOpen, onClose }) => {
    const inventory = useSelector((state) => state.inventory);
	const dispatch = useDispatch();

    const [isQROpen, setIsQROpen] = useState(false)
	const [itemId, setItemId] = useState('');
    const [userName, setUserName] = useState('');
    const [userContact, setUserContact] = useState('');
    const [itemDetails, setItemDetails] = useState(null);
    const [date, setDate] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [notFound, setNotFound] = useState(false);

	const fetchItemDetailsAPI = async (itemId, inventory) => {
		console.log(`Searching for item: ${itemId}`);
		return new Promise(resolve => {
            // Find the item in the inventory array, case-insensitively.
            const item = inventory.find(i => i.id.toUpperCase() === itemId.toUpperCase());
            resolve(item || null);
		});
	};

	// Debounce effect for fetching item details
    useEffect(() => {
        if (!itemId) {
            setItemDetails(null);
            setNotFound(false);
            return;
        }

        const handler = setTimeout(() => {
            setIsLoading(true);
            setNotFound(false);
            fetchItemDetailsAPI(itemId, inventory).then(details => {
                setItemDetails(details);
                if (!details) {
                    setNotFound(true);
                }
                setIsLoading(false);
            });
        }, 500); // 500ms debounce time

        return () => {
            clearTimeout(handler);
        };
    }, [itemId, inventory]);


    useEffect(() => {
        if (!isQROpen) setItemId(""); // optional: reset itemId if scanner closes
    }, [isQROpen]);


    if (!isOpen) return null;

    const handleBorrow = (e) => {
        e.preventDefault();

        const validatedRecord = validateRecord(userName, userContact, date)

        if (!validatedRecord.isFullyValid) {
            if (!validatedRecord.validUserName) return alert(`User Name should be of proper noun format ( e.g., Juan Dela Cruz )`);
            if (!validatedRecord.validUserContact) return alert(`Contact should either be phone number or email.`);
            if (!validatedRecord.validDate) return alert(`Accepted date should be beyond today!`);
        }

		const configuration = {
			method: "post",
			url: postURL,
			data: {
                user: {
                    name: userName,
                    contact: userContact,
                },
                item: {
                    _id: itemDetails._id,
                    id: itemDetails.id,
                    name: itemDetails.name,
                },
                date: date,
				type: 'reserve',
			},
		};

        axios(configuration)
            .then((res) => {
                console.log(res.data);
                dispatch(addRecord(res.data.result))
                dispatch(editInventory(res.data.result.item._id, {status: "Reserved"}))
                alert(`Record for ${itemDetails.name} created for ${userName} @ ${date}!`);
            })
            .catch((err) => {
                console.log(err);
                alert(err.response.data.message);
            })

        // Here you would handle the logic for borrowing the item
        onClose(); // Close modal on successful borrow
    };
    
    const canBorrow = itemDetails && itemDetails.status === 'Available' && userName && userContact;

	return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <button className="modal-close-btn" onClick={onClose}>&times;</button>
                <h2 className="modal-header">Add New Borrow Record</h2>
                
                <form onSubmit={handleBorrow}>
                    <div className="form-group">
                        <label className="form-label" htmlFor="itemId">
                            Item ID 
                            {isLoading && <div className="loading-spinner"></div>}
                        </label>
                        <div className="input-group">
                            <input
                                type="text"
                                id="itemId"
                                className="form-input"
                                value={itemId}
                                onChange={(e) => setItemId(e.target.value)}
                                placeholder="Type or scan item ID (e.g., EQP-0001)"
                                autoFocus
                            />
                            <button type="button" className="scan-btn" title="Scan QR code" onClick={() => setIsQROpen(prev => !prev)}>
                                <ScanIcon />
                            </button>
                        </div>
                    </div>

                    {isQROpen && (
                        <QRScannerModal
                            onDetected={(scannedText) => {
                                setItemId(scannedText); // sets the input
                                const item = inventory.find(i => i.id.toUpperCase() === scannedText.toUpperCase());
                                if (item) setIsQROpen(false); // close scanner if found
                            }}
                        />
                    )}
                    
                    {/* Item details dropdown now shows richer data */}
                    {itemDetails && (
                        <div className="item-details-dropdown">
                            <p><span>Item Name:</span> {itemDetails.name}</p>
                            <p><span>Category:</span> {itemDetails.category}</p>
                            <p>
                                <span>Status: </span> 
                                <span className={itemDetails.status === 'Available' ? 'status-available' : 'status-borrowed'}>
                                    {itemDetails.status}
                                </span>
                            </p>
                            <p><span>Sub-items:</span></p>
                            <ul className="item-details-list">
                                {itemDetails.items.map((subItem, index) => (
                                    <li key={index}>{subItem.name} ({subItem.quantity})</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {notFound && (
                         <div className="item-details-dropdown not-found">
                            <p>Item with ID "<span>{itemId}</span>" not found.</p>
                         </div>
                    )}

                    <div className="form-group">
                        <label className="form-label" htmlFor="userName">User Name</label>
                        <input
                            type="text"
                            id="userName"
                            className="form-input"
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            placeholder="Enter borrower's full name"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="userContact">User Contact Information</label>
                        <input
                            type="text"
                            id="userContact"
                            className="form-input"
                            value={userContact}
                            onChange={(e) => setUserContact(e.target.value)}
                            placeholder="Enter phone or email"
                        />
                    </div>

					<div className="form-group">
						<label className="form-label" htmlFor="reserveDate">Reserve Date:</label>
						<input 
							type="date" 
							id="reserveDate"
							className="form-input"
							value={date}
							onChange={(e) => setDate(e.target.value)}
						/>
					</div>
                    
                    <div className="modal-actions">
                        <button type="button" className="modal-btn modal-btn-cancel" onClick={onClose}>Cancel</button>
                        <button type="submit" className="modal-btn modal-btn-borrow" disabled={!canBorrow}>
                            Borrow
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default RecordModal