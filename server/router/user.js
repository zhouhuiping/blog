import Router from 'koa-router'
import {login, loginWithGithub, userInfo, logout} from '../controllers/user'
import {addComment, showComments, addLikeHot, deleteLikeHot} from '../controllers/comment'

const router = Router()
// 用户登录
router.post('/login', login)

// 获取用户信息
router.get('/userInfo', userInfo)

// 用户注销
router.post('/logout', logout)

// 添加评论
router.post('/comment/add', addComment)

router.get('/comment/show', showComments)

// 添加likehot
router.post('/comment/likeHot/add', addLikeHot)

// 删除likehot
router.post('/comment/likeHot/delete', deleteLikeHot)

module.exports = router
