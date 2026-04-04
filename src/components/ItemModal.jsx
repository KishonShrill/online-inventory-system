import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { ResultAsync } from "neverthrow";
import { Trash2, Plus, QrCode, AlertTriangle, PackagePlus, Edit3, Save } from "lucide-react";

import { addInventory, editInventory, removeInventory } from "../redux/actions/inventoryActions";
import { Mode } from "../helpers/_variables";

// Shadcn UI Components
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const ItemModal = ({ onClose, initialInventory, itemId, mode, dispatch }) => {
    const item = useSelector((state) => state.inventory.find((i) => i._id === itemId));
    const isRemoveMode = mode === Mode.DELETE;

    // --- State Management ---
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        color: "",
        category: "",
        components: [],
    });

    const [generatedId, setGeneratedId] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    // --- Helper Functions ---
    const toProperCase = (str) =>
        str.toLowerCase().split(' ').filter(Boolean).map(word => word[0].toUpperCase() + word.slice(1)).join(' ');

    const generateQrCode = (id) => `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${id}`;

    const getEQPId = (state) => {
        if (typeof state === "string") return state;
        if (!state || !state.length) return 'EQP-0001';

        const sorted = [...state].sort((a, b) => {
            const numA = parseInt(a.id?.split('-')[1] || '0', 10);
            const numB = parseInt(b.id?.split('-')[1] || '0', 10);
            return numB - numA;
        });

        const highestId = parseInt(sorted[0].id?.split('-')[1] || '0', 10);
        return `EQP-${String(highestId + 1).padStart(4, '0')}`;
    };

    // --- Initialization Effect ---
    useEffect(() => {
        if (mode === Mode.ADD) {
            setGeneratedId(getEQPId(initialInventory));
        } else if (item) {
            setGeneratedId(item.id);
            setFormData({
                name: item.name || "",
                description: item.description || "",
                color: item.color || "",
                category: item.category || "",
                components: item.items ? item.items.map(c => ({ name: c.name, quantity: c.quantity })) : [],
            });
        }
    }, [mode, item, initialInventory]);

    // --- Component Array Handlers ---
    const addComponent = () => setFormData(prev => ({ ...prev, components: [...prev.components, { name: '', quantity: '' }] }));
    const removeComponent = (idx) => setFormData(prev => ({ ...prev, components: prev.components.filter((_, i) => i !== idx) }));
    const updateComponent = (idx, field, value) => {
        setFormData(prev => {
            const newComps = [...prev.components];
            newComps[idx][field] = field === 'quantity' ? (parseInt(value) || '') : value;
            return { ...prev, components: newComps };
        });
    };

    // --- API Logic via neverthrow ---
    const submitItemAPI = (configuration) => {
        return ResultAsync.fromPromise(
            axios(configuration),
            (err) => err.response?.data?.message || "An unexpected server error occurred."
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setIsSubmitting(true);

        const cleanData = {
            name: toProperCase(formData.name.trim()),
            description: toProperCase(formData.description.trim()),
            color: toProperCase(formData.color.trim()),
            category: toProperCase(formData.category.trim()),
            components: formData.components
                .filter(c => c.name.trim() && c.quantity > 0)
                .map(c => ({ ...c, name: toProperCase(c.name) }))
        };

        if (!cleanData.name || !cleanData.color || !cleanData.category) {
            setError("Name, Color, and Category are required.");
            setIsSubmitting(false);
            return;
        }

        const postURL = import.meta.env.VITE_DEVELOPMENT === "true"
            ? `http://${import.meta.env.VITE_LOCALHOST}:5000/api/items`
            : `https://cdiis-ois-server.vercel.app/api/items`;

        const configuration = isRemoveMode ? {
            method: "delete", url: postURL, data: { id: itemId, type: mode }
        } : {
            method: "post", url: postURL, data: {
                _id: itemId,
                id: generatedId,
                name: cleanData.name,
                description: cleanData.description,
                category: cleanData.category,
                color: cleanData.color,
                date_added: new Date().toISOString(),
                type: mode,
                items: cleanData.components,
            }
        };

        const apiResult = await submitItemAPI(configuration);

        if (apiResult.isErr()) {
            setError(apiResult.error);
            setIsSubmitting(false);
            return;
        }

        // Success Path
        const responseData = apiResult.value.data;
        if (responseData.type === Mode.ADD) dispatch(addInventory(responseData.result));
        if (responseData.type === Mode.UPDATE) dispatch(editInventory(responseData.result._id, responseData.result));
        if (responseData.type === Mode.DELETE) dispatch(removeInventory(responseData.result));

        onClose();
    };

    // --- Dynamic UI Variables ---
    const ui = {
        title: mode === Mode.ADD ? "Provision New Asset" : mode === Mode.UPDATE ? "Update Asset Details" : "Revoke Asset",
        icon: mode === Mode.ADD ? PackagePlus : mode === Mode.UPDATE ? Edit3 : AlertTriangle,
        iconColor: isRemoveMode ? "text-red-600" : "text-blue-600",
        btnText: isRemoveMode ? "Confirm Deletion" : "Save Asset Record",
        btnVariant: isRemoveMode ? "destructive" : "default"
    };

    return (
        <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto bg-white">
                <DialogHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <div className={`p-2 rounded-lg bg-slate-100 ${ui.iconColor}`}>
                            <ui.icon className="w-5 h-5" />
                        </div>
                        <DialogTitle className="text-2xl">{ui.title}</DialogTitle>
                    </div>
                    <DialogDescription>
                        {isRemoveMode
                            ? "Warning: This action will permanently remove this asset from the CDIIS network."
                            : "Enter the specifications and components for this hardware asset."}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                    {error && (
                        <div className="p-3 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-md flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4" /> {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Main Inputs */}
                        <div className="md:col-span-2 space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Asset Nomenclature (Name)</Label>
                                <Input
                                    id="name" placeholder="e.g. ThinkPad T14 Gen 3"
                                    value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    disabled={isRemoveMode || mode === Mode.UPDATE}
                                    className="bg-slate-50 focus-visible:ring-blue-600" required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Technical Description</Label>
                                <Textarea
                                    id="description" placeholder="Processor, RAM, identifying marks..."
                                    value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    disabled={isRemoveMode}
                                    className="bg-slate-50 focus-visible:ring-blue-600 resize-none h-24"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="category">Classification</Label>
                                    <Input
                                        id="category" placeholder="e.g. Electronics"
                                        value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        disabled={isRemoveMode} className="bg-slate-50" required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="color">Hardware Color</Label>
                                    <Input
                                        id="color" placeholder="e.g. Matte Black"
                                        value={formData.color} onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                        disabled={isRemoveMode} className="bg-slate-50" required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* QR Code Sidebar Display */}
                        <div className="flex flex-col items-center justify-start pt-6">
                            <div className="border border-slate-200 p-3 rounded-xl bg-slate-50 shadow-sm flex flex-col items-center">
                                <div className="flex items-center gap-2 text-slate-500 font-mono text-sm mb-3">
                                    <QrCode className="w-4 h-4" />
                                    {generatedId}
                                </div>
                                <img src={generateQrCode(generatedId)} alt="Asset QR Code" className="w-32 h-32 rounded-md bg-white border border-slate-100 mix-blend-multiply" />
                                <span className="text-[10px] text-slate-400 mt-3 text-center uppercase tracking-widest">CDIIS Registry Tag</span>
                            </div>
                        </div>
                    </div>

                    {/* Hardware Components Section */}
                    <div className="pt-4 border-t border-slate-100">
                        <div className="flex items-center justify-between mb-4">
                            <Label className="text-base">Peripheral Components</Label>
                            {!isRemoveMode && (
                                <Button type="button" variant="outline" size="sm" onClick={addComponent} className="h-8 text-blue-600 border-blue-200 hover:bg-blue-50">
                                    <Plus className="w-4 h-4 mr-1" /> Add Part
                                </Button>
                            )}
                        </div>

                        <div className="space-y-3">
                            {formData.components.length === 0 && !isRemoveMode && (
                                <div className="text-sm text-slate-400 italic text-center p-4 border border-dashed border-slate-200 rounded-lg">
                                    No peripheral components added.
                                </div>
                            )}

                            {formData.components.map((comp, idx) => (
                                <div key={idx} className="flex items-center gap-3 bg-slate-50 p-2 rounded-lg border border-slate-100">
                                    <Input
                                        placeholder="Component Name (e.g. Power Adapter)"
                                        value={comp.name} onChange={(e) => updateComponent(idx, 'name', e.target.value)}
                                        disabled={isRemoveMode} className="flex-1 bg-white"
                                    />
                                    <Input
                                        type="number" min="1" placeholder="Qty"
                                        value={comp.quantity} onChange={(e) => updateComponent(idx, 'quantity', e.target.value)}
                                        disabled={isRemoveMode} className="w-24 bg-white text-center"
                                    />
                                    {!isRemoveMode && (
                                        <Button type="button" variant="ghost" size="icon" onClick={() => removeComponent(idx)} className="text-red-500 hover:text-red-700 hover:bg-red-50 shrink-0">
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <DialogFooter className="pt-4 border-t border-slate-100 sm:justify-between">
                        <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button type="submit" variant={ui.btnVariant} disabled={isSubmitting} className="min-w-[140px]">
                            {isSubmitting ? (
                                <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing...</span>
                            ) : (
                                <span className="flex items-center gap-2"><Save className="w-4 h-4" /> {ui.btnText}</span>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default ItemModal;
