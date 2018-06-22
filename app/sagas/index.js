import {fork} from 'redux-saga/effects'
import {loginFlow, user_auth} from './homeSaga'
import {get_all_users_flow} from './adminManagerUsersSaga'
import {getAllTagsFlow, delTagFlow, addTagFlow} from './adminManagerTagsSaga'
import {getAllArticlesFlow} from './adminManagerArticleSaga'
import {saveArticleFlow} from './adminManagerNewArticleSaga'

export default function* rootSaga(){
    yield fork(loginFlow)
    yield fork(user_auth)
    yield fork(get_all_users_flow)
    yield fork(getAllTagsFlow)
    yield fork(delTagFlow)
    yield fork(addTagFlow)
    yield fork(getAllArticlesFlow)
    yield fork(saveArticleFlow)
}