import React, { useEffect, useState } from 'react'
import { apiGetMyOrders } from 'apis'
import { useDispatch } from 'react-redux'
import { addToCart } from 'store/cartSlice'
import { useNavigate } from 'react-router-dom'
import path from 'ultils/path'
import moment from 'moment'

const History = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true)
      setError(null)
      try {
        console.log('Fetching orders...')
        const res = await apiGetMyOrders()
        console.log('Orders response:', res)
        
        if (res?.success && res.response) {
          setOrders(res.response || [])
        } else {
          console.error('Invalid response format:', res)
          setError('Không thể tải lịch sử đơn hàng')
        }
      } catch (e) {
        console.error('Error fetching orders:', e)
        setError('Có lỗi khi tải lịch sử đơn hàng')
      }
      setLoading(false)
    }
    fetchOrders()
  }, [])

  const handleBuyAgain = (order) => {
    if (!Array.isArray(order.products)) return
    
    try {
      order.products.forEach(p => {
        if (!p?.product) return
        dispatch(addToCart({
          product: p.product,
          quantity: p.count || 1,
          variant: p.variant || { color: p.color }
        }))
      })
      navigate(`/${path.MEMBER}/${path.MY_CART}`)
    } catch (e) {
      console.error('Error adding to cart:', e)
    }
  }

  const handleReview = (order) => {
    const first = order.products?.[0]
    if (first?.product?._id && first?.product?.category && first?.product?.slug) {
      navigate(`/${first.product.category}/${first.product._id}/${first.product.slug}?review=1`)
    }
  }

  if (loading) return <div className='w-main mx-auto my-6'>Đang tải...</div>
  if (error) return <div className='w-main mx-auto my-6 text-red-600'>{error}</div>

  return (
    <div className='w-main mx-auto my-6'>
      <h1 className='text-2xl font-semibold mb-4'>Lịch sử đơn hàng</h1>
      {!loading && orders.length === 0 && <div>Chưa có đơn hàng nào.</div>}
      <div className='flex flex-col gap-3'>
        {orders.map((o) => {
          if (!o?._id) return null
          
          return (
            <div key={o._id} className='border rounded p-3 bg-white'>
              <div className='flex justify-between text-sm text-gray-600'>
                <span>Mã giao dịch: {o.transactionId || o._id}</span>
                <span>Trạng thái: <b>{o.status || 'N/A'}</b></span>
              </div>
              <div className='text-sm text-gray-600'>
                Thanh toán: {o.paymentMethod?.toUpperCase() || 'N/A'}
                {o.paidAt ? ` - ${moment(o.paidAt).format('DD/MM/YYYY HH:mm')}` : ''}
              </div>
              <div className='mt-2'>
                {Array.isArray(o.products) && o.products.map((p, index) => {
                  if (!p?.product) return null
                  
                  const unitPrice = p?.unitPrice || p?.product?.price || 0
                  const quantity = p?.count || 1
                  
                  return (
                    <div key={p._id || index} className='flex items-center gap-3 py-2 border-b last:border-b-0'>
                      <img 
                        src={p?.variant?.thumb || p?.product?.thumb || ''} 
                        alt='' 
                        className='w-12 h-12 object-cover rounded'
                        onError={(e) => {
                          e.target.style.display = 'none'
                        }}
                      />
                      <div className='flex-1'>
                        <div className='text-sm font-medium'>{p?.product?.title || 'Sản phẩm'}</div>
                        <div className='text-xs text-gray-500'>
                          {p?.variant?.title ? `${p.variant.title} ` : ''}
                          {p?.color ? `Màu: ${p.color} ` : ''}
                          {p?.variant?.size ? `- Size: ${p.variant.size} ` : ''}
                        </div>
                      </div>
                      <div className='text-sm whitespace-nowrap'>
                        {unitPrice.toLocaleString()} x {quantity}
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className='flex gap-3 mt-3'>
                <button
                  className='px-3 py-1 border rounded text-sm'
                  onClick={() => handleBuyAgain(o)}
                >
                  Mua lại
                </button>
                <button
                  className='px-3 py-1 border rounded text-sm'
                  onClick={() => handleReview(o)}
                >
                  Đánh giá sản phẩm
                </button>
                <a
                  className='px-3 py-1 border rounded text-sm'
                  href={`mailto:support@digitalxpress.local?subject=Hỗ trợ đơn hàng&body=Mã giao dịch: ${o.transactionId || o._id}`}
                >
                  Liên hệ hỗ trợ
                </a>
              </div>
              <div className='text-right mt-2 font-semibold'>
                Tổng: {Number(o.total || 0).toLocaleString()} VND
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default History
