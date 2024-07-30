import { call, put, takeEvery } from 'redux-saga/effects';
import axios from 'axios';
import {
fetchTasksRequest, fetchTasksSuccess, fetchTasksFailure,
        createTaskRequest, createTaskSuccess, createTaskFailure,
        updateTaskRequest, updateTaskSuccess, updateTaskFailure,
        deleteTaskRequest, deleteTaskSuccess, deleteTaskFailure,
        updateGroupOrderRequest, updateGroupOrderSuccess, updateGroupOrderFailure,
        createGroupRequest, createGroupSuccess, createGroupFailure,
        deleteGroupRequest, deleteGroupSuccess, deleteGroupFailure
        } from './taskSlice';


const defaultGroups = [
    {id: '1', name: 'To Do'},
    {id: '2', name: 'Processing'},
    {id: '3', name: 'Complete'},
];

// Fetch tasks
function* fetchTasks(action) {
    try {
        const token = localStorage.getItem('token');
        const response = yield call(axios.get, `http://localhost:3000/api/projects/${action.payload}/tasks`, {
            headers: {Authorization: `Bearer ${token}`},
        });
        yield put(fetchTasksSuccess(response.data));
    } catch (error) {
        yield put(fetchTasksFailure(error.message));
    }
}

// Create task
function* createTask(action) {
    try {
        const token = localStorage.getItem('token');
        const response = yield call(axios.post, `http://localhost:3000/api/projects/${action.payload.projectId}/createTasks`, action.payload.task, {
            headers: {Authorization: `Bearer ${token}`},
        });
        yield put(createTaskSuccess(response.data));
    } catch (error) {
        yield put(createTaskFailure(error.message));
    }
}

// Update task
function* updateTask(action) {
    try {
        const token = localStorage.getItem('token');
        const response = yield call(axios.put, `http://localhost:3000/api/tasks/update`, action.payload, {
            headers: {Authorization: `Bearer ${token}`},
        });
        yield put(updateTaskSuccess(response.data));
    } catch (error) {
        yield put(updateTaskFailure(error.message));
    }
}

// Delete task
function* deleteTask(action) {
    try {
        const token = localStorage.getItem('token');
        yield call(axios.delete, `http://localhost:3000/api/tasks/delete`, {
            headers: {Authorization: `Bearer ${token}`},
            data: {id: action.payload.id}
        });
        yield put(deleteTaskSuccess(action.payload));
    } catch (error) {
        yield put(deleteTaskFailure(error.message));
    }
}

// Update group order
function* updateGroupOrder(action) {
    try {
        const token = localStorage.getItem('token');
        const response = yield call(axios.put, `http://localhost:3000/api/projects/${action.payload.projectId}/groups/update`, action.payload.groups, {
            headers: {Authorization: `Bearer ${token}`},
        });
        yield put(updateGroupOrderSuccess(response.data));
    } catch (error) {
        yield put(updateGroupOrderFailure(error.message));
    }
}

// Create group
function* createGroup(action) {
    try {
        const token = localStorage.getItem('token');
        const response = yield call(axios.post, `http://localhost:3000/api/projects/${action.payload.projectId}/groups/create`, action.payload.group, {
            headers: {Authorization: `Bearer ${token}`},
        });
        yield put(createGroupSuccess(response.data));
    } catch (error) {
        yield put(createGroupFailure(error.message));
    }
}

// Delete group
function* deleteGroup(action) {
    try {
        const token = localStorage.getItem('token');
        yield call(axios.delete, `http://localhost:3000/api/projects/${action.payload.projectId}/groups/delete`, {
            headers: {Authorization: `Bearer ${token}`},
            data: {id: action.payload.id}
        });
        yield put(deleteGroupSuccess(action.payload));
    } catch (error) {
        yield put(deleteGroupFailure(error.message));
    }
}

// Watcher saga
function* taskSaga() {
    yield takeEvery(fetchTasksRequest.type, fetchTasks);
    yield takeEvery(createTaskRequest.type, createTask);
    yield takeEvery(updateTaskRequest.type, updateTask);
    yield takeEvery(deleteTaskRequest.type, deleteTask);
    yield takeEvery(updateGroupOrderRequest.type, updateGroupOrder);
    yield takeEvery(createGroupRequest.type, createGroup);
    yield takeEvery(deleteGroupRequest.type, deleteGroup);
}

export default taskSaga;
