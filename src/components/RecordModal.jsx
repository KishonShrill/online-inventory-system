import { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { ResultAsync } from "neverthrow";
import {
    ScanLine, Search, AlertTriangle, CalendarPlus,
    User, Phone, PackageCheck, PackageX
} from "lucide-react";

import { addRecord } from "../redux/actions/recordActions";
import { editInventory } from "../redux/actions/inventoryActions";
import { validateRecord } from "../helpers/validate";
import QRScannerModal from "./QRScannerModal";
import CustomDatalist from "./CustomDatalist";

// Shadcn UI
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

const postURL = import.meta.env.VITE_DEVELOPMENT === "true"
    ? `http://${import.meta.env.VITE_LOCALHOST}:5000/api/records`
    : `https://cdiis-ois-server.vercel.app/api/records`;

const submitRecordAPI = (configuration) => {
    return ResultAsync.fromPromise(
        axios(configuration),
        (err) => err.response?.data?.message || "An unexpected error occurred while logging the reservation."
    );
};

const RecordModal = ({ isOpen, onClose }) => {
    const dispatch = useDispatch();
    const inventory = useSelector((state) => state.inventory);

    const [isQROpen, setIsQROpen] = useState(false);
    const [itemId, setItemId] = useState('');
    const [userName, setUserName] = useState('');
    const [userContact, setUserContact] = useState('');
    const [date, setDate] = useState('');

    const [itemDetails, setItemDetails] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [notFound, setNotFound] = useState(false);
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Filter for Datalist
    const filteredItems = useMemo(() => {
        const search = itemId.toLowerCase();
        return inventory.filter(item =>
            item.id.toLowerCase().includes(search) || item.name.toLowerCase().includes(search)
        ).slice(0, 10);
    }, [itemId, inventory]);

    // Debounced Item Fetch
    useEffect(() => {
        if (!itemId) {
            setItemDetails(null);
            setNotFound(false);
            return;
        }

        const handler = setTimeout(() => {
            setIsLoading(true);
            setNotFound(false);
            const foundItem = inventory.find(i => i.id.toUpperCase() === itemId.toUpperCase());

            setItemDetails(foundItem || null);
            setNotFound(!foundItem);
            setIsLoading(false);
        }, 500);

        return () => clearTimeout(handler);
    }, [itemId, inventory]);

    const handleBorrow = async (e) => {
        e.preventDefault();
        setError("");

        // Frontend Validation
        const validatedRecord = validateRecord(userName, userContact, date);
        if (!validatedRecord.isFullyValid) {
            if (!validatedRecord.validUserName) return setError(`User Name must be formatted properly (e.g., Juan Dela Cruz).`);
            if (!validatedRecord.validUserContact) return setError(`Contact must be a valid phone number or email.`);
            if (!validatedRecord.validDate) return setError(`Reservation date must be scheduled for the future.`);
            return;
        }

        setIsSubmitting(true);

        const configuration = {
            method: "post",
            url: postURL,
            data: {
                user: { name: userName, contact: userContact },
                item: { _id: itemDetails._id, id: itemDetails.id, name: itemDetails.name },
                date: date,
                type: 'reserve',
            },
        };

        const apiResult = await submitRecordAPI(configuration);

        if (apiResult.isErr()) {
            setError(apiResult.error);
            setIsSubmitting(false);
            return;
        }

        // Success Path
        dispatch(addRecord(apiResult.value.data.result));
        dispatch(editInventory(apiResult.value.data.result.item._id, { status: "Reserved" }));

        setIsSubmitting(false);
        onClose();
    };

    const canBorrow = itemDetails && itemDetails.status === 'Available' && userName && userContact && date && !isSubmitting;

    // Reset state when closed
    useEffect(() => {
        if (!isOpen) {
            setItemId(''); setUserName(''); setUserContact(''); setDate('');
            setItemDetails(null); setError(""); setNotFound(false);
        }
    }, [isOpen]);

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto bg-white">
                <DialogHeader>
                    <div className="flex items-center gap-2 mb-1">
                        <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                            <CalendarPlus className="w-5 h-5" />
                        </div>
                        <DialogTitle className="text-xl">Log Asset Reservation</DialogTitle>
                    </div>
                    <DialogDescription>
                        Search for an asset and assign it to authorized personnel.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleBorrow} className="space-y-6 mt-2">
                    {error && (
                        <div className="p-3 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-md flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" /> {error}
                        </div>
                    )}

                    {/* Item Identification Section */}
                    <div className="space-y-3">
                        <Label htmlFor="itemId" className="text-slate-700">Asset Identifier</Label>
                        <div className="flex items-center gap-2">
                            <div className="relative flex-1">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                                    <Search className="w-4 h-4" />
                                </div>
                                <Input
                                    type="text" id="itemId" list="itemIDs"
                                    value={itemId} onChange={(e) => setItemId(e.target.value)}
                                    placeholder="Type or scan item ID (e.g., EQP-0001)"
                                    className="pl-10 h-11 bg-slate-50 focus-visible:ring-blue-600 uppercase font-mono"
                                    autoFocus
                                />
                                {isLoading && <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin" />}
                                <CustomDatalist id="itemIDs" items={filteredItems} />
                            </div>
                            <Button type="button" variant="outline" className="h-11 w-11 p-0 border-slate-300 text-slate-600 hover:text-blue-600 hover:bg-blue-50" onClick={() => setIsQROpen(prev => !prev)} title="Scan QR code">
                                <ScanLine className="w-5 h-5" />
                            </Button>
                        </div>

                        {isQROpen && (
                            <div className="p-2 border border-slate-200 rounded-lg bg-slate-50">
                                <QRScannerModal onDetected={(scannedText) => { setItemId(scannedText); setIsQROpen(false); }} />
                            </div>
                        )}

                        {/* Item Preview Card */}
                        {itemDetails && (
                            <div className={`p-4 rounded-lg border transition-colors ${itemDetails.status === 'Available' ? 'bg-emerald-50/50 border-emerald-100' : 'bg-red-50/50 border-red-100'}`}>
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h4 className="font-bold text-slate-900">{itemDetails.name}</h4>
                                        <p className="text-xs text-slate-500 font-medium">{itemDetails.category}</p>
                                    </div>
                                    <Badge variant="outline" className={itemDetails.status === 'Available' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-red-100 text-red-700 border-red-200'}>
                                        {itemDetails.status === 'Available' ? <PackageCheck className="w-3 h-3 mr-1" /> : <PackageX className="w-3 h-3 mr-1" />}
                                        {itemDetails.status}
                                    </Badge>
                                </div>
                                <div className="text-sm text-slate-600">
                                    <span className="font-semibold text-slate-700">Sub-components: </span>
                                    {itemDetails.items?.length > 0
                                        ? itemDetails.items.map(i => `${i.name} (${i.quantity})`).join(', ')
                                        : <span className="italic">None listed</span>
                                    }
                                </div>
                            </div>
                        )}

                        {notFound && (
                            <div className="p-4 rounded-lg border border-amber-200 bg-amber-50 text-amber-800 text-sm flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 shrink-0" />
                                Asset <span className="font-bold">{itemId}</span> not found in registry.
                            </div>
                        )}
                    </div>

                    <div className="border-t border-slate-100 my-4"></div>

                    {/* Personnel Information Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="userName" className="text-slate-700">Personnel Name</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input
                                    type="text" id="userName"
                                    value={userName} onChange={(e) => setUserName(e.target.value)}
                                    placeholder="Juan Dela Cruz"
                                    className="pl-9 bg-slate-50 focus-visible:ring-blue-600"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="userContact" className="text-slate-700">Contact Information</Label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input
                                    type="text" id="userContact"
                                    value={userContact} onChange={(e) => setUserContact(e.target.value)}
                                    placeholder="Email or Phone #"
                                    className="pl-9 bg-slate-50 focus-visible:ring-blue-600"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="reserveDate" className="text-slate-700">Deployment Date</Label>
                        <Input
                            type="date" id="reserveDate"
                            value={date} onChange={(e) => setDate(e.target.value)}
                            className="bg-slate-50 focus-visible:ring-blue-600 w-full md:w-1/2"
                        />
                    </div>

                    <DialogFooter className="pt-4 border-t border-slate-100">
                        <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white min-w-[140px]" disabled={!canBorrow}>
                            {isSubmitting ? "Processing..." : "Confirm Reservation"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default RecordModal;
