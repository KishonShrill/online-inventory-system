import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { PlusCircle, Search, Edit, Trash2, PackageSearch, Tag } from "lucide-react";
import { Mode, Role } from "../helpers/_variables";
import { jwtDecode } from 'jwt-decode';
import Cookies from 'universal-cookie';

import ItemModal from '../components/ItemModal.jsx'
import Pagination from "../components/Pagination.jsx";
import { paginationData } from "../helpers/paginationUtils.js";

// Shadcn UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const Inventory = () => {
    const cookies = new Cookies();
    const token = cookies.get("CDIIS-OIS");

    // Safety check: Prevent crashing if token expires or is missing
    const decoded = token ? jwtDecode(token) : { userRole: 'guest' };

    const inventory = useSelector((state) => state.inventory);
    const dispatch = useDispatch();

    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [mode, setMode] = useState("ADD");
    const [itemId, setItemId] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    const filteredInventory = inventory.filter(item =>
        item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const { paginatedData, totalPages, quantity } = paginationData(filteredInventory, 10, currentPage);

    // Reset pagination to page 1 if the user types in the search bar
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    function handleAdd() {
        setItemId("");
        setMode(Mode.ADD);
        setIsModalOpen(true);
    }

    function handleEdit(itemId) {
        setItemId(itemId);
        setMode(Mode.UPDATE);
        setIsModalOpen(true);
    }

    function handleDelete(itemId) {
        setItemId(itemId);
        setMode(Mode.DELETE);
        setIsModalOpen(true);
    }

    return (
        <div className="container mx-auto min-h-[calc(100vh-64px)] bg-slate-50 dark:bg-transparent p-6 md:p-10 font-sans transition-colors duration-200">
            <title>CDIIS OIS - Asset Directory</title>

            {/* Page Header */}
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl max-md:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Asset Directory</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1 max-md:text-sm">Manage and track all registered municipal inventory items.</p>
                </div>

                {(decoded.userRole === Role.ADMIN || decoded.userRole === Role.MANAGER) && (
                    <Button onClick={handleAdd} className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white shadow-sm">
                        <PlusCircle className="w-4 h-4 mr-2" />
                        Provision New Asset
                    </Button>
                )}
            </div>

            <Card className="border-slate-200 dark:border-slate-800 dark:bg-slate-900 shadow-sm transition-colors duration-200">
                {/* Search and Filters Header */}
                <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4 bg-white dark:bg-slate-900 rounded-t-xl transition-colors duration-200">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="relative w-full sm:max-w-md">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400 dark:text-slate-500">
                                <Search className="w-4 h-4" />
                            </div>
                            <Input
                                id="searchbar"
                                type="text"
                                placeholder="Search by ID, Nomenclature, or Category..."
                                className="pl-10 h-10 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus-visible:ring-blue-600 w-full placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        {/* Pagination component sitting cleanly on the right */}
                        <div className="w-full sm:w-auto flex justify-end max-md:justify-center">
                            <Pagination setCurrentPage={setCurrentPage} currentPage={currentPage} totalPages={totalPages} quantity={quantity} />
                        </div>
                    </div>
                </CardHeader>

                {/* Data Table */}
                <CardContent className="p-0">
                    {paginatedData.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-slate-500 dark:text-slate-400">
                            <PackageSearch className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-4" />
                            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">No assets found</h3>
                            <p className="text-sm">Try adjusting your search query.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto px-4">
                            <Table>
                                <TableHeader className="bg-slate-50/80 dark:bg-slate-800/50 transition-colors">
                                    <TableRow className="dark:border-slate-700">
                                        <TableHead className="w-[120px] font-semibold text-slate-600 dark:text-slate-300">Asset ID</TableHead>
                                        <TableHead className="font-semibold text-slate-600 dark:text-slate-300">Nomenclature</TableHead>
                                        <TableHead className="font-semibold text-slate-600 dark:text-slate-300">Classification</TableHead>
                                        <TableHead className="font-semibold text-slate-600 dark:text-slate-300">Date Logged</TableHead>
                                        {(decoded.userRole === Role.ADMIN || decoded.userRole === Role.MANAGER) && (
                                            <TableHead className="font-semibold text-slate-600 dark:text-slate-300 text-right pr-6">Actions</TableHead>
                                        )}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paginatedData.map((item) => (
                                        <TableRow key={item?._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 dark:border-slate-800 transition-colors group">
                                            <TableCell className="font-mono text-xs text-slate-500 dark:text-slate-400 align-middle">
                                                {item?.id}
                                            </TableCell>
                                            <TableCell className="font-medium text-slate-900 dark:text-slate-100 align-middle">
                                                {item?.name}
                                            </TableCell>
                                            <TableCell className="align-middle">
                                                <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border-transparent font-medium transition-colors">
                                                    <Tag className="w-3 h-3 mr-1.5 opacity-70" />
                                                    {item?.category}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-slate-500 dark:text-slate-400 text-sm align-middle">
                                                {item?.date_added.split("T")[0]}
                                            </TableCell>

                                            {(decoded.userRole === Role.MANAGER || decoded.userRole === Role.ADMIN) && (
                                                <TableCell className="text-right pr-4 align-middle">
                                                    <div className="flex justify-end items-center gap-1 opacity-50 group-hover:opacity-100 transition-opacity">
                                                        <Button
                                                            variant="ghost" size="icon"
                                                            className="h-8 w-8 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                                                            onClick={() => handleEdit(item?._id)}
                                                            title="Edit Asset"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </Button>

                                                        {decoded.userRole === Role.ADMIN && (
                                                            <Button
                                                                variant="ghost" size="icon"
                                                                className="h-8 w-8 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30"
                                                                onClick={() => handleDelete(item?._id)}
                                                                title="Revoke Asset"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            )}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Modal Logic Remains Unchanged */}
            {isModalOpen && (
                <ItemModal
                    onClose={() => setIsModalOpen(false)}
                    initialInventory={inventory}
                    itemId={itemId}
                    mode={mode}
                    dispatch={dispatch}
                />
            )}
        </div>
    );
};

export default Inventory;
