import { useState, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { editRecord } from '../../redux/actions/recordActions';
import { editInventory } from "../../redux/actions/inventoryActions";
import { useSortableData } from "../../helpers/sortUtils";
import { Role } from "../../helpers/_variables";
import { filterBySearchQuery } from "../../helpers/inputUtils";
import SearchInput from "../../components/SearchInput";
import axios from "axios";

const postURL =
    import.meta.env.VITE_DEVELOPMENT === "true"
        ? `http://${import.meta.env.VITE_LOCALHOST}:5000/api/records`
        : `https://cdiis-ois-server.vercel.app/api/records`;

const ReserveTable = ({ decoded }) => {
    const [searchQueryReserve, setSearchQueryReserve] = useState('');
    const [debouncedReserveQuery, setDebouncedReserveQuery] = useState('');

    const dispatch = useDispatch()
    const records = useSelector((state) => state.record);
    const reservedRecords = records.filter(item => item.type?.toLowerCase().includes("reserve"))
    const { items: sortedReservedRecords, requestSort: requestReservedSort, getSortDirectionClass: getReservedClass } = useSortableData(reservedRecords, { key: 'type', direction: 'ascending' });

    const handleLend = (record) => {
        const todayPlus7 = new Date();
        todayPlus7.setDate(todayPlus7.getDate() + 7);
        const borrowDueDate = todayPlus7.toLocaleDateString('en-CA'); // 'YYYY-MM-DD'

        const configuration = {
            method: "post",
            url: postURL,
            data: {
                _id: record?._id,
                user: {
                    name: record?.user.name,
                    contact: record?.user.contact,
                },
                item: {
                    id: record?.item.id,
                    name: record?.item.name,
                },
                date: borrowDueDate,
                type: 'borrow',
            },
        };

        axios(configuration)
            .then((res) => {
                console.log(res.data);
                dispatch(editRecord(res.data.result.updatedRecord))
                dispatch(editInventory(res.data.result.borrowedItem[0]._id, { status: res.data.result.borrowedItem[0].status }))
            })
            .catch((err) => {
                console.log(err);
                alert(err.response.data.message);
            })
    }

    const handleRetract = (record) => {
        const configuration = {
            method: "post",
            url: postURL,
            data: {
                _id: record?._id,
                type: "cancelled",
            }
        }

        axios(configuration)
            .then((res) => {
                console.log(res.data);
                dispatch(editRecord(res.data.result.updatedRecord))
                dispatch(editInventory(res.data.result.borrowedItem[0]._id, { status: res.data.result.borrowedItem[0].status }))
            })
            .catch((err) => {
                console.log(err);
                alert(err.response.data.message);
            })
    }

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedReserveQuery(searchQueryReserve.trim());
        }, 300); // 300ms debounce

        return () => clearTimeout(handler);
    }, [searchQueryReserve]);

    const filteredReserves = useMemo(() => {
        return filterBySearchQuery(
            sortedReservedRecords,
            debouncedReserveQuery,
            ['item.name', 'user.name', 'due_date']
        );
    }, [sortedReservedRecords, debouncedReserveQuery]);

    return (
        <>
            <h3 style={{ marginLeft: "1rem", marginBottom: "1rem", textDecoration: "underline", cursor: "default" }}>Reserved</h3>
            <SearchInput value={searchQueryReserve} onChange={(e) => setSearchQueryReserve(e.target.value)} />
            <div className="records__table-container">
                <table className="records__table">
                    <thead className="records__table-header">
                        <tr>
                            <th className="records__table-header-column" title={`${getReservedClass('item.name')}`}>
                                <button type="button" onClick={() => requestReservedSort('item.name')} className={`sort-button ${getReservedClass('item.name')}`}>
                                    Item Name
                                </button>
                            </th>
                            <th className="records__table-header-column" title={`${getReservedClass('user.name')}`}>
                                <button type="button" onClick={() => requestReservedSort('user.name')} className={`sort-button ${getReservedClass('user.name')}`}>
                                    User
                                </button>
                            </th>
                            <th className="records__table-header-column" title={`${getReservedClass('user.contact')}`}>
                                <button type="button" onClick={() => requestReservedSort('user.contact')} className={`sort-button ${getReservedClass('user.contact')}`}>
                                    Contact
                                </button>
                            </th>
                            <th className="records__table-header-column" title={`${getReservedClass('due_date')}`}>
                                <button type="button" onClick={() => requestReservedSort('due_date')} className={`sort-button ${getReservedClass('due_date')}`}>
                                    Due Date
                                </button>
                            </th>
                            <th className="records__table-header-column" title={`${getReservedClass('type')}`}>
                                <button type="button" onClick={() => requestReservedSort('type')} className={`sort-button ${getReservedClass('type')}`}>
                                    Status
                                </button>
                            </th>
                            {(decoded.userRole === Role.ADMIN || decoded.userRole === Role.MANAGER) && (
                                <th className="records__table-header-column">Actions</th>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredReserves.map((record) => (
                            <tr key={record?._id} className="records__table-data-row" title={`${record?.item.name} (${record?.user.name})`}>
                                <td className="records__table-data-column">{record?.item.name} ({record?.item.id})</td>
                                <td className="records__table-data-column">{record?.user.name}</td>
                                <td className="records__table-data-column">{record?.user.contact}</td>
                                <td className="records__table-data-column">{record?.due_date?.split("T")[0]}</td>
                                <td className="p3-text-sm">
                                    {
                                        (new Date().toLocaleDateString('en-CA') < record?.due_date?.split("T")[0])
                                            ? (<span className="status">{record?.type}</span>)
                                            : (<span className="status expired">Expired</span>)
                                    }
                                </td>
                                <td className="pi3-text-sm">
                                    {(decoded.userRole === Role.ADMIN || decoded.userRole === Role.MANAGER) && (
                                        <RecordActions
                                            record={record}
                                            handleLend={handleLend}
                                            handleRetract={handleRetract}
                                        />
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

export default ReserveTable;