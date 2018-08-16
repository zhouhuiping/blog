import Koa from 'koa'
import bodyParser from 'koa-bodyparser'
import mongoose from 'mongoose'
import session from 'koa-session'
import {redisConfig, mongo_config, api_proxy} from '../base/config'
import {redis_init} from '../database/redis/redis'
import {checkToke} from '../base/token'
import {MD5_SUFFIX, responseClient, md5} from '../base/util'
import router from '../router/main'
import log from "../log/log"
import {findOneUser} from '../models/user'
import {logout} from '../controllers/user'

const koaBody = require('koa-body')

const app = new Koa();
const mongodb_url = "mongodb://" + mongo_config.ip + ":" + mongo_config.port + "/" + mongo_config.db
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
    async destroy (key){
        delete this.storage[key]
        delete this.createDate[key]
    }
}

//还可以使用arguments.callee，不过在es5里不再支持，已经被废弃
// Object.defineProperty(global, '__stack', {
//     get: function errName(){
//       var orig = Error.prepareStackTrace;
//       Error.prepareStackTrace = function(_, stack){ return stack; };
//       var err = new Error;
//       Error.captureStackTrace(err, arguments.callee);
//       var stack = err.stack;
//       Error.prepareStackTrace = orig;
//       return stack;
//     }
//   });
   
// Object.defineProperty(global, '__line', {
//     get: function(){
//         return __stack[1].getLineNumber();
//     }
// });


if(process.env.DEBUG === 'true'){
    global.__line = function(filePath){
        let stack = new Error().stack
        let regexp = new RegExp(filePath+":([0-9]+):([0-9]+)")
        let result = stack.match(regexp)
        return result
    }
}else{
    global.__line = function(filePath){
        return false
    }
}

let verifyPath = function(path){
    switch(true){
        case /\/user\/login([\s\S])*?/.test(path):
            return true
        case /logout([\s\S])*?/.test(path):
            return true
        case /\/user\/comment\/show([\s\S])*?/.test(path):
            return true
        case /\/admin([\s\S])*?/.test(path):
            return false
        case /\/user([\s\S])*?/.test(path):
            return false
        default:
            return true
    }
}


let tokenMiddleware = async function(ctx, next){
    let path = ctx.request.path;
    log.debug(__filename, __line(__filename), "path: " + path)
    if(verifyPath(path)){
        return await next();
    }else{
        if(!ctx.header.authorization){
            return responseClient(ctx.response, 200, 3, '没有token信息，请进行登录')
        }else if(ctx.header.authorization && ctx.session.userId){
            let userId = ctx.session.userId
            if(userId){
                let userResult = await findOneUser({'id': userId})
                if(userResult.statusCode === '200'){
                    let tokenResult = await checkToke(ctx.header.authorization);
                    log.debug(__filename, __line(__filename), tokenResult)
                    if(tokenResult.statusCode == '200'){
                        ctx.session.username = tokenResult.message.username
                        ctx.session.userId = tokenResult.message.userId
                        await next();
                        if(tokenResult.message.token){
                            log.debug(__filename, __line(__filename), tokenResult.message.token);
                            ctx.response.set({'Authorization': tokenResult.message.token})
                        }
                    }else{
                        await logout(ctx)
                        responseClient(ctx.response, 200, 3, tokenResult.message.err)
                    }
                }else{
                    await logout(ctx)
                    responseClient(ctx.response, 200, 3, '获取用户信息失败')
                }
            }else{
                await logout(ctx)
                responseClient(ctx.response, 200, 3, '未查询到用户信息')
            }
        }else{
            responseClient(ctx.response, 200, 3, '请重新登录')
        }
    }
}

//非admin用户禁止访问接口
let adminMiddleware = async function(ctx, next){
    let path = ctx.request.path
    let userId = ctx.session.userId
    if(/\/admin([\s\S])*?/.test(path)){
        if(userId){
            let userResult = await findOneUser({'id': userId})
            if(userResult.statusCode === '200'){
                if(userResult.userInfo.type === '0'){
                    return await next()
                }else{
                    responseClient(ctx.response, 200, 3, '非管理员禁止访问')
                }
            }else{
                responseClient(ctx.response, 200, 3, '获取用户信息失败')
            }
        }else{
            responseClient(ctx.response, 200, 3, '未查询到用户信息')
        }
    }else{
        return await next()
    }
}

const CONFIG = {
    key: 'koa_react_cookie',
    maxAge: 86400000,
    store: store
};

app.use(session(CONFIG, app));

app.use(adminMiddleware)

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
        log.error(__filename, __line(__filename), error);
    })
}

mongoose.Promise = require('bluebird');
mongoose.connect(mongodb_url, function(err){
    if(err){
        log.error(__filename, __line(__filename), err);
        return;
    }
    console.log('数据库连接成功');
    app.listen(api_proxy.port, function(err){
        if(err){
            log.error(__filename, __line(__filename), err);
        }else{
            log.info(__filename, 
                (__filename), '===> api server is running at ' + api_proxy.port);
        }
    });
});