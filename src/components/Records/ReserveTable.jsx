import { useState, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { ResultAsync } from "neverthrow";
import { Search, ArrowUpDown, Clock, XCircle, CheckCircle2 } from "lucide-react";

import { editRecord } from '../../redux/actions/recordActions';
import { editInventory } from "../../redux/actions/inventoryActions";
import { useSortableData } from "../../helpers/sortUtils";
import { filterBySearchQuery } from "../../helpers/inputUtils";
import { paginationData } from "../../helpers/paginationUtils.js";
import { Role } from "../../helpers/_variables";
import Pagination from "../Pagination";

// Shadcn UI
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const postURL = import.meta.env.VITE_DEVELOPMENT === "true"
    ? `http://${import.meta.env.VITE_LOCALHOST}:5000/api/records`
    : `https://cdiis-ois-server.vercel.app/api/records`;

const updateRecordAPI = (configuration) => {
    return ResultAsync.fromPromise(
        axios(configuration),
        (err) => err.response?.data?.message || "An unexpected network error occurred."
    );
};

const ReserveTable = ({ decoded }) => {
    const dispatch = useDispatch();
    const records = useSelector((state) => state.record);
    const reservedRecords = records.filter(item => item.type?.toLowerCase().includes("reserve"));

    const [searchQueryReserve, setSearchQueryReserve] = useState('');
    const [debouncedReserveQuery, setDebouncedReserveQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const { items: sortedReservedRecords, requestSort } = useSortableData(reservedRecords, { key: 'type', direction: 'ascending' });

    useEffect(() => {
        const handler = setTimeout(() => setDebouncedReserveQuery(searchQueryReserve.trim()), 300);
        return () => clearTimeout(handler);
    }, [searchQueryReserve]);

    const filteredReserves = useMemo(() => {
        return filterBySearchQuery(sortedReservedRecords, debouncedReserveQuery, ['item.name', 'user.name', 'due_date']);
    }, [sortedReservedRecords, debouncedReserveQuery]);

    const { paginatedData, totalPages, quantity } = paginationData(filteredReserves, 7, currentPage);

    const handleLend = async (record) => {
        if (!confirm(`Authorize deployment of ${record?.item.name} to ${record?.user.name}?`)) return;

        const todayPlus7 = new Date();
        todayPlus7.setDate(todayPlus7.getDate() + 7);
        const borrowDueDate = todayPlus7.toLocaleDateString('en-CA');

        const apiResult = await updateRecordAPI({
            method: "post", url: postURL,
            data: {
                _id: record?._id,
                user: { name: record?.user.name, contact: record?.user.contact },
                item: { id: record?.item.id, name: record?.item.name },
                date: borrowDueDate, type: 'borrow',
            }
        });

        if (apiResult.isErr()) return alert(apiResult.error);

        dispatch(editRecord(apiResult.value.data.result.updatedRecord));
        dispatch(editInventory(apiResult.value.data.result.borrowedItem[0]._id, { status: apiResult.value.data.result.borrowedItem[0].status }));
    };

    const handleRetract = async (record) => {
        if (!confirm(`Revoke reservation for ${record?.item.name}?`)) return;

        const apiResult = await updateRecordAPI({
            method: "post", url: postURL,
            data: { _id: record?._id, item: { id: record?.item.id }, type: "cancelled" }
        });

        if (apiResult.isErr()) return alert(apiResult.error);

        dispatch(editRecord(apiResult.value.data.result.updatedRecord));
        dispatch(editInventory(apiResult.value.data.result.returnedItem[0]._id, { status: apiResult.value.data.result.returnedItem[0].status }));
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 border-b border-slate-100 dark:border-slate-800 transition-colors">
                <div className="relative w-full sm:max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                    <Input
                        placeholder="Search reservations..."
                        value={searchQueryReserve} onChange={(e) => setSearchQueryReserve(e.target.value)}
                        className="pl-9 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus-visible:ring-blue-600 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-colors"
                    />
                </div>
                <Pagination setCurrentPage={setCurrentPage} currentPage={currentPage} totalPages={totalPages} quantity={quantity} />
            </div>

            <div className="px-4">
                <Table>
                    <TableHeader className="bg-slate-50/50 dark:bg-slate-800/50 transition-colors">
                        <TableRow className="dark:border-slate-700">
                            <TableHead><Button variant="ghost" className="font-semibold text-slate-600 dark:text-slate-300 -ml-4" onClick={() => requestSort('item.name')}>Asset <ArrowUpDown className="ml-2 w-3 h-3" /></Button></TableHead>
                            <TableHead><Button variant="ghost" className="font-semibold text-slate-600 dark:text-slate-300 -ml-4" onClick={() => requestSort('user.name')}>Personnel <ArrowUpDown className="ml-2 w-3 h-3" /></Button></TableHead>
                            <TableHead><Button variant="ghost" className="font-semibold text-slate-600 dark:text-slate-300 -ml-4" onClick={() => requestSort('due_date')}>Scheduled <ArrowUpDown className="ml-2 w-3 h-3" /></Button></TableHead>
                            <TableHead className="font-semibold text-slate-600 dark:text-slate-300">Status</TableHead>
                            {(decoded.userRole === Role.ADMIN || decoded.userRole === Role.MANAGER) && (
                                <TableHead className="text-right font-semibold text-slate-600 dark:text-slate-300">Actions</TableHead>
                            )}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedData.map((record) => {
                            const isExpired = new Date().toLocaleDateString('en-CA') >= record?.due_date?.split("T")[0];
                            return (
                                <TableRow key={record?._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 dark:border-slate-800 transition-colors">
                                    <TableCell className="font-medium text-slate-900 dark:text-slate-100">{record?.item.name} <span className="text-slate-400 dark:text-slate-500 font-mono text-xs block">{record?.item.id}</span></TableCell>
                                    <TableCell>
                                        <div className="flex flex-col"><span className="text-sm font-medium text-slate-700 dark:text-slate-200">{record?.user.name}</span><span className="text-xs text-slate-500 dark:text-slate-400">{record?.user.contact}</span></div>
                                    </TableCell>
                                    <TableCell className="text-slate-600 dark:text-slate-400">{record?.due_date?.split("T")[0]}</TableCell>
                                    <TableCell>
                                        {!isExpired
                                            ? <Badge variant="outline" className="bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>
                                            : <Badge variant="outline" className="bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800"><XCircle className="w-3 h-3 mr-1" /> Expired</Badge>
                                        }
                                    </TableCell>
                                    {(decoded.userRole === Role.ADMIN || decoded.userRole === Role.MANAGER) && (
                                        <TableCell className="text-right">
                                            <Button size="sm" onClick={() => handleLend(record)} className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 text-white mr-2">Deploy</Button>
                                            {isExpired && <Button size="sm" variant="destructive" onClick={() => handleRetract(record)}>Revoke</Button>}
                                        </TableCell>
                                    )}
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};
export default ReserveTable;
