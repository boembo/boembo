import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Assuming you have a selector to retrieve the token from your Redux state

// Define the initial state without the layout
const initialState = {
    layout: [], // Initially empty, will be filled with API data
    status: 'idle', // Status to track async operation state
    error: null, // Error handling
};

// Async thunk to fetch widget settings from API
export const fetchWidgetSettings = createAsyncThunk(
        'layout/fetchWidgetSettings',
        async (_, { getState }) => {
    try {
        console.log("FETCH SETTINGS");
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
        console.log("Start update layoutSetting")
        const token = localStorage.getItem('token');
        const response = await axios.put('http://localhost:3000/api/settings/save', {newLayout: updatedLayout}, {
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
            console.log("addWidget");
            const newWidget = {
                i: `${action.payload.name}${state.layout.length}`,
                widget: action.payload.component,
                grid: {
                    x: 0,
                    y: 0,
                    w: action.payload.grid.w || 6,
                    h: action.payload.grid.h || 3,
                },
                setting: action.payload.setting,
            };
            state.layout.unshift(newWidget);

//            state.status = 'loading'; // Optional: Update loading status
            // Dispatch the async thunk
//            updateLayoutSettings(state.layout);
        },
        updateLayout(state, action) {
            console.log("update layout action");
            state.layout = state.layout.map((widget) => {
                const updatedWidget = action.payload.find((item) => item.i === widget.i);
                return updatedWidget ? {...widget, grid: updatedWidget} : widget;
            });
        },
        updateWidgetSetting(state, action) {
            console.log("update widgetSetting");
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
    extraReducers: (builder) => {
        builder
                .addCase(fetchWidgetSettings.pending, (state) => {
                    state.status = 'loading';
                })
                .addCase(fetchWidgetSettings.fulfilled, (state, action) => {
                    state.status = 'succeeded';
                    state.layout = JSON.parse(action.payload);
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
                const updatedLayout = store.getState().layout.layout;
                store.dispatch(updateLayoutSettings(updatedLayout));
            }

            return result;
        };

export default layoutSlice.reducer;
