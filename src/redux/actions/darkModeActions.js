export const TOGGLE_DARK_MODE = 'TOGGLE_DARK_MODE';
export const SET_DARK_MODE = 'SET_DARK_MODE';

export const toggleDarkMode = () => {
    return {
        type: TOGGLE_DARK_MODE,
    };
};

export const setDarkMode = (enabled) => {
    return{
        type: SET_DARK_MODE,
        payload: enabled,
    };

};
