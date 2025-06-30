 export const inventoryTypes = {
    ADD_INVENTORY: 'ADD_INVENTORY',
    SET_INVENTORY:'SET_INVENTORY',
    REMOVE_INVENTORY: 'REMOVE_INVENTORY',
    EDIT_INVENTORY: 'EDIT_INVENTORY',
}

export const addInventory = (item) => {
    return {
        type: inventoryTypes.ADD_INVENTORY,
        payload: item,
    }
};

export const editInventory = (item) => {
    return {
        type: inventoryTypes.EDIT_INVENTORY,
        payload: item,
    }
}

export const setInventory = (items) => {
    return {
        type: inventoryTypes.SET_INVENTORY,
        payload: items,
    };
};

export const removeInventory = (itemId) => {
    return {
        type: inventoryTypes.REMOVE_INVENTORY,
        payload: itemId,
    }
}