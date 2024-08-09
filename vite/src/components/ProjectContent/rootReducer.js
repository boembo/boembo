import { combineReducers } from '@reduxjs/toolkit';
import taskReducer from './taskSlice';
import projectReducer from './projectSlice';

const rootReducer = combineReducers({
    tasks: taskReducer,
    project: projectReducer,
});

export default rootReducer;

