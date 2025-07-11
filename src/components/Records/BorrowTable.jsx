import { useState, useEffect } from "react";
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
    const [filteredBorrows, setFilteredBorrows] = useState([]);

    const dispatch = useDispatch()
    const records = useSelector((state) => state.record);
    const borrowedRecords = records.filter(item => {
        return (
            item.type?.toLowerCase().includes("borrow") ||
            item.type?.toLowerCase().includes("returned")
        )
    })

    const handleReturn = (record) => {
        const dateToday = new Date().toLocaleDateString('en-CA');

        const configuration = {
            method: "post",
            url: postURL,
            data: {
                _id: record?._id,
                item: {
                    id: record?.item.id,
                },
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
    }

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedBorrowQuery(searchQueryBorrow.trim());
        }, 300); // 300ms debounce

        return () => clearTimeout(handler);
    }, [searchQueryBorrow]);

    const { items: sortedBorrowedRecords, requestSort: requestBorrowedSort, getSortDirectionClass: getBorrowedClass } = useSortableData(borrowedRecords, { key: 'status', direction: 'ascending' });

    useEffect(() => {
        const handler = setTimeout(() => {
            const result = filterBySearchQuery(
                sortedBorrowedRecords,
                debouncedBorrowQuery,
                ['item.name', 'user.name', 'due_date']
            );
            setFilteredBorrows(result);
        }, 500) // 500ms debounce time

        return () => {
            clearTimeout(handler)
        };
    }, [debouncedBorrowQuery, records])

    return (
        <>
            <h3 style={{ marginLeft: "1rem", marginBottom: "1rem", textDecoration: "underline", cursor: "default" }}>Borrowed</h3>
            <SearchInput value={searchQueryBorrow} onChange={(e) => setSearchQueryBorrow(e.target.value)} />
            <div className="records__table-container">
                <table className="records__table">
                    <thead className="records__table-header">
                        <tr>
                            <th className="records__table-header-column">
                                <button type="button" onClick={() => requestBorrowedSort('item.name')} className={`sort-button ${getBorrowedClass('item.name')}`}>
                                    Item Name
                                </button>
                            </th>
                            <th className="records__table-header-column">
                                <button type="button" onClick={() => requestBorrowedSort('user.name')} className={`sort-button ${getBorrowedClass('user.name')}`}>
                                    User
                                </button>
                            </th>
                            <th className="records__table-header-column">
                                <button type="button" onClick={() => requestBorrowedSort('start_date')} className={`sort-button ${getBorrowedClass('start_date')}`}>
                                    Borrowed On
                                </button>
                            </th>
                            <th className="records__table-header-column">
                                <button type="button" onClick={() => requestBorrowedSort('due_date')} className={`sort-button ${getBorrowedClass('due_date')}`}>
                                    Due Date
                                </button>
                            </th>
                            <th className="records__table-header-column">
                                <button type="button" onClick={() => requestBorrowedSort('returned_on')} className={`sort-button ${getBorrowedClass('returned_on')}`}>
                                    Returned On
                                </button>
                            </th>
                            <th className="records__table-header-column">
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
                            .sort((a, b) => new Date(a.start_date) - new Date(b.start_date))
                            .map((record) => (
                                <tr key={record._id} className="records__table-data-row">
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
        </>
    )
};

const RecordActions = ({ record, handleLend, handleRetract }) => {
    const today = new Date().toLocaleDateString('en-CA');
    const dueDate = record?.due_date?.split("T")[0];
    const isExpired = today >= dueDate;

    return (
        <>
            <button className="actions-add" onClick={() => handleLend(record)}>Lend</button>
            {isExpired && (
                <button className="actions-danger" onClick={() => handleRetract(record)}>Retract</button>
            )}
        </>
    );
};

export default BorrowTable;