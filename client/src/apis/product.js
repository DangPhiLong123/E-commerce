import axios from '../axios'

// const apis = {
//     apiGetProducts: () => {
//         return axios({
//             url: '/product/',
//             method: 'get',
//             // params
//         })
//     }
// }

// export default apis
export const apiGetProducts = (params) => axios({
    url: '/product/',
    method: 'get',
    params
})

export const apigetProduct = (pid) => axios({
    url: '/product/' + pid,
    method: 'get',
})

export const apiRatings = (data) => axios({
    url: '/product/ratings',
    method: 'put',
    data
})

export const apiCreateProduct = (data) => axios({
    url: '/product/',
    method: 'post',
    data,
    withCredentials: true
})

export const apiUploadImages = (formData) => axios({
    url: '/product/upload-images',
    method: 'post',
    data: formData,
    headers: {
        'Content-Type': 'multipart/form-data'
    },
    withCredentials: true
})

export const apiGetUser = (uid) => axios({
    url: '/user/public/' + uid,
    method: 'get'
})

export const apiDeleteProduct = (pid) => axios({
    url: '/product/' + pid,
    method: 'delete',
    withCredentials: true
})

export const apiUpdateProduct = (pid, data) => axios({
    url: '/product/' + pid,
    method: 'put',
    data,
    withCredentials: true
})

export const apiAddVarriant = (pid, data) => axios({
    url: `/product/${pid}/variant`,
    method: 'post',
    data,
    withCredentials: true
})

export const apiRemoveVarriant = (pid, variantId) => axios({
    url: `/product/${pid}/variant/${variantId}`,
    method: 'delete',
    withCredentials: true
})