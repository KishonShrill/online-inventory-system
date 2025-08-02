import { useState, useEffect, useRef } from "react";

import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { editRecord } from '../../redux/actions/recordActions';
import { editInventory } from "../../redux/actions/inventoryActions";

const postURL =
    import.meta.env.VITE_DEVELOPMENT === "true"
        ? `http://${import.meta.env.VITE_LOCALHOST}:5000/api/records`
        : `https://cdiis-ois-server.vercel.app/api/records`;

const ReturnItemModal = ({ isOpen, onClose, record }) => {
    const [item, setItem] = useState(null);
    const [components, setComponents] = useState({});
    const items = useSelector((state) => state.inventory);
    const textareaRef = useRef(null)
    const dispatch = useDispatch()

    useEffect(() => {
        if (items && record?.item?.id) {
            const foundItem = items.find((i) => i?.id === record.item.id);

            const itemComponents = {};
            foundItem.items?.forEach((subItem) => {
                itemComponents[subItem.name] = false;
            });

            setItem(foundItem)
            setComponents(itemComponents)
        }
    }, [items, record]);

    const handleSubItemCheck = (subItemName) => {
        setComponents((prev) => ({
            ...prev,
            [subItemName]: !prev[subItemName],
        }));
    };

    const handleReturn = (e) => {
        e.preventDefault();

        const isConfirmed = confirm(`Are you sure about this record?`)
        if (!isConfirmed) {
            return;
        }

        const feedbackText = textareaRef.current.value.trim()
        const allChecked = Object.values(components).every(Boolean);

        const feedback = feedbackText !== ""
            ? feedbackText
            : allChecked
                ? "All is well!"
                : "Some components are missing!";
        // console.log(feedback)

        const dateToday = new Date().toLocaleDateString('en-CA');

        const configuration = {
            method: "post",
            url: postURL,
            data: {
                _id: record?._id,
                item: {
                    id: record?.item.id,
                },
                returned_items: components,
                feedback,
                date: dateToday,
                type: 'returned',
            }
        }

        axios(configuration)
            .then((res) => {
                console.log(res.data)
                dispatch(editRecord(res.data.result.updatedRecord))
                dispatch(editInventory(res.data.result.returnedItem[0]._id, { status: res.data.result.returnedItem[0].status }))
            })
            .catch((err) => {
                console.log(err);
                alert(err.response.data.message);
            })

        setItem(null)
        onClose();
    }

    if (!isOpen) return null;

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <button className="modal-close-btn" onClick={onClose}>&times;</button>
                <h2 className="modal-header">Return Gadget Record</h2>

                <form onSubmit={handleReturn}>
                    <div className="form-group">
                        <label htmlFor="itemId" className="form-label">Returned Item:</label>
                        <div className="input-group">
                            <input
                                type="text"
                                id="itemId"
                                className="form-input"
                                defaultValue={`${record?.item.name} (${record?.item.id})`}
                                readOnly
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="itemComponents" className="form-label">Item Components:</label>
                        <ul id="itemComponents">
                            {item?.items.map((subItem, i) => (
                                <label
                                    key={subItem.name}
                                    className="form-checkbox"
                                >
                                    <span className="">
                                        {i + 1}. {subItem.name}
                                    </span>
                                    <input
                                        type="checkbox"
                                        checked={components[subItem.name] || false}
                                        onChange={() => handleSubItemCheck(subItem.name)}
                                        className="form-input"
                                    />
                                </label>
                            ))}
                        </ul>
                    </div>

                    <div className="form-group">
                        <label htmlFor="feedbackId" className="form-label">Feedback:</label>
                        <textarea
                            ref={textareaRef}
                            name="feedback"
                            id="feedbackId"
                            className="form-textarea"
                            placeholder="e.g., The charger is damaged"
                        ></textarea>
                    </div>

                    <div className="form-group submit">
                        <button type="submit" className="modal-btn actions-add">Submit</button>
                    </div>
                </form>
            </div>
        </div>
    )
};

export default ReturnItemModal