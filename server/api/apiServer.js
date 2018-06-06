import Koa from 'koa'
import config from '../../config/config'
import bodyParser from 'koa-bodyparser'
import mongoose from 'mongoose'
import session from 'koa-session'
import {redisConfig} from '../config'
import {redis_init} from '../database/redis/redis'
import {checkToke} from '../base/token'
import {MD5_SUFFIX, responseClient, md5} from '../util'
import router from '../router/main'

const koaBody = require('koa-body')

const port = '8080';
const app = new Koa();
const redis_client = redis_init(redisConfig.port, redisConfig.url);

console.log("api_server@@@@@@@@@@@@")
// app.use(bodyParser());
app.keys = ['koa_react_cookie'];
let store = {
    storage: {},
    createDate: {},
    async get (key, maxAge){
        if(this.storage[key] && ((this.createDate[key].getTime() - new Date().getTime()) > (maxAge*1000))){
            return this.storage[key]
        }
    },
    async set (key, sess, maxAge){
        this.storage[key] = sess;
        this.createDate[key] = new Date(Date.now() + maxAge*1000);
    },
    destroy (key){
        delete this.storage[key]
        delete this.createDate[key]
    }
}

let verifyPath = function(path){
    console.log(path);
    switch(true){
        case /\/user\/login([\s\S])*?/.test(path):
            return true
        default:
            return false
    }
}

let tokenMiddleware = async function(ctx, next){
    let path = ctx.request.path;
    if(verifyPath(path)){
        return await next();
    }else{
        if(!ctx.header.authorization){
            return responseClient(ctx.response, 400, 0, '没有token信息，请进行登录')
        }else{
            console.log(ctx.header.authorization);
            let tokenResult = await checkToke(ctx.header.authorization);
            console.log(tokenResult);
            if(tokenResult.errCode == '200'){
                await next();
                if(tokenResult.message.token){
                    ctx.response.set({'Authorization': tokenResult.message.token})
                }
            }else{
                 return responseClient(ctx.response, 400, 0, tokenResult.message.err)
            }
        }
    }
}

const CONFIG = {
    key: 'koa_react_cookie',
    maxAge: 86400000,
    store: store
};

app.use(session(CONFIG, app));

app.use(tokenMiddleware);

// app.use(async ctx => {
//     console.log(ctx.req);
//     ctx.body = 'hello world';
// });

// app.use('/', require('./main'));

// app.use('/admin', require('./admin'))

app.use(router.routes())

if(redis_client){
    console.log("redis 启动成功，端口号：" + redisConfig.port);
    redis_client.on('error', (error) => {
        console.log(error);
    })
}

mongoose.Promise = require('bluebird');
mongoose.connect('mongodb://127.0.0.1:27017/blog', function(err){
    if(err){
        console.log(err, '数据库连接失败');
        return;
    }
    console.log('数据库连接成功');
    app.listen('8080', function(err){
        if(err){
            console.error('err:', err);
        }else{
            console.info('===> api server is running at 8080')
        }
    });
});