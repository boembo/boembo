import { all, takeEvery, put } from 'redux-saga/effects';
import { openDrawer, closeDrawer } from './drawerSlice';

function* handleOpenDrawer() {
    // Any side effects or async operations can go here
}

function* handleCloseDrawer() {
    // Any side effects or async operations can go here
}

function* watchOpenDrawer() {
    yield takeEvery(openDrawer.type, handleOpenDrawer);
}

function* watchCloseDrawer() {
    yield takeEvery(closeDrawer.type, handleCloseDrawer);
}

export default function* rootSaga() {
    yield all([
        watchOpenDrawer(),
        watchCloseDrawer(),
    ]);
}
