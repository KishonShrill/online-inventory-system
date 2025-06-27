import { ADD, SET, REMOVE, EDIT } from '../actions/inventoryActions';

const initialState = [];

const inventoryReducer = (state = initialState, action) => {
    switch (action.type) {
        case ADD:
            return [...state, action.payload];

        case SET:
            return [...action.payload]; // overwrite with new array

        case EDIT:
            return state.map(item =>
                item._id === action.payload._id
                    ? { ...item, ...action.payload } // update the matching item
                    : item
            );

        case REMOVE:
            return state.filter(item => item._id !== action.payload); // remove by _id

        default:
            return state;
    }
};

export default inventoryReducer;
