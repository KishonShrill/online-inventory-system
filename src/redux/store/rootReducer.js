import { combineReducers } from "redux";
import sidebarReducer from '../reducers/sidebarReducer';

const rootReducer = combineReducers({
    sidebar: sidebarReducer
});

export default rootReducer;