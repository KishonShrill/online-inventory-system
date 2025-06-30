export const recordTypes = {
    SET_RECORDS: 'SET_RECORDS',
    ADD_RECORD: 'ADD_RECORD',
    EDIT_RECORD: 'EDIT_RECORD',
    REMOVE_RECORD: 'REMOVE_RECORD'
}

export const addRecord = (record) => {
    return {
        type: recordTypes.ADD_RECORD,
        payload: record,
    }
}

export const editRecord = (record) => {
    return {
        type: recordTypes.EDIT_RECORD,
        payload: record,
    }
}

export const setRecords = (records) => {
    return {
        type: recordTypes.SET_RECORDS,
        payload: records,
    };
};

export const removeRecord = (record) => {
    return {
        type: recordTypes.REMOVE_RECORD,
        payload: record,
    }
}
