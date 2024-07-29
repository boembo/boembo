import { combineReducers } from '@reduxjs/toolkit';
import taskReducer from './taskSlice';

const rootReducer = combineReducers({
    tasks: taskReducer,
});

export default rootReducer;

