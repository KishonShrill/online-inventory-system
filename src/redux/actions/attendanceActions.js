export const attendanceTypes = {
    ADD_ATTENDANCE: 'ADD_ATTENDANCE',
    SET_ATTENDANCE: 'SET_ATTENDANCE',
    REMOVE_ATTENDANCE: 'REMOVE_ATTENDANCE',
    EDIT_ATTENDANCE: 'EDIT_ATTENDANCE',
}

export const addAttendance = (attendance) => {
    return {
        type: attendanceTypes.ADD_ATTENDANCE,
        payload: attendance,
    }
};

export const editAttendance = (attendance) => {
    return {
        type: attendanceTypes.EDIT_ATTENDANCE,
        payload: attendance,
    }
};

export const setAttendance = (attendances) => {
    return {
        type: attendanceTypes.SET_ATTENDANCE,
        payload: attendances,
    }
};

export const removeAttendance = (attendanceId) => {
    return {
        type: attendanceTypes.REMOVE_ATTENDANCE,
        payload: attendanceId,
    }
};