export const OPEN = 'OPEN';
export const CLOSE = 'CLOSE';

export const openSidebar = () => {
    return {
        type: OPEN,
    }
}

export const closeSidebar = () => {
    return {
        type: CLOSE,
    }
}