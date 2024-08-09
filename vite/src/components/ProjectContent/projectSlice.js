import { createSlice } from '@reduxjs/toolkit';
import { call, put, takeEvery } from 'redux-saga/effects';
import axios from 'axios';

// Initial state
const initialState = {
    members: [],
    loading: false,
    error: null,
    allUsers: [],
};

// Slice
const projectSlice = createSlice({
    name: 'project',
    initialState,
    reducers: {
        fetchProjectMembersRequest: (state) => {
            state.loading = true;
        },
        fetchProjectMembersSuccess: (state, action) => {
            state.loading = false;
            state.members = action.payload;
        },
        fetchProjectMembersFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        fetchAllUsersRequest: (state) => {
            state.loading = true;
        },
        fetchAllUsersSuccess: (state, action) => {
            state.loading = false;
            state.allUsers = action.payload;
        },
        fetchAllUsersFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        syncMembersRequest: (state) => {
            state.loading = true;
        },
        syncMembersSuccess: (state, action) => {
            state.loading = false;
            state.members = action.payload;
        },
        syncMembersFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
    },
});

export const {
    fetchProjectMembersRequest,
    fetchProjectMembersSuccess,
    fetchProjectMembersFailure,
    fetchAllUsersRequest,
    fetchAllUsersSuccess,
    fetchAllUsersFailure,
    syncMembersRequest,
    syncMembersSuccess,
    syncMembersFailure,
} = projectSlice.actions;

export default projectSlice.reducer;

// Sagas
function* fetchProjectMembers(action) {
    try {
        const token = localStorage.getItem('token');
        const response = yield call(axios.get, `http://localhost:3000/api/projects/${action.payload}/members`, {
            headers: {Authorization: `Bearer ${token}`},
        });
        yield put(fetchProjectMembersSuccess(response.data));
    } catch (error) {
        yield put(fetchProjectMembersFailure(error.message));
    }
}

function* fetchAllUsers() {
    try {
        const token = localStorage.getItem('token');
        const response = yield call(axios.get, 'http://localhost:3000/api/users/all', {
            headers: {Authorization: `Bearer ${token}`},
        });
        yield put(fetchAllUsersSuccess(response.data));
    } catch (error) {
        yield put(fetchAllUsersFailure(error.message));
    }
}

function* syncMembers(action) {
    try {
        const token = localStorage.getItem('token');
        const response = yield call(axios.post, `http://localhost:3000/api/projects/${action.payload.projectId}/members/sync`, {
            memberIds: action.payload.memberIds,
        }, {
            headers: {Authorization: `Bearer ${token}`},
        });
        yield put(syncMembersSuccess(response.data));
    } catch (error) {
        yield put(syncMembersFailure(error.message));
    }
}

// Watcher saga
function* projectSaga() {
    yield takeEvery(fetchProjectMembersRequest.type, fetchProjectMembers);
    yield takeEvery(fetchAllUsersRequest.type, fetchAllUsers);
    yield takeEvery(syncMembersRequest.type, syncMembers);
}

export { projectSaga };
