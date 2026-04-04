import { useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Navigate } from "react-router-dom";
import { jwtDecode } from 'jwt-decode';
import Cookies from "universal-cookie";
import axios from "axios";
import { ResultAsync } from "neverthrow";
import {
    ScanLine, Search, Sun, Moon, AlertTriangle,
    CheckCircle2, ClipboardCheck, Package, Info
} from "lucide-react";

import { addAttendance } from "../redux/actions/attendanceActions";
import QRScannerModal from "../components/QRScannerModal";
import CustomDatalist from "../components/CustomDatalist";
import { Role } from "../helpers/_variables";
import { getLocalISODateTime, itemHasBeenChecked } from "../helpers/dateUtils";

// Shadcn UI Components
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

const postURL = import.meta.env.VITE_DEVELOPMENT === "true"
    ? `http://${import.meta.env.VITE_LOCALHOST}:5000/api/attendances`
    : `https://cdiis-ois-server.vercel.app/api/attendances`;

// --- API Logic via neverthrow ---
const submitAttendanceAPI = (attendanceRecord) => {
    return ResultAsync.fromPromise(
        axios.post(postURL, attendanceRecord),
        (err) => err.response?.data?.message || "An unexpected error occurred while logging attendance."
    );
};

const ItemCheck = () => {
    const cookies = new Cookies();
    const token = cookies.get("CDIIS-OIS");
    const decoded = token ? jwtDecode(token) : { userRole: 'guest' };
    const dispatch = useDispatch();

    if (decoded.userRole !== Role.ADMIN && decoded.userRole !== Role.MANAGER) {
        alert("System clearance denied. Authorized personnel only.");
        return <Navigate to="/app/dashboard" replace />;
    }

    const attendances = useSelector((state) => state.attendance);
    const inventory = useSelector((state) => state.inventory);

    const timeOfDay = getLocalISODateTime().split('T')[1].split(':')[0] < 12 ? "Morning" : "Afternoon";
    const today = getLocalISODateTime().split('T')[0];

    // --- State ---
    const [isQROpen, setIsQROpen] = useState(false);
    const [isAlreadySubmitted, setIsAlreadySubmitted] = useState(false);
    const [attendance, setAttendance] = useState({});
    const [scannedId, setScannedId] = useState("");
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");
    const [item, setItem] = useState(null);
    const [notes, setNotes] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // --- Handlers ---
    const handleFetchItem = () => {
        setError("");
        setSuccess("");
        setItem(null);
        setIsAlreadySubmitted(false);

        if (!scannedId.trim()) {
            return setError("Please enter an Asset ID.");
        }

        const foundItem = inventory.find((i) => i.id === scannedId);

        if (!foundItem) {
            return setError("Asset ID not recognized in the registry. Please verify the tag.");
        }

        setItem(foundItem);

        const itemHistory = attendances.find(a => a.id === foundItem.id);
        const alreadyChecked = itemHistory && itemHasBeenChecked(itemHistory.attendance_checks, timeOfDay);

        if (alreadyChecked) {
            setError(`Verification locked: Asset has already been cleared for the ${timeOfDay} cycle.`);
            setIsAlreadySubmitted(true);
            return;
        }

        const initialAttendance = {};
        foundItem.items?.forEach((subItem) => {
            initialAttendance[subItem.name] = false;
        });
        setAttendance(initialAttendance);
    };

    const handleSubItemCheck = (subItemName, checkedState) => {
        setAttendance(prev => ({ ...prev, [subItemName]: checkedState }));
    };

    const handleSubmit = async () => {
        const isConfirmed = confirm("Confirm verification log? This action is recorded under your operator ID.");
        if (!isConfirmed) return;

        if (!item) return setError("No asset selected.");

        setIsSubmitting(true);
        setError("");

        const items_checked_payload = item.items.map(subItem => ({
            component_name: subItem.name,
            quantity: subItem.quantity || 1,
            is_present: !!attendance[subItem.name],
        }));

        const newAttendanceCheck = {
            timestamp: getLocalISODateTime(),
            period: timeOfDay,
            notes: notes,
            items_checked: items_checked_payload,
        };

        const attendanceRecord = {
            id: item.id,
            name: item.name,
            category: item.category,
            date: today,
            attendance_checks: newAttendanceCheck,
            submittedBy: { [timeOfDay]: decoded.userId },
        };

        const apiResult = await submitAttendanceAPI(attendanceRecord);

        if (apiResult.isErr()) {
            setError(apiResult.error);
            setIsSubmitting(false);
            return;
        }

        dispatch(addAttendance(apiResult.value.data.result));

        setSuccess(`Verification complete. ${item.name} logged for ${timeOfDay} session.`);
        setItem(null);
        setScannedId("");
        setNotes("");
        setAttendance({});
        setIsSubmitting(false);
    };

    const filteredItems = useMemo(() => {
        const search = scannedId.toLowerCase();
        return inventory
            .filter(item => item.id.toLowerCase().includes(search) || item.name.toLowerCase().includes(search))
            .slice(0, 10);
    }, [scannedId, inventory]);

    // UI Helpers
    const SessionIcon = timeOfDay === "Morning" ? Sun : Moon;
    const sessionColor = timeOfDay === "Morning" ? "text-amber-500 bg-amber-50 border-amber-200" : "text-indigo-500 bg-indigo-50 border-indigo-200";

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans flex justify-center items-start">
            <title>CDIIS OIS - Asset Verification</title>

            <div className="w-full max-w-3xl space-y-6">

                {/* Page Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                            <ClipboardCheck className="w-8 h-8 text-blue-600" />
                            Asset Verification
                        </h1>
                        <p className="text-slate-500 mt-1">Scan or manually enter an asset ID to log its components.</p>
                    </div>

                    {/* Dynamic Time/Session Badge */}
                    <div className="flex flex-col items-end">
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${sessionColor}`}>
                            <SessionIcon className="w-5 h-5" />
                            <div className="flex flex-col">
                                <span className="text-sm font-bold leading-none">{timeOfDay} Cycle</span>
                                <span className="text-xs font-medium opacity-80 mt-0.5">{today}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <Card className="border-slate-200 shadow-sm overflow-visible">
                    <CardHeader className="bg-white border-b border-slate-100 pb-6 rounded-t-xl">
                        <CardTitle className="text-lg text-slate-800">Identify Asset</CardTitle>
                        <CardDescription>Use a barcode scanner or search the registry.</CardDescription>

                        <div className="flex items-center gap-3 mt-4">
                            <div className="relative flex-1">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                                    <Search className="w-4 h-4" />
                                </div>
                                <Input
                                    type="text"
                                    list="itemIDs"
                                    value={scannedId}
                                    onChange={(e) => setScannedId(e.target.value.toUpperCase())}
                                    onKeyDown={(e) => e.key === "Enter" && handleFetchItem()}
                                    placeholder="e.g., EQP-0015"
                                    className="pl-10 h-12 text-lg font-mono uppercase bg-slate-50 border-slate-300 focus-visible:ring-blue-600"
                                />
                                <CustomDatalist id="itemIDs" items={filteredItems} />
                            </div>

                            <Button
                                onClick={handleFetchItem}
                                className="h-12 px-6 bg-slate-900 hover:bg-slate-800 text-white font-semibold"
                            >
                                Verify
                            </Button>

                            <Button
                                type="button"
                                variant="outline"
                                className="h-12 w-12 p-0 border-slate-300 text-slate-600 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-200"
                                onClick={() => setIsQROpen(prev => !prev)}
                                title="Open Camera Scanner"
                            >
                                <ScanLine className="w-5 h-5" />
                            </Button>
                        </div>

                        {/* Status Messages */}
                        {error && (
                            <div className="mt-4 p-3 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-md flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
                            </div>
                        )}
                        {success && (
                            <div className="mt-4 p-3 text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 shrink-0" /> {success}
                            </div>
                        )}
                    </CardHeader>

                    {/* QR Scanner Modal Placeholder */}
                    {isQROpen && (
                        <div className="p-4 border-b border-slate-100 bg-slate-50">
                            <QRScannerModal onDetected={(scannedText) => { setScannedId(scannedText.toUpperCase()); setIsQROpen(false); }} />
                        </div>
                    )}

                    {/* Verification Checklist */}
                    {item && !isAlreadySubmitted && (
                        <CardContent className="pt-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="flex items-start justify-between mb-6">
                                <div>
                                    <h3 className="text-2xl font-bold text-slate-900 mb-1">{item.name}</h3>
                                    <div className="flex items-center gap-3 text-sm">
                                        <Badge variant="secondary" className="font-mono text-slate-500 bg-slate-100">{item.id}</Badge>
                                        <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">{item.category}</Badge>
                                    </div>
                                </div>
                                <Package className="w-10 h-10 text-slate-200" />
                            </div>

                            {item.items && item.items.length > 0 ? (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 border-b border-slate-100 pb-2">
                                        <Info className="w-4 h-4 text-blue-500" />
                                        Verify Required Components
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {item.items.map((subItem) => (
                                            <Label
                                                key={subItem.name}
                                                className={`flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${attendance[subItem.name]
                                                        ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                                                        : "bg-white border-slate-200 hover:border-blue-300 hover:bg-slate-50"
                                                    }`}
                                            >
                                                <Checkbox
                                                    checked={attendance[subItem.name] || false}
                                                    onCheckedChange={(checked) => handleSubItemCheck(subItem.name, checked)}
                                                    className={attendance[subItem.name] ? "border-emerald-600 data-[state=checked]:bg-emerald-600" : ""}
                                                />
                                                <span className="font-medium">{subItem.name}</span>
                                                {subItem.quantity > 1 && (
                                                    <Badge variant="secondary" className="ml-auto text-xs">Qty: {subItem.quantity}</Badge>
                                                )}
                                            </Label>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-sm text-slate-500 italic bg-slate-50 p-4 rounded-lg border border-slate-100">
                                    No peripheral components logged for this asset.
                                </div>
                            )}

                            <div className="mt-8 space-y-2">
                                <Label htmlFor="notes" className="text-slate-700 font-semibold">Operator Feedback (Optional)</Label>
                                <Textarea
                                    id="notes"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Note any damages, missing pieces, or operational issues..."
                                    className="bg-white border-slate-200 focus-visible:ring-blue-600 resize-none h-24"
                                />
                            </div>
                        </CardContent>
                    )}

                    {item && !isAlreadySubmitted && (
                        <CardFooter className="bg-slate-50 border-t border-slate-100 py-4 flex justify-end">
                            <Button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="bg-blue-600 hover:bg-blue-700 text-white min-w-[150px]"
                            >
                                {isSubmitting ? "Processing..." : "Log Verification"}
                            </Button>
                        </CardFooter>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default ItemCheck;
