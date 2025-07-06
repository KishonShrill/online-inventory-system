import { combineReducers } from "redux";
import sidebarReducer from '../reducers/sidebarReducer';
import inventoryReducer from "../reducers/inventoryReducer";
import recordReducer from "../reducers/recordReducer";
import attendanceReducer from "../reducers/attendanceReducer";

const rootReducer = combineReducers({
    sidebar: sidebarReducer,
    inventory: inventoryReducer,
    record: recordReducer,
    attendance: attendanceReducer,
});

export default rootReducer;