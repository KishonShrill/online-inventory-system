import { inventoryTypes } from '../actions/inventoryActions';

const initialState = [];

const inventoryReducer = (state = initialState, action) => {
    switch (action.type) {
        case inventoryTypes.ADD_INVENTORY:
            return [...state, action.payload];

        case inventoryTypes.SET_INVENTORY:
            return [...action.payload]; // overwrite with new array

        case inventoryTypes.EDIT_INVENTORY:
            return state.map(item =>
                item._id === action.payload._id
                    ? { ...item, ...action.payload.item } // update the matching item
                    : item
            );

        case inventoryTypes.REMOVE_INVENTORY:
            return state.filter(item => item._id !== action.payload); // remove by _id

        default:
            return state;
    }
};

export default inventoryReducer;
