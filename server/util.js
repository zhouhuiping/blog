import crypto from 'crypto'

const handleErr = (promise) => {
    return promise.then((data) => {
        return [null, data];
    }).catch(err => [err]);
}

module.exports = {
    MD5_SUFFIX: 'eisdsadawwada这个是加密的信息哦%%%@@!',
    md5: function(pwd){
        let md5 = crypto.createHash('md5');
        return md5.update(pwd).digest('hex')
    },
    responseClient(res, httpCode=500, code=3, message='服务端异常', result={}){
        let responseData = {};
        responseData.code = code;
        responseData.message = message;
        res.status = httpCode;
        if(result.token) res.set({'Authorization': result.token});
        if(result!={})  responseData.result = result;
        console.log("result: " + responseData);
        res.body = JSON.stringify(responseData)
    },
    handleErr
}