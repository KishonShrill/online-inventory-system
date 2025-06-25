export const ADD = 'ADD';
export const SET = 'SET';
export const REMOVE = 'REMOVE';

export const addInventory = (item) => {
    return {
        type: ADD,
        payload: item,
    }
};

export const setInventory = (items) => {
    return {
        type: SET,
        payload: items,
    };
};

export const removeInventory = (itemId) => {
    return {
        type: REMOVE,
        payload: itemId,
    }
}