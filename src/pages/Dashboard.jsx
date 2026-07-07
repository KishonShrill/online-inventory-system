import { useState, useEffect } from "react";
import { useSelector } from 'react-redux';
import {
    CheckCircle2, XCircle, LoaderPinwheel, Archive, Package,
    Clock, AlertCircle, Filter, Sun, Moon, Check, X, FileText
} from "lucide-react";

// Shadcn UI Components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

const Dashboard = () => {
    const inventory = useSelector(state => state.inventory);

    const currentlyBorrowed = inventory.filter((item) => item.status === "Borrowed");
    const categoryCount = [...new Set(inventory.map(i => i.category))].length;

    // Added dark mode utility colors to the KPI stats
    const DASHBOARD_STATS = [
        { label: 'Total Assets', value: inventory.length, icon: Package, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-600/10 dark:bg-blue-500/20' },
        { label: 'Currently Borrowed', value: currentlyBorrowed.length, icon: Clock, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-600/10 dark:bg-amber-500/20' },
        { label: 'Flagged / Overdue', value: 0, icon: AlertCircle, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-600/10 dark:bg-red-500/20' },
        { label: 'Gadget Categories', value: categoryCount, icon: Filter, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-600/10 dark:bg-emerald-500/20' },
    ];

    return (
        <div className="container min-h-[calc(100vh-64px)] mx-auto bg-slate-50 dark:bg-transparent p-6 md:p-10 font-sans transition-colors duration-200">
            <title>CDIIS OIS - Dashboard</title>

            {/* Header Section */}
            <div className="mb-8">
                <h1 className="text-3xl max-md:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">System Dashboard</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1 max-sm:text-sm">Welcome back. Here is the current status of the Iligan City inventory network.</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {DASHBOARD_STATS.map((stat, idx) => (
                    <Card key={idx} className="border-slate-200 dark:border-slate-800 dark:bg-slate-900 shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="px-6 flex items-center justify-between pt-6">
                            <div>
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{stat.label}</p>
                                <h3 className="text-3xl font-bold text-slate-900 dark:text-slate-100">{stat.value}</h3>
                            </div>
                            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                                <stat.icon size={24} strokeWidth={2.5} />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Inventory Data Grid */}
            <ItemDashboard inventory={inventory} />
        </div>
    );
};

const ItemDashboard = ({ inventory }) => {
    const attendances = useSelector(state => state.attendance);

    const [categorized, setCategorized] = useState({});
    const [categories, setCategories] = useState([]);
    const [activeCategory, setActiveCategory] = useState("");

    // Modal State
    const [selectedCheck, setSelectedCheck] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        if (inventory.length > 0) {
            const grouped = inventory.reduce((acc, item) => {
                if (!acc[item.category]) acc[item.category] = [];
                acc[item.category].push(item);
                return acc;
            }, {});

            const categoryList = Object.keys(grouped);
            setCategorized(grouped);
            setCategories(categoryList);
            setActiveCategory(prev => categoryList.includes(prev) ? prev : categoryList[0]);
        }
    }, [inventory]);

    if (!activeCategory || categories.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 text-slate-500 dark:text-slate-400">
                <LoaderPinwheel className="w-6 h-6 animate-spin mr-2" />
                Loading inventory data...
            </div>
        );
    }

    return (
        <Card className="border-slate-200 dark:border-slate-800 dark:bg-slate-900 shadow-sm gap-0">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                    <Archive className="w-5 h-5 text-blue-600 dark:text-blue-500" />
                    <CardTitle className="text-xl text-slate-800 dark:text-slate-100">Inventory Status Monitor</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="p-0">

                <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full gap-0">
                    {/* The sleek category navigation */}
                    <div className="px-6 pt-4 pb-2 overflow-x-auto">
                        <TabsList className="bg-slate-100/50 dark:bg-slate-800/50 p-1">
                            {categories.map(category => (
                                <TabsTrigger
                                    key={category}
                                    value={category}
                                    className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-blue-700 dark:data-[state=active]:text-blue-400 data-[state=active]:shadow-sm text-slate-600 dark:text-slate-400"
                                >
                                    {category}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </div>

                    {/* The Data Table */}
                    <div className="px-6 mt-2 pb-6">
                        <div className="rounded-md border border-slate-200 dark:border-slate-700 overflow-hidden">
                            <Table>
                                <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
                                    <TableRow className="dark:border-slate-700">
                                        <TableHead className="w-[100px] font-semibold text-slate-600 dark:text-slate-300">Asset ID</TableHead>
                                        <TableHead className="font-semibold text-slate-600 dark:text-slate-300">Nomenclature</TableHead>
                                        <TableHead className="font-semibold text-slate-600 dark:text-slate-300 text-center">Daily Logs</TableHead>
                                        <TableHead className="font-semibold text-slate-600 dark:text-slate-300 text-right">System Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {categorized[activeCategory].map(item => {
                                        const today = new Date().toLocaleDateString('en-CA');
                                        const attendanceToday = attendances.find(a =>
                                            a.id === item.id && new Date(a.date).toLocaleDateString('en-CA') === today
                                        );

                                        const morningCheck = attendanceToday?.attendance_checks?.find(c => c.period === "Morning");
                                        const afternoonCheck = attendanceToday?.attendance_checks?.find(c => c.period === "Afternoon");

                                        return (
                                            <TableRow key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 dark:border-slate-700 transition-colors">
                                                <TableCell className="font-mono text-xs text-slate-500 dark:text-slate-400">{item.id}</TableCell>
                                                <TableCell className="font-medium text-slate-900 dark:text-slate-100">{item.name}</TableCell>
                                                <TableCell className="text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        {morningCheck ? (
                                                            <Button
                                                                variant="outline" size="icon"
                                                                className="h-8 w-8 text-amber-500 border-amber-200 hover:bg-amber-50 hover:text-amber-600 dark:border-amber-900/50 dark:hover:bg-amber-900/20 dark:hover:text-amber-400 bg-transparent"
                                                                onClick={() => { setSelectedCheck(morningCheck); setIsModalOpen(true); }}
                                                                title="View Morning Log"
                                                            >
                                                                <Sun className="h-4 w-4" />
                                                            </Button>
                                                        ) : <span className="w-8 text-slate-300 dark:text-slate-700">-</span>}

                                                        {afternoonCheck ? (
                                                            <Button
                                                                variant="outline" size="icon"
                                                                className="h-8 w-8 text-indigo-500 border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 dark:border-indigo-900/50 dark:hover:bg-indigo-900/20 dark:hover:text-indigo-400 bg-transparent"
                                                                onClick={() => { setSelectedCheck(afternoonCheck); setIsModalOpen(true); }}
                                                                title="View Afternoon Log"
                                                            >
                                                                <Moon className="h-4 w-4" />
                                                            </Button>
                                                        ) : <span className="w-8 text-slate-300 dark:text-slate-700">-</span>}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {item.status === "Available" && (
                                                        <Badge variant="outline" className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50 gap-1.5">
                                                            <CheckCircle2 className="w-3.5 h-3.5" /> Available
                                                        </Badge>
                                                    )}
                                                    {item.status === "Borrowed" && (
                                                        <Badge variant="outline" className="bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800/50 gap-1.5">
                                                            <XCircle className="w-3.5 h-3.5" /> Borrowed
                                                        </Badge>
                                                    )}
                                                    {item.status === "Reserved" && (
                                                        <Badge variant="outline" className="bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/50 gap-1.5">
                                                            <LoaderPinwheel className="w-3.5 h-3.5 animate-spin-slow" /> Reserved
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </Tabs>

            </CardContent>

            {/* Modernized Attendance Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                {/* Note: Shadcn Dialog Content handles dark mode backgrounds automatically via CSS vars */}
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <div className="flex items-center gap-2 mb-1">
                            {selectedCheck?.period === "Morning" ? <Sun className="text-amber-500 w-5 h-5" /> : <Moon className="text-indigo-500 w-5 h-5" />}
                            <DialogTitle className="text-xl dark:text-slate-100">{selectedCheck?.period} System Log</DialogTitle>
                        </div>
                        <DialogDescription className="dark:text-slate-400">
                            Component verification and condition feedback.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedCheck && (
                        <div className="space-y-6 pt-4">
                            <div>
                                <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
                                    <Package className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                                    Hardware Components
                                </h4>
                                <div className="space-y-2 border border-slate-100 dark:border-slate-800 rounded-lg p-3 bg-slate-50/50 dark:bg-slate-900/50">
                                    {selectedCheck.items_checked.map((item, index) => (
                                        <div key={index} className="flex items-center justify-between text-sm">
                                            <span className="text-slate-700 dark:text-slate-200 font-medium">
                                                {item.component_name} <span className="text-slate-400 dark:text-slate-500">({item.quantity}x)</span>
                                            </span>
                                            {item.is_present ? (
                                                <Badge variant="secondary" className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50">
                                                    <Check className="w-3 h-3 mr-1" /> Present
                                                </Badge>
                                            ) : (
                                                <Badge variant="secondary" className="bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50">
                                                    <X className="w-3 h-3 mr-1" /> Missing
                                                </Badge>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                                    Operator Feedback
                                </h4>
                                <div className="text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-lg p-3 min-h-[80px]">
                                    {selectedCheck.notes || "No operational anomalies reported."}
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </Card>
    );
};

export default Dashboard;
