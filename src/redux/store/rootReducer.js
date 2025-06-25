import { combineReducers } from "redux";
import sidebarReducer from '../reducers/sidebarReducer';
import inventoryReducer from "../reducers/inventoryReducer";

const rootReducer = combineReducers({
    sidebar: sidebarReducer,
    inventory: inventoryReducer,
});

export default rootReducer;