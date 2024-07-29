
import { all } from 'redux-saga/effects';
import homeSaga from '../components/Home/sagas';
import projectContentSaga from '../components/ProjectContent/taskSaga';

export default function* rootSaga() {
    yield all([
        homeSaga(),
        projectContentSaga(),
                // other sagas
    ]);
}
