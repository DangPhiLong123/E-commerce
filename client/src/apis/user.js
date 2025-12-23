import axios from '../axios'

export const apiRegister = (data) => {
    return axios({
        url: '/user/register',
        method: 'post',
        data,
        withCredentials: true
    })
}

export const apiLogin = (data) => {
    return axios({
        url: '/user/login',
        method: 'post',
        data
    })
}

export const apiForgotPassword = (data) => {
    return axios({
        url: '/user/forgotpassword',
        method: 'post',
        data
    })
}

export const apiResetPassword = (data) => {
    return axios({
        url: '/user/resetpassword',
        method: 'put',
        data
    })
}

export const apiGetCurrent = () => {
    return axios({
        url: '/user/current',
        method: 'get',
        withCredentials: true
    })
}

export const apiGetUsers = (params) => {
    return axios({
        url: '/user/',
        method: 'get',
        params,
        withCredentials: true
    })
}

export const apiUpdateUser = (data, uid) => {
    return axios({
        url: `/user/${uid}`,
        method: 'put',
        data,
        withCredentials: true
    })
}

export const apiDeleteUser = (uid) => {
    return axios({
        url: '/user',
        method: 'delete',
        params: { _id: uid },
        withCredentials: true
    })
}

export const apiUpdateCurrent = (data) => {
    return axios({
        url: `/user/current`,
        method: 'put',
        data,
        withCredentials: true
    })
}

export const apiUpdateCart = (data) => {
    return axios({
        url: `/user/cart`,
        method: 'put',
        data,
        withCredentials: true
    })
}

export const apiRemoveProductInCart = (pid) => {
    return axios({
        url: `/user/remove-cart/${pid}`,
        method: 'delete',
        params: { pid },
        withCredentials: true
    })
}