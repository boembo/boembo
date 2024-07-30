import { createSlice } from '@reduxjs/toolkit';

// Define the initial state of your slice
const initialState = {
    tasks: [],
    groups: [],
    loading: false,
    error: null
};

const defaultGroups = [
    {id: '1', name: 'To Do'},
    {id: '2', name: 'Processing'},
    {id: '3', name: 'Complete'},
];

// Create a slice of the store
const taskSlice = createSlice({
    name: 'tasks',
    initialState,
    reducers: {
        // Fetch tasks
        fetchTasksRequest: (state) => {
            state.loading = true;
            state.error = null;
        },
        fetchTasksSuccess: (state, action) => {
            state.loading = false;
            state.tasks = action.payload.tasks || []; // Ensure tasks is defined
            state.groups = action.payload.tasks.length ? action.payload.groups : defaultGroups;
        },
        fetchTasksFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        // Create task
        createTaskRequest: (state) => {
            state.loading = true;
            state.error = null;
        },
        createTaskSuccess: (state, action) => {
            state.loading = false;
            state.tasks.push(action.payload);
        },
        createTaskFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        // Update task
        updateTaskRequest: (state) => {
            state.loading = true;
            state.error = null;
        },
        updateTaskSuccess: (state, action) => {
            state.loading = false;
            const index = state.tasks.findIndex(task => task.id === action.payload.id);
            if (index !== -1) {
                state.tasks[index] = action.payload;
            }
        },
        updateTaskFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        // Delete task
        deleteTaskRequest: (state) => {
            state.loading = true;
            state.error = null;
        },
        deleteTaskSuccess: (state, action) => {
            state.loading = false;
            state.tasks = state.tasks.filter(task => task.id !== action.payload.id);
        },
        deleteTaskFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        // Update group order
        updateGroupOrderRequest: (state) => {
            state.loading = true;
            state.error = null;
        },
        updateGroupOrderSuccess: (state, action) => {
            state.loading = false;
            state.groups = action.payload;
        },
        updateGroupOrderFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        // Create group
        createGroupRequest: (state) => {
            state.loading = true;
            state.error = null;
        },
        createGroupSuccess: (state, action) => {
            state.loading = false;
            state.groups.push(action.payload);
        },
        createGroupFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        // Delete group
        deleteGroupRequest: (state) => {
            state.loading = true;
            state.error = null;
        },
        deleteGroupSuccess: (state, action) => {
            state.loading = false;
            state.groups = state.groups.filter(group => group.id !== action.payload.id);
        },
        deleteGroupFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        }
    }
});

// Export actions
export const {
    fetchTasksRequest, fetchTasksSuccess, fetchTasksFailure,
    createTaskRequest, createTaskSuccess, createTaskFailure,
    updateTaskRequest, updateTaskSuccess, updateTaskFailure,
    deleteTaskRequest, deleteTaskSuccess, deleteTaskFailure,
    updateGroupOrderRequest, updateGroupOrderSuccess, updateGroupOrderFailure,
    createGroupRequest, createGroupSuccess, createGroupFailure,
    deleteGroupRequest, deleteGroupSuccess, deleteGroupFailure
} = taskSlice.actions;

// Export the reducer
export default taskSlice.reducer;
