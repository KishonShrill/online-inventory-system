import { ADD, SET, REMOVE } from '../actions/inventoryActions';

const initialState = [];

const inventoryReducer = (state = initialState, action) => {
    switch (action.type) {
        case ADD:
            return [...state, action.payload];

        case SET:
            return [...action.payload]; // overwrite with new array

        case REMOVE:
            return state.filter(item => item._id !== action.payload); // remove by _id

        default:
            return state;
    }
};

export default inventoryReducer;
