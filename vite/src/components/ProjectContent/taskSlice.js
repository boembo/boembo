import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    tasks: [],
    loading: false,
    error: null,
};

const taskSlice = createSlice({
    name: 'tasks',
    initialState,
    reducers: {
        fetchTasksRequest: (state) => {
            state.loading = true;
            state.error = null;
        },
        fetchTasksSuccess: (state, action) => {
            state.loading = false;
            state.tasks = action.payload;
        },
        fetchTasksFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        addTask: (state, action) => {
            state.tasks.push(action.payload);
        },
        updateTask: (state, action) => {
            const index = state.tasks.findIndex(task => task.id === action.payload.id);
            if (index !== -1) {
                state.tasks[index] = action.payload;
            }
        },
    },
});

export const {fetchTasksRequest, fetchTasksSuccess, fetchTasksFailure, addTask, updateTask} = taskSlice.actions;
export default taskSlice.reducer;
