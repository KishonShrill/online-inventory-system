import { attendanceTypes } from '../actions/attendanceActions';

const initialState = [];

const attendanceReducer = (state = initialState, action) => {
    switch (action.type) {
        case attendanceTypes.ADD_ATTENDANCE:
            return [...state, action.payload];

        case attendanceTypes.SET_ATTENDANCE:
            return [...action.payload]; // overwrite with new array

        case attendanceTypes.EDIT_ATTENDANCE:
            return state.map(item =>
                item._id === action.payload._id
                    ? { ...item, ...action.payload } // update the matching item
                    : item
            );

        case attendanceTypes.REMOVE_ATTENDANCE:
            return state.filter(item => item._id !== action.payload); // remove by _id

        default:
            return state;
    }
};

export default attendanceReducer;