import { combineReducers } from '@reduxjs/toolkit';
import drawerReducer from '../components/Home/drawerSlice';
import layoutReducer from '../components/Home/layoutSlice';
import widgetSettingsReducer from '../components/Home/widgetSettingsSlice';
import taskReducer from '../components/ProjectContent/taskSlice';

const rootReducer = combineReducers({
    drawer: drawerReducer,
    layout: layoutReducer,
    widgetSettings: widgetSettingsReducer,
    tasks: taskReducer,
});

export default rootReducer;
