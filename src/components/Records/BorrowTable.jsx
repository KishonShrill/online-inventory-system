import { useState, useEffect, useMemo, useRef } from "react";

import { useSelector } from "react-redux";
import { useSortableData } from "../../helpers/sortUtils";
import { filterBySearchQuery } from "../../helpers/inputUtils";
import { Role } from "../../helpers/_variables";

import SearchInput from "../../components/SearchInput";
import ReturnItemModal from "./ReturnItemModal";
import Pagination from "../Pagination";
import { paginationData } from "../../helpers/paginationUtils.js";
import { XCircle } from "lucide-react";

const BorrowTable = ({ decoded }) => {
    const [searchQueryBorrow, setSearchQueryBorrow] = useState('');
    const [debouncedBorrowQuery, setDebouncedBorrowQuery] = useState('');

    const [selectedRowId, setSelectedRowId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [modalData, setModalData] = useState(null);
    const tableContainerRef = useRef(null);

    const [chosenRecord, setChosenRecord] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);

    const records = useSelector((state) => state.record);
    const borrowedRecords = records.filter(item => {
        return (
            item.type?.toLowerCase().includes("cancelled") ||
            item.type?.toLowerCase().includes("borrow") ||
            item.type?.toLowerCase().includes("returned")
        )
    })

    // Tabular Data
    // Tabular Data
    const { items: sortedBorrowedRecords, requestSort: requestBorrowedSort, getSortDirectionClass: getBorrowedClass } = useSortableData(borrowedRecords, { key: 'due_date', direction: 'descending' });
    const filteredBorrows = useMemo(() => {
        return filterBySearchQuery(
            sortedBorrowedRecords,
            debouncedBorrowQuery,
            ['item.name', 'user.name', 'start_date']
        );
    }, [sortedBorrowedRecords, debouncedBorrowQuery]);
    const { paginatedData, totalPages, quantity } = paginationData(filteredBorrows, 7, currentPage)
    // Tabular Data
    // Tabular Data

    const closeReturnModal = () => {
        setIsModalOpen(false);
    };

    const handleReturn = (record) => {
        setChosenRecord(record);
        setIsModalOpen(true)
    };

    const handleRowClick = (record) => {
        if (selectedRowId === record._id) {
            // This is the second click on the same row
            setModalData(record);
            setIsViewModalOpen(true);
            setSelectedRowId(null); // Deselect row after opening modal
        } else {
            // This is the first click, so just select the row
            setSelectedRowId(record._id);
        }
    };

    // Debounce effect for search input
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedBorrowQuery(searchQueryBorrow.trim());
        }, 300); // 300ms debounce

        return () => clearTimeout(handler);
    }, [searchQueryBorrow]);

    // Effect to handle clicks outside the table
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (tableContainerRef.current && !tableContainerRef.current.contains(event.target)) {
                setSelectedRowId(null); // Reset selection if click is outside
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside); // Cleanup
        };
    }, []);

    return (
        <div>
            <h3 style={{ marginLeft: "1rem", marginBottom: "1rem", textDecoration: "underline", cursor: "default" }}>Borrowed</h3>
            <SearchInput value={searchQueryBorrow} onChange={(e) => setSearchQueryBorrow(e.target.value)} />
            <div className="records__table-container" ref={tableContainerRef}>
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
                        {paginatedData
                            .map((record) => (
                                <tr 
                                    key={record?._id} 
                                    className={`records__table-data-row ${selectedRowId === record._id ? 'selected' : ''}`} 
                                    onClick={() => handleRowClick(record)}
                                    title={`${record?.item.name} (${record?.user.name})`}
                                >
                                    <td className="records__table-data-column">{record?.item.name} ({record?.item.id})</td>
                                    <td className="records__table-data-column">{record?.user.name} ({record?.user.contact})</td>
                                    <td className="records__table-data-column">{record?.start_date?.split("T")[0]}</td>
                                    <td className="records__table-data-column">{record?.due_date?.split("T")[0]}</td>
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
                                    <td className="pi3-text-sm" onClick={(e) => e.stopPropagation()}>
                                        {record?.type === 'returned' ? (
                                           '✅'
                                        ) : record?.type === 'cancelled' ? (
                                            <span style={{display: 'flex'}}><XCircle size={18} color="red"/></span>
                                        ) : (
                                            (decoded.userRole === Role.ADMIN || decoded.userRole === Role.MANAGER) && 
                                            (
                                                new Date().toLocaleDateString('en-CA') < record?.due_date?.split("T")[0]
                                                    ? <button className="actions-create" onClick={() => handleReturn(record)}>Return</button>
                                                    : <button className="actions-danger" onClick={() => handleReturn(record)}>Return</button>
                                            )
                                        )}
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>
            <Pagination setCurrentPage={setCurrentPage} currentPage={currentPage} totalPages={totalPages} quantity={quantity}/>
            <ReturnItemModal isOpen={isModalOpen} onClose={closeReturnModal} record={chosenRecord} />
            {/* Conditionally render the modal */}
            {isViewModalOpen && modalData && (
                <ViewReturnedItemModal 
                    record={modalData} 
                    onClose={() => setIsViewModalOpen(false)} 
                />
            )}
        </div>
    )
};

const ViewReturnedItemModal = ({ record, onClose }) => {
    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <button className="modal-close-btn" onClick={onClose}>&times;</button>
                <h2 className="modal-header">View Returned Item</h2>

                <form id="just-watching">
                    <div className="form-group">
                        <label className="form-label" htmlFor="itemId">Item ID (Borrower)</label>
                        <div className="input-group">
                            <input 
                                type="text"
                                id="itemId" 
                                className="form-input"
                                defaultValue={`${record?.item.id} (${record?.user.name})`}
                                readOnly
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="itemName">Gadget:</label>
                        <div className="input-group">
                            <input 
                                type="text"
                                id="itemName"
                                className="form-input"
                                defaultValue={record?.item.name}
                                readOnly 
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="itemComponents" className="form-label">Item Components:</label>
                        <ul id="itemComponents">
                            {record?.returned_items ? (
                                Object.entries(record?.returned_items).map(([name, isReturned], i) => (
                                    <li
                                        key={name}
                                        className="form-checkbox"
                                    >
                                        <span className="">
                                            {i + 1}. {name} —{" "}
                                        </span>
                                        <label>
                                            {isReturned ? "✅ Returned" : "❌ Missing"}
                                        </label>
                                    </li>
                                ))
                            )
                            : record?.type == "cancelled" ? (
                                <li className="form-checkbox">
                                    ⚠️ This record has been cancelled.
                                </li>
                            )
                            : (
                                <li className="form-checkbox">
                                    ⚠️ Item is not yet returned for this record.
                                </li>
                            )}
                        </ul>
                    </div>

                    {record?.feedback && (
                        <div className="form-group">
                            <label className="form-label" htmlFor="returnFeedback">Feedback:</label>
                            <textarea 
                                id="returnFeedback"
                                className="form-textarea"
                                defaultValue={record?.feedback}
                            ></textarea>
                        </div>
                    )}
                </form>
            </div>
        </div>
    )
}

export default BorrowTable;