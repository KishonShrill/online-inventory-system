import { combineReducers } from "redux";
import sidebarReducer from '../reducers/sidebarReducer';
import inventoryReducer from "../reducers/inventoryReducer";
import recordReducer from "../reducers/recordReducer";

const rootReducer = combineReducers({
    sidebar: sidebarReducer,
    inventory: inventoryReducer,
    record: recordReducer,
});

export default rootReducer;