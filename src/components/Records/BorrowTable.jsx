import { useState, useEffect, useMemo, useRef } from "react";
import { useSelector } from "react-redux";
import { Search, ArrowUpDown, XCircle, CheckCircle2, RotateCcw } from "lucide-react";

import { useSortableData } from "../../helpers/sortUtils";
import { filterBySearchQuery } from "../../helpers/inputUtils";
import { paginationData } from "../../helpers/paginationUtils.js";
import { Role } from "../../helpers/_variables";
import ReturnItemModal from "./ReturnItemModal";
import Pagination from "../Pagination";

// Shadcn UI
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const BorrowTable = ({ decoded }) => {
    const [searchQueryBorrow, setSearchQueryBorrow] = useState('');
    const [debouncedBorrowQuery, setDebouncedBorrowQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [modalData, setModalData] = useState(null);
    const [chosenRecord, setChosenRecord] = useState([]);

    const records = useSelector((state) => state.record);
    const borrowedRecords = records.filter(item => ["cancelled", "borrow", "returned"].some(status => item.type?.toLowerCase().includes(status)));

    const { items: sortedBorrowedRecords, requestSort } = useSortableData(borrowedRecords, { key: 'due_date', direction: 'descending' });

    useEffect(() => {
        const handler = setTimeout(() => setDebouncedBorrowQuery(searchQueryBorrow.trim()), 300);
        return () => clearTimeout(handler);
    }, [searchQueryBorrow]);

    const filteredBorrows = useMemo(() => filterBySearchQuery(sortedBorrowedRecords, debouncedBorrowQuery, ['item.name', 'user.name', 'start_date']), [sortedBorrowedRecords, debouncedBorrowQuery]);
    const { paginatedData, totalPages, quantity } = paginationData(filteredBorrows, 7, currentPage);

    const handleRowClick = (record) => {
        setModalData(record);
        setIsViewModalOpen(true);
    };

    const StatusBadge = ({ status }) => {
        const map = {
            returned: { color: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Returned' },
            borrow: { color: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Deployed' },
            cancelled: { color: 'bg-red-50 text-red-700 border-red-200', label: 'Cancelled' },
        };
        const active = map[status?.toLowerCase()] || { color: 'bg-slate-50 text-slate-700', label: status };
        return <Badge variant="outline" className={`${active.color} font-semibold capitalize`}>{active.label}</Badge>;
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 border-b border-slate-100">
                <div className="relative w-full sm:max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        placeholder="Search deployments..."
                        value={searchQueryBorrow} onChange={(e) => setSearchQueryBorrow(e.target.value)}
                        className="pl-9 bg-slate-50 focus-visible:ring-blue-600"
                    />
                </div>
                <Pagination setCurrentPage={setCurrentPage} currentPage={currentPage} totalPages={totalPages} quantity={quantity} />
            </div>

            <Table>
                <TableHeader className="bg-slate-50/50">
                    <TableRow>
                        <TableHead><Button variant="ghost" className="font-semibold text-slate-600 -ml-4" onClick={() => requestSort('item.name')}>Asset <ArrowUpDown className="ml-2 w-3 h-3" /></Button></TableHead>
                        <TableHead><Button variant="ghost" className="font-semibold text-slate-600 -ml-4" onClick={() => requestSort('user.name')}>Personnel <ArrowUpDown className="ml-2 w-3 h-3" /></Button></TableHead>
                        <TableHead><Button variant="ghost" className="font-semibold text-slate-600 -ml-4" onClick={() => requestSort('due_date')}>Lifecycle <ArrowUpDown className="ml-2 w-3 h-3" /></Button></TableHead>
                        <TableHead><Button variant="ghost" className="font-semibold text-slate-600 -ml-4" onClick={() => requestSort('returned_on')}>Returned <ArrowUpDown className="ml-2 w-3 h-3" /></Button></TableHead>
                        <TableHead className="font-semibold text-slate-600">Status</TableHead>
                        <TableHead className="text-right font-semibold text-slate-600 pr-6">Processing</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {paginatedData.map((record) => {
                        const isOverdue = record?.type === 'borrow' && new Date().toLocaleDateString('en-CA') >= record?.due_date?.split("T")[0];
                        return (
                            <TableRow key={record?._id} className="hover:bg-slate-50/50 cursor-pointer" onClick={() => handleRowClick(record)}>
                                <TableCell className="font-medium text-slate-900">{record?.item.name} <span className="text-slate-400 font-mono text-xs block">{record?.item.id}</span></TableCell>
                                <TableCell>
                                    <div className="flex flex-col"><span className="text-sm font-medium text-slate-700">{record?.user.name}</span><span className="text-xs text-slate-500">{record?.user.contact}</span></div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col gap-1 text-xs">
                                        <span className="text-slate-500">Out: {record?.start_date?.split("T")[0]}</span>
                                        <span className="text-slate-500">Due: <span className={isOverdue ? 'text-red-600 font-bold' : ''}>{record?.due_date?.split("T")[0]}</span></span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-slate-600 text-sm">{record?.returned_on?.split("T")[0] || "-"}</TableCell>
                                <TableCell><StatusBadge status={record?.type} /></TableCell>
                                <TableCell className="text-right pr-4" onClick={(e) => e.stopPropagation()}>
                                    {record?.type === 'returned' && <CheckCircle2 className="w-5 h-5 text-emerald-500 ml-auto mr-4" />}
                                    {record?.type === 'cancelled' && <XCircle className="w-5 h-5 text-red-500 ml-auto mr-4" />}
                                    {record?.type === 'borrow' && (decoded.userRole === Role.ADMIN || decoded.userRole === Role.MANAGER) && (
                                        <Button size="sm" variant={isOverdue ? "destructive" : "default"} onClick={() => { setChosenRecord(record); setIsModalOpen(true); }} className={!isOverdue ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""}>
                                            <RotateCcw className="w-3 h-3 mr-1" /> Process
                                        </Button>
                                    )}
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>

            <ReturnItemModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} record={chosenRecord} />

            {/* View Details Modal */}
            <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle className="text-xl flex items-center gap-2">Transaction Details <Badge variant="secondary">{modalData?.type.toUpperCase()}</Badge></DialogTitle>
                        <DialogDescription>Personnel: {modalData?.user.name} | Contact: {modalData?.user.contact}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 flex justify-between items-center">
                            <div><p className="text-sm text-slate-500 font-medium mb-1">Asset Nomenclature</p><p className="text-base font-bold text-slate-900">{modalData?.item.name}</p></div>
                            <Badge variant="outline" className="font-mono bg-white">{modalData?.item.id}</Badge>
                        </div>

                        <div className="space-y-2">
                            <h4 className="text-sm font-semibold text-slate-900">Component Status</h4>
                            <div className="border border-slate-100 rounded-lg p-3 bg-white space-y-2">
                                {modalData?.returned_items ? Object.entries(modalData.returned_items).map(([name, isReturned]) => (
                                    <div key={name} className="flex justify-between items-center text-sm">
                                        <span className="text-slate-700">{name}</span>
                                        {isReturned ? <Badge variant="secondary" className="bg-emerald-100 text-emerald-700"><CheckCircle2 className="w-3 h-3 mr-1" /> Returned</Badge> : <Badge variant="secondary" className="bg-red-100 text-red-700"><XCircle className="w-3 h-3 mr-1" /> Missing</Badge>}
                                    </div>
                                )) : <p className="text-sm text-slate-500 italic">No component data recorded.</p>}
                            </div>
                        </div>

                        {modalData?.feedback && (
                            <div className="space-y-2">
                                <h4 className="text-sm font-semibold text-slate-900">Operator Feedback</h4>
                                <div className="text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-lg p-3 min-h-[80px]">{modalData.feedback}</div>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};
export default BorrowTable;
