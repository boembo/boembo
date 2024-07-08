// src/components/Home/layoutSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    layout: [
        {
            i: "TotalTaskWidget100",
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
};

const layoutSlice = createSlice({
    name: 'layout',
    initialState,
    reducers: {
        addWidget(state, action) {
            const newWidget = {
                i: `${action.payload.name}${state.layout.length}`,
                widget: action.payload.component,
                grid: {
                    x: 0,
                    y: 0,
                    w: action.payload.grid.w || 6, // Use width from layoutSetting or fallback to 6
                    h: action.payload.grid.h || 3, // Use height from layoutSetting or fallback to 3
                },
                setting: action.payload.setting,
            };
            state.layout.unshift(newWidget);
        },
        updateLayout: (state, action) => {
            state.layout = state.layout.map((widget) => {
                const updatedWidget = action.payload.find((item) => item.i === widget.i);
                return updatedWidget ? {...widget, grid: updatedWidget} : widget;
            });
        },
        updateWidgetSetting(state, action) {
            const {widgetId, settingName, value} = action.payload;
            state.layout = state.layout.map((widget) => {
                if (widget.i === widgetId) {
                    return {
                        ...widget,
                        setting: {
                            ...widget.setting,
                            [settingName]: {
                                ...widget.setting[settingName],
                                value,
                            },
                        },
                    };
                }
                return widget;
            });
        },
    },
});

export const {addWidget, updateLayout, updateWidgetSetting} = layoutSlice.actions;
export default layoutSlice.reducer;
