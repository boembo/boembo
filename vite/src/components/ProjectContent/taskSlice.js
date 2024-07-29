// taskSlice.js
import { createSlice } from '@reduxjs/toolkit';
import { fetchTasksRequest, createTaskRequest, updateTaskRequest, fetchGroupsRequest, createGroupRequest } from './taskSaga'; // Ensure the import path is correct

const initialState = {
    groups: [], // New state for groups
    tasks: [],
    loading: false,
    error: null,
};

const taskSlice = createSlice({
    name: 'tasks',
    initialState,
    reducers: {
        // Add reducers for groups
        fetchGroupsSuccess: (state, action) => {
            state.groups = action.payload;
            state.loading = false;
        },
        fetchGroupsFailure: (state, action) => {
            state.error = action.payload;
            state.loading = false;
        },
        createGroupSuccess: (state, action) => {
            state.groups.push(action.payload);
            state.loading = false;
        },
        createGroupFailure: (state, action) => {
            state.error = action.payload;
            state.loading = false;
        },
        // Existing reducers for tasks
        fetchTasksSuccess: (state, action) => {
            state.tasks = action.payload;
            state.loading = false;
        },
        fetchTasksFailure: (state, action) => {
            state.error = action.payload;
            state.loading = false;
        },
        createTaskSuccess: (state, action) => {
            state.tasks.push(action.payload);
            state.loading = false;
        },
        createTaskFailure: (state, action) => {
            state.error = action.payload;
            state.loading = false;
        },
        updateTaskSuccess: (state, action) => {
            const index = state.tasks.findIndex(task => task.id === action.payload.id);
            if (index !== -1) {
                state.tasks[index] = action.payload;
            }
            state.loading = false;
        },
        updateTaskFailure: (state, action) => {
            state.error = action.payload;
            state.loading = false;
        },
        deleteTaskSuccess: (state, action) => {
            state.tasks = state.tasks.filter(task => task.id !== action.payload);
            state.loading = false;
        },
        deleteTaskFailure: (state, action) => {
            state.error = action.payload;
            state.loading = false;
        },
    },
    extraReducers: (builder) => {
        builder
                .addCase(fetchTasksRequest.pending, (state) => {
                    state.loading = true;
                })
                .addCase(createTaskRequest.pending, (state) => {
                    state.loading = true;
                })
                .addCase(updateTaskRequest.pending, (state) => {
                    state.loading = true;
                })
                .addCase(deleteTaskRequest.pending, (state) => {
                    state.loading = true;
                })
                .addCase(fetchGroupsRequest.pending, (state) => {
                    state.loading = true;
                })
                .addCase(createGroupRequest.pending, (state) => {
                    state.loading = true;
                });
    },
});

export const {
    fetchTasksSuccess,
    fetchTasksFailure,
    createTaskSuccess,
    createTaskFailure,
    updateTaskSuccess,
    updateTaskFailure,
    deleteTaskSuccess,
    deleteTaskFailure,
    fetchGroupsSuccess,
    fetchGroupsFailure,
    createGroupSuccess,
    createGroupFailure,
} = taskSlice.actions;

export default taskSlice.reducer;
