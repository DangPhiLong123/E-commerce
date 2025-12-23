import axios from '../axios'

export const apiGetBlogs = (params = {}) => {
  return axios({
    url: '/blog',
    method: 'get',
    params,
    withCredentials: true
  })
}

export const apiGetBlogDetail = (blogId) => {
  return axios({
    url: `/blog/${blogId}`,
    method: 'get',
    withCredentials: true
  })
}



