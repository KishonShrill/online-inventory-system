import { useState, useEffect, useRef, useMemo } from "react";
import axios from "axios";
import { editRecord } from '../../redux/actions/recordActions';
import { editInventory } from "../../redux/actions/inventoryActions";
import { useSelector, useDispatch } from "react-redux";
import { useSortableData } from "../../helpers/sortUtils";
import SearchInput from "../../components/SearchInput";
import { Role } from "../../helpers/_variables";
import { filterBySearchQuery } from "../../helpers/inputUtils";

const postURL =
    import.meta.env.VITE_DEVELOPMENT === "true"
        ? `http://${import.meta.env.VITE_LOCALHOST}:5000/api/records`
        : `https://cdiis-ois-server.vercel.app/api/records`;

const BorrowTable = ({ decoded }) => {
    const [searchQueryBorrow, setSearchQueryBorrow] = useState('');
    const [debouncedBorrowQuery, setDebouncedBorrowQuery] = useState('');
    const [chosenRecord, setChosenRecord] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const records = useSelector((state) => state.record);
    const borrowedRecords = records.filter(item => {
        return (
            item.type?.toLowerCase().includes("borrow") ||
            item.type?.toLowerCase().includes("returned")
        )
    })

    const handleReturn = (record) => {
        setChosenRecord(record);
        setIsModalOpen(true)
    };

    const closeReturnModal = () => {
        setIsModalOpen(false);
    };

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedBorrowQuery(searchQueryBorrow.trim());
        }, 300); // 300ms debounce

        return () => clearTimeout(handler);
    }, [searchQueryBorrow]);

    const { items: sortedBorrowedRecords, requestSort: requestBorrowedSort, getSortDirectionClass: getBorrowedClass } = useSortableData(borrowedRecords, { key: 'type', direction: 'ascending' });

    const filteredBorrows = useMemo(() => {
        return filterBySearchQuery(
            sortedBorrowedRecords,
            debouncedBorrowQuery,
            ['item.name', 'user.name', 'due_date']
        );
    }, [sortedBorrowedRecords, debouncedBorrowQuery]);


    return (
        <>
            <h3 style={{ marginLeft: "1rem", marginBottom: "1rem", textDecoration: "underline", cursor: "default" }}>Borrowed</h3>
            <SearchInput value={searchQueryBorrow} onChange={(e) => setSearchQueryBorrow(e.target.value)} />
            <div className="records__table-container">
                <table className="records__table">
                    <thead className="records__table-header">
                        <tr>
                            <th className="records__table-header-column" title={`${getBorrowedClass('due_date')}`}>
                                <button type="button" onClick={() => requestBorrowedSort('item.name')} className={`sort-button ${getBorrowedClass('item.name')}`}>
                                    Item Name
                                </button>
                            </th>
                            <th className="records__table-header-column" title={`${getBorrowedClass('user.name')}`}>
                                <button type="button" onClick={() => requestBorrowedSort('user.name')} className={`sort-button ${getBorrowedClass('user.name')}`}>
                                    User
                                </button>
                            </th>
                            <th className="records__table-header-column" title={`${getBorrowedClass('start_date')}`}>
                                <button type="button" onClick={() => requestBorrowedSort('start_date')} className={`sort-button ${getBorrowedClass('start_date')}`}>
                                    Borrowed On
                                </button>
                            </th>
                            <th className="records__table-header-column" title={`${getBorrowedClass('due_date')}`}>
                                <button type="button" onClick={() => requestBorrowedSort('due_date')} className={`sort-button ${getBorrowedClass('due_date')}`}>
                                    Due Date
                                </button>
                            </th>
                            <th className="records__table-header-column" title={`${getBorrowedClass('returned_on')}`}>
                                <button type="button" onClick={() => requestBorrowedSort('returned_on')} className={`sort-button ${getBorrowedClass('returned_on')}`}>
                                    Returned On
                                </button>
                            </th>
                            <th className="records__table-header-column" title={`${getBorrowedClass('type')}`}>
                                <button type="button" onClick={() => requestBorrowedSort('type')} className={`sort-button ${getBorrowedClass('type')}`}>
                                    Status
                                </button>
                            </th>
                            {(decoded.userRole === Role.ADMIN || decoded.userRole === Role.MANAGER) && (
                                <th className="records__table-header-column">Actions</th>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredBorrows
                            .map((record) => (
                                <tr key={record._id} className="records__table-data-row" title={`${record?.item.name} (${record?.user.name})`}>
                                    <td className="records__table-data-column">{record.item.name} ({record.item.id})</td>
                                    <td className="records__table-data-column">{record.user.name} ({record.user.contact})</td>
                                    <td className="records__table-data-column">{record.start_date?.split("T")[0]}</td>
                                    <td className="records__table-data-column">{record.due_date?.split("T")[0]}</td>
                                    <td className="records__table-data-column">{record?.returned_on?.split("T")[0]}</td>
                                    <td className={`p3-text-sm`} >
                                        <span className={`status ${record?.type === 'returned' // Returned if returned, cancelled, else borrowed
                                            ? 'returned'
                                            : record?.type === 'cancelled'
                                                ? 'cancelled'
                                                : 'borrowed'
                                            }`}>
                                            {record?.type === 'returned'
                                                ? 'Returned'
                                                : record?.type === 'cancelled'
                                                    ? 'Cancelled'
                                                    : 'Borrowed'}
                                        </span>
                                    </td>
                                    <td className="pi3-text-sm">
                                        {record?.type === 'returned' ? (
                                            <span>✅</span>
                                        ) : (
                                            (decoded.userRole === Role.ADMIN || decoded.userRole === Role.MANAGER) && (
                                                new Date().toLocaleDateString('en-CA') < record?.due_date?.split("T")[0]
                                                    ? <button className="actions-warning" onClick={() => handleReturn(record)}>Return</button>
                                                    : <button className="actions-danger" onClick={() => handleReturn(record)}>Return</button>
                                            )
                                        )}
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>
            <ReturnModal isOpen={isModalOpen} onClose={closeReturnModal} record={chosenRecord} />
        </>
    )
};

const ReturnModal = ({ isOpen, onClose, record }) => {
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

export default BorrowTable;