// src/components/Home/store.js
import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import drawerReducer from './drawerSlice';
import widgetSettingsReducer from './widgetSettingsSlice';
import layoutReducer, {layoutMiddleware} from './layoutSlice';
import rootSaga from './sagas';

const sagaMiddleware = createSagaMiddleware();

const store = configureStore({
    reducer: {
        drawer: drawerReducer,
        widgetSettings: widgetSettingsReducer,
        layout: layoutReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(sagaMiddleware).concat(layoutMiddleware),
});

sagaMiddleware.run(rootSaga);

export default store;
