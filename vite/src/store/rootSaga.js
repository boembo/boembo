
import { all } from 'redux-saga/effects';
import homeSaga from '../components/Home/sagas';
import projectContentSaga from '../components/ProjectContent/taskSaga';
import { projectSaga } from '../components/ProjectContent/projectSlice';

export default function* rootSaga() {
    yield all([
        homeSaga(),
        projectContentSaga(),
        projectSaga(),
                // other sagas
    ]);
}
