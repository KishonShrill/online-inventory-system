import { recordTypes } from "../actions/recordActions";

const initialState = [];

const recordReducer = (state = initialState, action) => {
    switch (action.type) {
        case recordTypes.ADD_RECORD:
            return [...state, action.payload];

        case recordTypes.SET_RECORDS:
            return [...action.payload];

        case recordTypes.EDIT_RECORD:
            return state.map(item =>
                item._id === action.payload._id
                    ? { ...item, ...action.payload }
                    : item
            );

        case recordTypes.REMOVE_RECORD:
            return state.filter(item => item._id !== action.payload);
        
        default:
            return state;
    }
}

export default recordReducer;