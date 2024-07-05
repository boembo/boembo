// src/components/Home/sagas.js
import { takeLatest, put, select } from 'redux-saga/effects';
import { openWidgetSettings, closeWidgetSettings, updateWidgetSetting } from './widgetSettingsSlice';
import { addWidget } from './layoutSlice';

function* handleOpenWidgetSettings(action) {
    // Logic for opening widget settings, if any additional async operations are needed
}

function* handleCloseWidgetSettings() {
    // Logic for closing widget settings, if any additional async operations are needed
}

function* handleUpdateWidgetSetting(action) {
    const {widgetId, settingName, value} = action.payload;
    const layout = yield select((state) => state.layout.layout);
    const updatedLayout = layout.map((widget) => {
        if (widget.i === widgetId) {
            return {
                ...widget,
                setting: {
                    ...widget.setting,
                    [settingName]: {
                        ...widget.setting[settingName],
                        value: value,
                    },
                },
            };
        }
        return widget;
    });

    yield put({type: 'layout/updateLayout', payload: updatedLayout});
}

function* handleAddWidget(action) {
    // Logic for adding a widget, if any additional async operations are needed
}

export default function* rootSaga() {
    yield takeLatest(openWidgetSettings.type, handleOpenWidgetSettings);
    yield takeLatest(closeWidgetSettings.type, handleCloseWidgetSettings);
    yield takeLatest(updateWidgetSetting.type, handleUpdateWidgetSetting);
    yield takeLatest(addWidget.type, handleAddWidget);
}
