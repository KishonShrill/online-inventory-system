import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import {
    addInventory,
    editInventory,
    removeInventory,
} from "../redux/actions/inventoryActions";
import axios from "axios";
import { Trash2 } from "lucide-react";
import { Mode } from "../helpers/_variables";


const ItemModal = ({ onClose, initialInventory, itemId, mode, dispatch }) => {
    const [removeMode, setRemoveMode] = useState(false);
    const [components, setComponents] = useState([]);
    const nameRef = useRef();
    const descRef = useRef();
    const colorRef = useRef();
    const categoryRef = useRef();

    const item = useSelector((state) =>
        state.inventory.find((i) => i._id === itemId)
    );
    const isItemNumber = String(itemId || ""); // Ensure password is a string and handle null/undefined

    let title = "Add New Item"; // default
    let submitBtnText = "Add Item";

    let initialData = {
        name: "",
        description: "",
        color: "",
        category: "",
        components: '',
    };

    useEffect(() => {
        if (mode === Mode.DELETE) {
            setRemoveMode(true);
        }
    }, [mode]);

    // OPTIONAL: Pre-fill components on edit
    useEffect(() => {
        if ((mode === Mode.UPDATE || mode === Mode.DELETE) && item?.items) {
            setComponents(item.items.map(({ name, quantity }) => ({ name, quantity })));
        }
    }, [item, mode]);

    // A real implementation would use a proper QR code library
    const generateQrCode = (id) =>
        `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${id}`;

    const getEQPId = (state) => {
        if (typeof state == "string") {
            return state;
        }

        if (!state.length) {
            return 'EQP-0001';
        }

        const sorted = [...state].sort((a, b) => {
            const numA = parseInt(a.id?.split('-')[1] || '0', 10);
            const numB = parseInt(b.id?.split('-')[1] || '0', 10);
            return numB - numA; // descending
        });

        const highestId = parseInt(sorted[0].id?.split('-')[1] || '0', 10);
        const nextIdNum = highestId + 1;

        return `EQP-${String(nextIdNum).padStart(4, '0')}`;
    };

    let newItemId = '';

    // Initialize Modal
    switch (mode) {
        case Mode.ADD:
            title = "Add New Item";
            submitBtnText = "Create";

            newItemId = `${String(getEQPId(initialInventory))}`

            break;

        case Mode.UPDATE:
            if (isItemNumber.length <= 0) {
                alert("No Item# is given...");
                return;
            }

            if (!item) {
                alert("Item not found");
                return null;
            }

            title = "Update Item";
            submitBtnText = "Edit";
            initialData = {
                name: item.name,
                description: item.description,
                color: item.color ?? "",
                category: item.category,
                components: item.items.map(({ name, quantity }) => ({ name, quantity })),
            };
            newItemId = `${String(getEQPId(item.id))}`
            break;

        case Mode.DELETE:
            title = "Delete Item";
            submitBtnText = "Delete";
            initialData = {
                name: item.name,
                description: item.description,
                color: item.color ?? "",
                category: item.category,
            };
            newItemId = `${String(getEQPId(item.id))}`
            break;

        default:
            alert("'mode' should either be ADD or EDIT");
            return;
    }

    const toProperCase = (str) =>
        str
            .toLowerCase()
            .split(' ')
            .filter(Boolean)
            .map(word => word[0].toUpperCase() + word.slice(1))
            .join(' ');

    const handleAddComponent = () => {
        setComponents([...components, { name: '', quantity: '' }]);
    };

    const handleRemoveComponent = (index) => {
        const newComponents = [...components];
        newComponents.splice(index, 1);
        setComponents(newComponents);
    };

    const handleComponentChange = (index, field, value) => {
        const newComponents = [...components];
        newComponents[index][field] = field === 'quantity' ? parseInt(value) || '' : value;
        setComponents(newComponents);
    };

    function handleSubmit(e) {
        e.preventDefault();

        const name = toProperCase(nameRef.current.value.trim());
        const description = toProperCase(descRef.current.value.trim());
        const color = toProperCase(colorRef.current.value.trim());
        const category = toProperCase(categoryRef.current.value.trim());
        const validComponents = components
            .filter(comp => comp.name.trim() && comp.quantity > 0)
            .map(comp => ({ ...comp, name: toProperCase(comp.name) }));

        if (!name || !color || !category) {
            alert("Name, Color, and Category are required.");
            return;
        }

        if (
            mode === Mode.UPDATE &&
            name === initialData.name &&
            description === initialData.description &&
            color === initialData.color &&
            category === initialData.category &&
            JSON.stringify(validComponents) === JSON.stringify(initialData.components)
        ) {
            alert("No changes were made.");
            return;
        }

        const postURL =
            import.meta.env.VITE_DEVELOPMENT === "true"
                ? `http://${import.meta.env.VITE_LOCALHOST}:5000/api/items`
                : `https://cdiis-ois-server.vercel.app/api/items`;

        const confirguation = removeMode
            ? {
                method: "delete",
                url: postURL,
                data: {
                    id: itemId,
                    type: mode,
                },
            }
            : {
                method: "post",
                url: postURL,
                data: {
                    _id: itemId,
                    id: newItemId,
                    name: name,
                    description: description,
                    category: category,
                    color: color,
                    date_added: new Date().toISOString(),
                    type: mode,
                    items: validComponents,
                },
            };

        axios(confirguation)
            .then((res) => {
                // console.log(res.data)
                console.log(JSON.stringify(res.data.result))
                if (res.data.type === Mode.ADD) dispatch(addInventory(res.data.result));
                if (res.data.type === Mode.UPDATE)
                    dispatch(editInventory(res.data.result._id, res.data.result));
                if (res.data.type === Mode.DELETE)
                    dispatch(removeInventory(res.data.result));
                alert(res.data.message);
                onClose();
            })
            .catch((err) => {
                console.log(err);
                alert(err.response.data.message);
            });
    }

    return (
        <>
            <div className="inventory__modal-container">
                <div className="inventory__modal">
                    <h3 className="inventory__modal-title">{title}</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="modal-input-container">
                            <label className="inventory__modal-label" htmlFor="name">
                                Item Name
                            </label>
                            <input
                                ref={nameRef}
                                className="inventory__modal-input input"
                                id="name"
                                type="text"
                                placeholder="e.g. MacBook Pro"
                                defaultValue={initialData.name}
                                autoComplete="false"
                                required
                                readOnly={removeMode || mode === Mode.UPDATE}
                                style={
                                    mode === Mode.UPDATE || removeMode
                                        ? { cursor: "not-allowed" }
                                        : null
                                }
                            />
                        </div>
                        <div className="modal-input-container">
                            <label className="inventory__modal-label" htmlFor="description">
                                Description
                            </label>
                            <textarea
                                ref={descRef}
                                className="inventory__modal-input input"
                                id="description"
                                placeholder="Any relevant details"
                                defaultValue={initialData.description}
                                readOnly={removeMode}
                                style={mode === Mode.DELETE ? { cursor: "not-allowed" } : null}
                            ></textarea>
                        </div>
                        <div className="grid-2-cols modal-input-container">
                            <div>
                                <label className="inventory__modal-label" htmlFor="color">
                                    Color
                                </label>
                                <input
                                    ref={colorRef}
                                    className="inventory__modal-input"
                                    list="colors"
                                    id="color"
                                    type="text"
                                    placeholder="e.g. Silver"
                                    defaultValue={initialData.color}
                                    required
                                    readOnly={removeMode}
                                    style={
                                        mode === Mode.DELETE ? { cursor: "not-allowed" } : null
                                    }
                                />
                                <datalist id="colors">
                                    <option value="Red" />
                                    <option value="Green" />
                                    <option value="Blue" />
                                    <option value="Yellow" />
                                    <option value="Black" />
                                </datalist>
                            </div>
                            <div>
                                <label className="inventory__modal-label" htmlFor="category">
                                    Category
                                </label>
                                <input
                                    ref={categoryRef}
                                    className="inventory__modal-input"
                                    id="category"
                                    type="text"
                                    placeholder="e.g. Electronics"
                                    defaultValue={initialData.category}
                                    required
                                    readOnly={removeMode}
                                    style={
                                        mode === Mode.DELETE ? { cursor: "not-allowed" } : null
                                    }
                                />
                            </div>
                        </div>

                        <div className="modal-input-container">
                            <label className="inventory__modal-label">Item Components</label>
                            {components.map((comp, index) => (
                                <div key={index} className="grid-5-cols modal-input-container">
                                    <input
                                        type="text"
                                        placeholder="Component Name"
                                        value={comp.name}
                                        onChange={(e) => handleComponentChange(index, 'name', e.target.value)}
                                        className="inventory__modal-input input"
                                        style={{ gridColumnStart: 1, gridColumnEnd: 4, ...(mode === Mode.DELETE ? { cursor: "not-allowed" } : null) }}
                                        required={comp.quantity > 0}
                                    />
                                    <input
                                        type="number"
                                        placeholder="##"
                                        min="1"
                                        value={comp.quantity}
                                        onChange={(e) => handleComponentChange(index, 'quantity', e.target.value)}
                                        className="inventory__modal-input input"
                                        style={mode === Mode.DELETE ? { cursor: "not-allowed" } : null}
                                        required={comp.name.trim() !== ''}
                                    />
                                    {!removeMode && (
                                        <button
                                            type="button"
                                            className="modal-actions-danger"
                                            onClick={() => handleRemoveComponent(index)}
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button type="button" className="modal-actions-add justify-self-end" onClick={handleAddComponent}>
                                + Add Component
                            </button>
                        </div>

                        <div className="modal-qr-container">
                            <p className="modal-qr-description">
                                Generated QR Code for ID: {newItemId}
                            </p>
                            <img
                                src={generateQrCode(newItemId)}
                                alt="QR Code"
                                className="modal-qr-image"
                            />
                        </div>

                        <div className="modal-actions-container">
                            <button
                                onClick={onClose}
                                type="button"
                                className="modal-actions-cancel"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="modal-actions-add"
                                style={removeMode ? { backgroundColor: "red" } : undefined}
                            >
                                {submitBtnText}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default ItemModal;