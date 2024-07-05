// src/components/Home/layoutSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    layout: [
        {
            i: "TotalTaskWidget0",
            widget: "./TotalTaskWidget",
            grid: {x: 0, y: 0, w: 6, h: 4},
            setting: {
                showTitle: {type: "boolean", value: false},
                backgroundColor: {
                    type: "select",
                    value: "red",
                    options: [
                        {value: "red", label: "Red"},
                        {value: "blue", label: "Blue"},
                    ],
                },
            },
        },
    ],
    count: 1,
};

const layoutSlice = createSlice({
    name: 'layout',
    initialState,
    reducers: {
        addWidget(state, action) {
            const newModule = {
                i: action.payload.name + state.count,
                widget: action.payload.component,
                grid: {x: 0, y: 0, w: 6, h: 3},
                setting: action.payload.setting,
            };
            state.layout = [newModule, ...state.layout];
            state.count += 1;
        },
        updateWidgetSetting(state, action) {
            const {widgetId, settingName, value} = action.payload;
            const widget = state.layout.find(item => item.i === widgetId);
            if (widget) {
                widget.setting[settingName].value = value;
            }
        },
    },
});

export const {addWidget, updateWidgetSetting} = layoutSlice.actions;
export default layoutSlice.reducer;
