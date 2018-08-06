const initialState = {
    commentList: [],
    comment: [],
    pageNum: 1,
    total: 0
}

export const actionTypes = {
    INIT_COMMENT: "INIT_COMMENT",
    ADD_COMMENT: "ADD_COMMENT",
    RESPONSE_ADD_COMMENT: "RESPONSE_ADD_COMMENT",
    RESPONSE_INIT_COMMENT: "RESPONSE_INIT_COMMENT",
    DELETE_COMMENT: "DELETE_COMMENT",
    RESPONSE_DELETE_COMMENT: "RESPONSE_DELETE_COMMENT"
}

export const actions = {
    init_comment: function(article_id, pageNum=0){
        return {
            type: actionTypes.INIT_COMMENT,
            article_id: article_id,
            pageNum: pageNum
        }
    },
    add_comment: function(comment){
        return {
            type: actionTypes.ADD_COMMENT,
            comment
        }
    },
    delete_comment: function(commentIndex){
        return {
            type: actionTypes.DELETE_COMMENT,
            commentIndex
        }
    }
}

export function reducer(state=initialState, action){
    switch(action.type){
        case actionTypes.RESPONSE_ADD_COMMENT:
            return {
                ...state, commentList: [...state.commentList, action.comment]
            }
        case actionTypes.RESPONSE_INIT_COMMENT:
            return {
                ...state, commentList: [...action.data.list], pageNum: action.data.pageNum, total: action.data.total
            }
        default:
            return state
    }
}