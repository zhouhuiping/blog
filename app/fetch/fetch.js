import axios from 'axios'
import Qs from 'qs'

let config = {
    baseURL: '/api',
    transformRequest: [
        function(data){
            let ret = '';
            for(let it in data){
                ret += encodeURIComponent(it) + '=' + encodeURIComponent(data[it]) + '&'
            }
            return ret
        }
    ],
    transformResponse: [
        function(data){
            return data
        }
    ],
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
    },
    timeout: 10000,
    responseType: 'json'
};

axios.interceptors.response.use(function(res){
    return res;
});

export function get(url, token){
    if(token){
        config.headers.authorization = token;
    }
    console.log(config);
    return axios.get(url, config)
}

export function post(url, data){
    return axios.post(url, data, config)
}