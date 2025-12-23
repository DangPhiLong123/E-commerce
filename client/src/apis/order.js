import axios from '../axios'

export const apiGetMyOrders = () => {
  return axios({
    url: '/order',
    method: 'get',
    withCredentials: true
  })
}

export const apiGetAdminMetrics = () => {
  return axios({
    url: '/order/admin/metrics',
    method: 'get',
    withCredentials: true
  })
}

export const apiAdminListOrders = (params) => {
  return axios({
    url: '/order/admin/list',
    method: 'get',
    params,
    withCredentials: true
  })
}

export const apiAdminUpdateOrderStatus = (oid, status) => {
  return axios({
    url: `/order/admin/${oid}/status`,
    method: 'put',
    data: { status },
    withCredentials: true
  })
}

export const apiAdminDeleteOrder = (oid) => {
  return axios({
    url: `/order/admin/${oid}`,
    method: 'delete',
    withCredentials: true
  })
}



