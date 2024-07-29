import { call, put, takeLatest } from 'redux-saga/effects';
import axios from 'axios';
import { fetchTasksRequest, fetchTasksSuccess, fetchTasksFailure, updateTask } from './taskSlice';

function* fetchTasks(action) {
    try {
        const response = yield call(axios.get, `http://localhost:3000/api/projects/${action.payload}/tasks`);
        yield put(fetchTasksSuccess(response.data.tasks));
    } catch (error) {
        yield put(fetchTasksFailure(error.message));
    }
}

function* updateTaskSaga(action) {
    try {
        yield call(axios.put, `http://localhost:3000/api/tasks/${action.payload.id}`, action.payload);
    } catch (error) {
        console.error('Failed to update task:', error);
    }
}

export default function* taskSaga() {
    yield takeLatest(fetchTasksRequest.type, fetchTasks);
    yield takeLatest(updateTask.type, updateTaskSaga);
}

