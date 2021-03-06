import axios from 'axios'
import Qs from 'qs'
axios.defaults.timeout = 100000
axios.defaults.withCredentials = true // 跨域问题

let config = {
    baseURL: progress.env.NODE_ENV === 'production' ? progress.env.API_URL + '/api' : '/api',
    transformRequest: [
        function (data) {
            let ret = ''
            for (let it in data) {
                ret += encodeURIComponent(it) + '=' + encodeURIComponent(data[it]) + '&'
            }
            return ret
        }
    ],
    transformResponse: [
        function (data) {
            return data
        }
    ],
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'access-control-allow-origin': '*'
    },
    timeout: 10000,
    responseType: 'json'
}

axios.interceptors.response.use(function (res) {
    return res
})

export function get (url, token) {
    if (token) {
        config.headers.authorization = token
    }
    console.log(url)
    return axios.get(url, config)
}

export function post (url, data, token) {
    if (token) {
        config.headers.authorization = token
    }
    return axios.post(url, data, config)
}
