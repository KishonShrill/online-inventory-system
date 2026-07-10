import { TOGGLE_DARK_MODE } from "../actions/darkModeActions";

const initialState = {
    enabled: localStorage.getItem('theme') === 'dark' ? true : false,
};

export const darkModeReducer = (state = initialState, action) => {
    switch (action.type) {
        case TOGGLE_DARK_MODE:
            const newMode = !state.enabled;
            // Save the new preference to local storage immediately
            localStorage.setItem('theme', newMode ? 'dark' : 'light');

            return {
                ...state,
                enabled: newMode
            };
        default:
            return state;
    }
};
export default darkModeReducer;
