import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { ResultAsync } from "neverthrow";
import { PackageCheck, AlertTriangle } from "lucide-react";

import { editRecord } from '../../redux/actions/recordActions';
import { editInventory } from "../../redux/actions/inventoryActions";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

const postURL = import.meta.env.VITE_DEVELOPMENT === "true"
    ? `http://${import.meta.env.VITE_LOCALHOST}:5000/api/records`
    : `https://cdiis-ois-server.vercel.app/api/records`;

const ReturnItemModal = ({ isOpen, onClose, record }) => {
    const dispatch = useDispatch();
    const items = useSelector((state) => state.inventory);

    const [item, setItem] = useState(null);
    const [components, setComponents] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const textareaRef = useRef(null);

    useEffect(() => {
        if (items && record?.item?.id) {
            const foundItem = items.find((i) => i?.id === record.item.id);
            const itemComponents = {};
            foundItem.items?.forEach((subItem) => itemComponents[subItem.name] = false);
            setItem(foundItem);
            setComponents(itemComponents);
        }
    }, [items, record]);

    console.log(record)

    const handleReturn = async (e) => {
        e.preventDefault();
        if (!confirm(`Confirm asset return processing?`)) return;

        setIsSubmitting(true);
        setError("");

        const feedbackText = textareaRef.current.value.trim();
        const allChecked = Object.values(components).every(Boolean);
        const feedback = feedbackText !== "" ? feedbackText : allChecked ? "All components verified intact." : "Incomplete components returned.";

        const configuration = {
            method: "post", url: postURL,
            data: {
                _id: record?._id,
                item: { id: record?.item.id },
                returned_items: components,
                feedback,
                date: new Date().toLocaleDateString('en-CA'),
                type: 'returned',
            }
        };

        const apiResult = await ResultAsync.fromPromise(axios(configuration), err => err.response?.data?.message || "Server error processing return.");

        if (apiResult.isErr()) {
            setError(apiResult.error);
            setIsSubmitting(false);
            return;
        }

        dispatch(editRecord(apiResult.value.data.result.updatedRecord));
        dispatch(editInventory(apiResult.value.data.result.returnedItem[0]._id, { status: apiResult.value.data.result.returnedItem[0].status }));

        setIsSubmitting(false);
        setItem(null);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <div className="flex items-center gap-2">
                        <PackageCheck className="w-6 h-6 text-emerald-600" />
                        <DialogTitle className="text-xl">Process Asset Return</DialogTitle>
                    </div>
                    <DialogDescription>Verify all components before finalizing the return sequence.</DialogDescription>
                </DialogHeader>

                <form onSubmit={handleReturn} className="space-y-6 pt-4">
                    {error && <div className="p-3 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-md flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> {error}</div>}

                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 flex justify-between items-center">
                        <div>
                            <p className="text-sm text-slate-500 font-medium mb-1">Asset Nomenclature</p>
                            <p className="text-base font-bold text-slate-900">{record?.item?.name}</p>
                        </div>
                        <Badge variant="secondary" className="font-mono">{record?.item?.id}</Badge>
                    </div>

                    <div className="space-y-3">
                        <Label className="text-sm font-semibold text-slate-900">Component Verification</Label>
                        <div className="grid grid-cols-1 gap-2 border border-slate-100 p-2 rounded-lg max-h-[200px] overflow-y-auto">
                            {item?.items.map((subItem) => (
                                <Label key={subItem.name} className={`flex items-center gap-3 p-3 rounded-md border transition-colors cursor-pointer ${components[subItem.name] ? "bg-emerald-50 border-emerald-200" : "bg-white border-slate-200 hover:bg-slate-50"}`}>
                                    <Checkbox checked={components[subItem.name] || false} onCheckedChange={(c) => setComponents(p => ({ ...p, [subItem.name]: c }))} className={components[subItem.name] ? "border-emerald-600 data-[state=checked]:bg-emerald-600" : ""} />
                                    <span className="font-medium text-sm">{subItem.name}</span>
                                </Label>
                            ))}
                            {!item?.items?.length && <p className="text-sm text-slate-500 p-2 italic">No sub-components registered.</p>}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="feedbackId">Operator Feedback</Label>
                        <Textarea ref={textareaRef} id="feedbackId" placeholder="Note any damages or missing parts..." className="resize-none h-20 bg-slate-50 focus-visible:ring-emerald-600" />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
                        <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white min-w-[120px]" disabled={isSubmitting}>
                            {isSubmitting ? "Processing..." : "Finalize Return"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
export default ReturnItemModal;
