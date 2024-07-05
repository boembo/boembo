// src/components/Home/widgetSettingsSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    isOpen: false,
    selectedWidgetId: null,
    selectedWidgetSettings: {},
};

const widgetSettingsSlice = createSlice({
    name: 'widgetSettings',
    initialState,
    reducers: {
        openWidgetSettings(state, action) {
            state.isOpen = true;
            state.selectedWidgetId = action.payload.widgetId;
            state.selectedWidgetSettings = action.payload.settings;
        },
        closeWidgetSettings(state) {
            state.isOpen = false;
            state.selectedWidgetId = null;
            state.selectedWidgetSettings = {};
        },
        updateWidgetSetting(state, action) {
            const {settingName, value} = action.payload;
            if (state.selectedWidgetSettings[settingName]) {
                state.selectedWidgetSettings[settingName].value = value;
            }
        },
    },
});

export const {openWidgetSettings, closeWidgetSettings, updateWidgetSetting} = widgetSettingsSlice.actions;
export default widgetSettingsSlice.reducer;
