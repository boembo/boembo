import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';



const availableWidgets = [
    {
        name: "Total Task Widget",
        component: './TotalTaskWidget',
        grid: {x: 0, y: 0, w: 6, h: 3},
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
    {
        name: "Team Task Widget",
        component: './TeamTaskWidget',
        grid: {x: 0, y: 0, w: 8, h: 8},
        setting: {
            showTitle: {type: "boolean", value: false},
            backgroundColor: {
                type: "select",
                value: "green",
                options: [
                    {value: "green", label: "Green"},
                    {value: "yellow", label: "Yellow"},
                ],
            },
        },
    },
];

// Define the initial state
const initialState = {
    layout: [],
    widgetSettings: {}, // Changed to an object for easier lookup
    availableWidgets: availableWidgets,
    status: 'idle',
    error: null,
};

// Async thunk to fetch widget settings from API
export const fetchWidgetSettings = createAsyncThunk(
        'layout/fetchWidgetSettings',
        async (_, { getState }) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:3000/api/widgetSettings', {
            headers: {Authorization: `Bearer ${token}`},
        });
        return response.data; // Assuming API returns an array of widget settings
    } catch (error) {
        console.error('Error fetching widget settings:', error);
        throw error;
}
}
);

// Async thunk to update layout settings on the server
export const updateLayoutSettings = createAsyncThunk(
        'layout/updateLayoutSettings',
        async (updatedLayout, { getState }) => {
    try {
        const updateData = {layout: updatedLayout.layout, widgetSettings: updatedLayout.widgetSettings}
        const token = localStorage.getItem('token');
        const response = await axios.put('http://localhost:3000/api/settings/save', {newLayout: updateData}, {
            headers: {Authorization: `Bearer ${token}`},
        });
        return response.data;
    } catch (error) {
        // More specific error handling
        if (error.response) {
            console.error("Server Error:", error.response.data);
        } else {
            console.error("Network Error:", error.message);
        }
        throw error;
}
}
);

// Create layout slice with reducers and async thunk
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
                    w: action.payload.grid.w || 6,
                    h: action.payload.grid.h || 3,
                },
            };

            // Check if settings exist, if not, use default settings from availableWidgets
            const defaultSettings = availableWidgets.find(widget => widget.name === action.payload.name).setting;
            console.log("defaultSettings");
            console.log(defaultSettings);
            state.widgetSettings = {
                ...state.widgetSettings,
                [newWidget.i]: defaultSettings,
            };

            console.log("state.widgetSettings");
            console.log(state.widgetSettings);

            state.layout.unshift(newWidget);
        },
        updateLayout(state, action) {
            state.layout = state.layout.map((widget) => {
                const updatedWidget = action.payload.find((item) => item.i === widget.i);
                return updatedWidget ? {...widget, grid: updatedWidget} : widget;
            });
        },
        updateWidgetSetting(state, action) {
            console.log("update widgetSetting");
            const {widgetId, settingName, value} = action.payload;

            console.log(widgetId);
            console.log(settingName);
            console.log(value);
            state.widgetSettings[widgetId] = {
                ...state.widgetSettings[widgetId],
                [settingName]: {
                    ...state.widgetSettings[widgetId][settingName],
                    value,
                },
            };

            console.log(state.widgetSettings[widgetId]);
            console.log(state.widgetSettings);
        },
    },
    extraReducers: (builder) => {
        builder
                .addCase(fetchWidgetSettings.pending, (state) => {
                    state.status = 'loading';
                })
                .addCase(fetchWidgetSettings.fulfilled, (state, action) => {
                    state.status = 'succeeded';
                    const data = JSON.parse(action.payload);
                    console.log("data from fetch API");
                    console.log(data);
                    state.layout = data.layout || [];
                    state.widgetSettings = data.widgetSettings || {};

                    // Merge fetched settings with default settings if any are missing

                })
                .addCase(fetchWidgetSettings.rejected, (state, action) => {
                    state.status = 'failed';
                    state.error = action.error.message;
                })
                .addCase(updateLayoutSettings.pending, (state) => {
                    state.status = 'loading';
                })
                .addCase(updateLayoutSettings.fulfilled, (state, action) => {
                    state.status = 'succeeded';
                })
                .addCase(updateLayoutSettings.rejected, (state, action) => {
                    state.status = 'failed';
                    state.error = action.error.message;
                });
    },
});

export const {addWidget, updateLayout, updateWidgetSetting} = layoutSlice.actions;
// Middleware to handle triggering updateLayoutSettings thunk on layout changes
export const layoutMiddleware = (store) => (next) => (action) => {
            const result = next(action);

            if (
                    action.type === 'layout/updateWidgetSetting' ||
                    action.type === 'layout/addWidget') {

                console.log("CALL update layout");
                const updatedSetting = store.getState().layout;
                store.dispatch(updateLayoutSettings(updatedSetting));
            }

            return result;
        };
export default layoutSlice.reducer;
