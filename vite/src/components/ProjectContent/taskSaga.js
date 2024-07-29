// taskSaga.js
import { call, put, takeLatest } from 'redux-saga/effects';
import axios from 'axios';
import {
fetchTasksRequest,
        fetchTasksSuccess,
        fetchTasksFailure,
        createTaskRequest,
        createTaskSuccess,
        createTaskFailure,
        updateTaskRequest,
        updateTaskSuccess,
        updateTaskFailure,
        deleteTaskRequest,
        deleteTaskSuccess,
        deleteTaskFailure,
        fetchGroupsRequest,
        fetchGroupsSuccess,
        fetchGroupsFailure,
        createGroupRequest,
        createGroupSuccess,
        createGroupFailure,
        } from './taskSlice';

// Get token from localStorage
const getToken = () => localStorage.getItem('token');

// Fetch tasks
function* fetchTasksSaga(action) {
    try {
        const token = getToken();
        const response = yield call(axios.get, `http://localhost:3000/api/projects/${action.payload.projectId}/tasks`, {
            headers: {Authorization: `Bearer ${token}`},
        });
        yield put(fetchTasksSuccess(response.data));
    } catch (error) {
        yield put(fetchTasksFailure(error.message));
    }
}

// Create task
function* createTaskSaga(action) {
    try {
        const token = getToken();
        const response = yield call(axios.post, `http://localhost:3000/api/projects/${action.payload.projectId}/tasks`, action.payload, {
            headers: {Authorization: `Bearer ${token}`},
        });
        yield put(createTaskSuccess(response.data));
    } catch (error) {
        yield put(createTaskFailure(error.message));
    }
}

// Update task
function* updateTaskSaga(action) {
    try {
        const token = getToken();
        const response = yield call(axios.put, `http://localhost:3000/api/tasks/update`, action.payload, {
            headers: {Authorization: `Bearer ${token}`},
        });
        yield put(updateTaskSuccess(response.data));
    } catch (error) {
        yield put(updateTaskFailure(error.message));
    }
}

// Delete task
function* deleteTaskSaga(action) {
    try {
        const token = getToken();
        yield call(axios.delete, `http://localhost:3000/api/tasks/delete`, {
            data: {id: action.payload.id},
            headers: {Authorization: `Bearer ${token}`},
        });
        yield put(deleteTaskSuccess(action.payload.id));
    } catch (error) {
        yield put(deleteTaskFailure(error.message));
    }
}

// Fetch groups
function* fetchGroupsSaga(action) {
    try {
        const token = getToken();
        const response = yield call(axios.get, `http://localhost:3000/api/projects/${action.payload.projectId}/groups`, {
            headers: {Authorization: `Bearer ${token}`},
        });
        yield put(fetchGroupsSuccess(response.data));
    } catch (error) {
        yield put(fetchGroupsFailure(error.message));
    }
}

// Create group
function* createGroupSaga(action) {
    try {
        const token = getToken();
        const response = yield call(axios.post, `http://localhost:3000/api/projects/${action.payload.projectId}/groups`, action.payload, {
            headers: {Authorization: `Bearer ${token}`},
        });
        yield put(createGroupSuccess(response.data));
    } catch (error) {
        yield put(createGroupFailure(error.message));
    }
}

// Watcher sagas
export default function* taskSaga() {
    yield takeLatest(fetchTasksRequest.type, fetchTasksSaga);
    yield takeLatest(createTaskRequest.type, createTaskSaga);
    yield takeLatest(updateTaskRequest.type, updateTaskSaga);
    yield takeLatest(deleteTaskRequest.type, deleteTaskSaga);
    yield takeLatest(fetchGroupsRequest.type, fetchGroupsSaga);
    yield takeLatest(createGroupRequest.type, createGroupSaga);
}
