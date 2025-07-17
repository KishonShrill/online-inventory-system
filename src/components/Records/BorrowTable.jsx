import { useState, useEffect, useMemo } from "react";

import { useSelector } from "react-redux";
import { useSortableData } from "../../helpers/sortUtils";
import { filterBySearchQuery } from "../../helpers/inputUtils";
import { Role } from "../../helpers/_variables";

import SearchInput from "../../components/SearchInput";
import ReturnItemModal from "./ReturnItemModal";
import Pagination from "../Pagination";
import { paginationData } from "../../helpers/paginationUtils.js";

const BorrowTable = ({ decoded }) => {
    const [searchQueryBorrow, setSearchQueryBorrow] = useState('');
    const [debouncedBorrowQuery, setDebouncedBorrowQuery] = useState('');
    const [chosenRecord, setChosenRecord] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

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

    const { paginatedData, totalPages, quantity } = paginationData(filteredBorrows, 7, currentPage)


    return (
        <div>
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
                        {paginatedData
                            .map((record) => (
                                <tr key={record?._id} className="records__table-data-row" title={`${record?.item.name} (${record?.user.name})`}>
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
            <Pagination setCurrentPage={setCurrentPage} currentPage={currentPage} totalPages={totalPages} quantity={quantity}/>
            <ReturnItemModal isOpen={isModalOpen} onClose={closeReturnModal} record={chosenRecord} />
        </div>
    )
};

export default BorrowTable;