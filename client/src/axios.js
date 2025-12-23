import axios from 'axios';

const baseURL = process.env.REACT_APP_API_URI || 'http://localhost:5000/api';
console.log('API Base URL:', baseURL);

const instance = axios.create({
    baseURL: baseURL,
});

// Thêm một bộ đón chặn request
instance.interceptors.request.use(function (config) {
    // Làm gì đó trước khi request dược gửi đi
    let localStorageData = window.localStorage.getItem('persist:shop/user')
    if (localStorageData && typeof localStorageData === 'string') {
        localStorageData = JSON.parse(localStorageData)
        const accessToken = JSON.parse(localStorageData?.token)
        config.headers = {authorization: `Bearer ${accessToken}`}
        return config
    }  else return config;
}, function (error) {
    // Làm gì đó với lỗi request
    return Promise.reject(error);
});

// Thêm một bộ đón chặn response
instance.interceptors.response.use(function (response) {
    // Bất kì mã trạng thái nào nằm trong tầm 2xx đều khiến hàm này được trigger
    return response.data;
}, function (error) {
    // Bất kì mã trạng thái nào lọt ra ngoài tầm 2xx đều khiến hàm này được trigger
    if (error.response) {
        // Server trả về response với status code nằm ngoài tầm 2xx
        return Promise.reject(error.response.data);
    } else if (error.request) {
        // Request đã được gửi nhưng không nhận được response
        return Promise.reject({ message: 'No response from server' });
    } else {
        // Có lỗi khi setting up request
        return Promise.reject({ message: error.message });
    }
});

export default instance;