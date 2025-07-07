import { TOGGLE_DARK_MODE, SET_DARK_MODE } from "../actions/darkModeActions";

const initialState = {
    enabled: localStorage.getItem('theme') === 'dark',
};

const darkModeReducer = (state = initialState, action) => {
    switch (action.type) {
        case TOGGLE_DARK_MODE:
            const toggled = !state.enabled;
            localStorage.setItem('theme', toggled ? 'dark' : 'light');
            return {...state, enabled: toggled};

        case SET_DARK_MODE:
            localStorage.setItem('theme', action.playload ? 'dark' : 'light');
            return {...state, enabled: action.payload};
        
        default:
            return state;
    }
};
export default darkModeReducer;