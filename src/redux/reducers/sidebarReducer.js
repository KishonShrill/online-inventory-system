import { OPEN, CLOSE } from '../actions/sidebarActions';

const initialState = {
    isOpen: true,
};

const sidebarReducer = (state = initialState, action) => {
    switch(action.type) {
        case OPEN:
            return { ...state, isOpen: true };
        case CLOSE:
            return { ...state, isOpen: false };
        default:
            return state;
    }
};

export default sidebarReducer;