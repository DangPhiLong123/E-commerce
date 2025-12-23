import axios from '../axios'

const apis = {
    apiGetCategories: () => {
        return axios({
            url: '/prodcategory/',
            method: 'get'
        })
    }
}

export default apis