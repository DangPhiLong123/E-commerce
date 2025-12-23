import React, { useEffect, useMemo, useState, useRef } from 'react'
import ReactDOM from 'react-dom'
import { apiAdminListOrders, apiAdminUpdateOrderStatus } from 'apis'
import moment from 'moment'
import { useDispatch } from 'react-redux'
import { showModal } from 'store/appSlice'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const STATUS_OPTIONS = ['Created','Processing','Shipping','Delivered','Cancelled','Returned','Succeed']

const statusBadgeClass = (s) => {
  switch (s) {
    case 'Created': return 'bg-gray-100 text-gray-700 border-gray-200'
    case 'Processing': return 'bg-amber-100 text-amber-700 border-amber-200'
    case 'Shipping': return 'bg-sky-100 text-sky-700 border-sky-200'
    case 'Delivered': return 'bg-green-100 text-green-700 border-green-200'
    case 'Succeed': return 'bg-emerald-100 text-emerald-700 border-emerald-200'
    case 'Cancelled': return 'bg-red-100 text-red-700 border-red-200'
    case 'Returned': return 'bg-rose-100 text-rose-700 border-rose-200'
    default: return 'bg-gray-100 text-gray-700 border-gray-200'
  }
}
const statusDotClass = (s) => {
  switch (s) {
    case 'Created': return 'bg-gray-500'
    case 'Processing': return 'bg-amber-500'
    case 'Shipping': return 'bg-sky-500'
    case 'Delivered': return 'bg-green-500'
    case 'Succeed': return 'bg-emerald-500'
    case 'Cancelled': return 'bg-red-500'
    case 'Returned': return 'bg-rose-500'
    default: return 'bg-gray-500'
  }
}

const StatusDropdown = ({ value, onChange }) => {
  const [open, setOpen] = useState(false)
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 })
  const btnRef = useRef(null)

  const updatePosition = () => {
    const rect = btnRef.current?.getBoundingClientRect()
    if (rect) setCoords({ top: rect.bottom + 4, left: rect.left, width: rect.width })
  }

  useEffect(() => {
    if (!open) return
    updatePosition()
    const onResize = () => updatePosition()
    const onClick = (e) => {
      const menu = document.getElementById('status-menu-portal')
      if (!menu || (!menu.contains(e.target) && !btnRef.current?.contains(e.target))) setOpen(false)
    }
    window.addEventListener('resize', onResize)
    window.addEventListener('scroll', onResize, true)
    document.addEventListener('mousedown', onClick)
    return () => {
      window.removeEventListener('resize', onResize)
      window.removeEventListener('scroll', onResize, true)
      document.removeEventListener('mousedown', onClick)
    }
  }, [open])

  return (
    <>
      <button
        ref={btnRef}
        className={`px-2 py-1 rounded text-xs font-medium border ${statusBadgeClass(value)}`}
        onClick={() => setOpen(o => !o)}
      >
        {value}
      </button>
      {open && ReactDOM.createPortal(
        <div id='status-menu-portal' style={{ position: 'fixed', top: coords.top, left: coords.left, minWidth: Math.max(coords.width, 160), zIndex: 1000 }} className='bg-white border rounded shadow'>
          {STATUS_OPTIONS.map(st => (
            <button
              key={st}
              className='w-full text-left px-3 py-1 hover:bg-gray-50 flex items-center gap-2'
              onClick={() => { onChange(st); setOpen(false) }}
            >
              <span className={`inline-block w-2.5 h-2.5 rounded-full ${statusDotClass(st)}`}></span>
              <span>{st}</span>
            </button>
          ))}
        </div>,
        document.body
      )}
    </>
  )
}

const ManageOrder = () => {
  const dispatch = useDispatch()
  const [orders, setOrders] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [filters, setFilters] = useState({ q: '', status: '', from: '', to: '' })

  const fetchOrders = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await apiAdminListOrders({ ...filters, page, limit })
      if (res?.success) {
        setOrders(res.result || [])
        setTotal(res.total || 0)
      } else setError('Không thể tải danh sách đơn hàng')
    } catch (e) { setError('Có lỗi khi tải danh sách đơn hàng') }
    setLoading(false)
  }

  useEffect(() => { fetchOrders() }, [page, limit])

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    fetchOrders()
  }

  const quickStats = useMemo(() => {
    const stats = {
      total: total,
      processing: orders.filter(o => o.status === 'Processing').length,
      delivered: orders.filter(o => o.status === 'Delivered' || o.status === 'Succeed').length,
      cancelled: orders.filter(o => o.status === 'Cancelled' || o.status === 'Returned').length,
    }
    return stats
  }, [orders, total])

  const handleUpdateStatus = async (oid, status) => {
    try {
      await apiAdminUpdateOrderStatus(oid, status)
      fetchOrders()
    } catch {}
  }

  const handleCancel = async (oid) => {
    if (!window.confirm('Đánh dấu đơn hàng này là Hủy?')) return
    await handleUpdateStatus(oid, 'Cancelled')
  }

  const handleView = (order) => {
    dispatch(showModal({
      isShowModal: true,
      modalChildren: (
        <div className='p-4 max-w-2xl'>
          <div className='text-lg font-semibold mb-2'>Order Detail #{order._id}</div>
          <div className='text-sm mb-3 text-gray-600'>Customer: {order.orderBy?.firstname} {order.orderBy?.lastname} • {order.orderBy?.email}</div>
          <table className='w-full text-sm'>
            <thead>
              <tr className='bg-gray-50'>
                <th className='text-left px-2 py-1'>Product</th>
                <th className='text-right px-2 py-1'>Qty</th>
                <th className='text-right px-2 py-1'>Unit</th>
                <th className='text-right px-2 py-1'>Total</th>
              </tr>
            </thead>
            <tbody>
              {order.products?.map((p, i) => (
                <tr key={i} className='border-t'>
                  <td className='px-2 py-1'>{p.product?.title || 'N/A'}</td>
                  <td className='px-2 py-1 text-right'>{p.count || 0}</td>
                  <td className='px-2 py-1 text-right'>{Number(p.unitPrice || p.product?.price || 0).toLocaleString()}</td>
                  <td className='px-2 py-1 text-right'>{Number((p.unitPrice || p.product?.price || 0) * (p.count || 0)).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className='border-t'>
                <td className='px-2 py-2 font-semibold' colSpan={3}>Grand total</td>
                <td className='px-2 py-2 text-right font-semibold'>{Number(order.total||0).toLocaleString()} VND</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )
    }))
  }

  const exportPDF = (order) => {
    const doc = new jsPDF()
    doc.text(`Invoice #${order._id}`, 14, 16)
    doc.text(`Customer: ${order.orderBy?.firstname||''} ${order.orderBy?.lastname||''} (${order.orderBy?.email||''})`, 14, 24)
    const rows = (order.products||[]).map(p => [
      p.product?.title || '',
      p.count || 0,
      Number(p.unitPrice || p.product?.price || 0).toLocaleString(),
      Number((p.unitPrice || p.product?.price || 0)*(p.count || 0)).toLocaleString()
    ])
    autoTable(doc, { head: [['Product','Qty','Unit','Total']], body: rows, startY: 30 })
    autoTable(doc, { body: [[{ content: `Grand Total: ${Number(order.total||0).toLocaleString()} VND`, styles: { halign: 'right', fontStyle: 'bold' }}]], theme: 'plain', startY: doc.lastAutoTable.finalY + 6 })
    doc.save(`invoice_${order._id}.pdf`)
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <div className='w-full p-4'>
      <div className='text-xl font-semibold mb-4'>Manage Orders</div>

      {/* Quick stats */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-3 mb-4'>
        <div className='bg-white rounded shadow p-3'>
          <div className='text-xs text-gray-500'>Total Orders</div>
          <div className='text-lg font-semibold'>{total}</div>
        </div>
        <div className='bg-white rounded shadow p-3'>
          <div className='text-xs text-gray-500'>Processing</div>
          <div className='text-lg font-semibold'>{orders.filter(o=>o.status==='Processing').length}</div>
        </div>
        <div className='bg-white rounded shadow p-3'>
          <div className='text-xs text-gray-500'>Completed</div>
          <div className='text-lg font-semibold'>{orders.filter(o=>['Delivered','Succeed'].includes(o.status)).length}</div>
        </div>
        <div className='bg-white rounded shadow p-3'>
          <div className='text-xs text-gray-500'>Cancelled</div>
          <div className='text-lg font-semibold'>{orders.filter(o=>['Cancelled','Returned'].includes(o.status)).length}</div>
        </div>
      </div>

      {/* Filters */}
      <form className='bg-white rounded shadow p-3 mb-4 flex flex-wrap gap-3 items-end' onSubmit={handleSearch}>
        <div className='flex flex-col'>
          <label className='text-xs text-gray-500'>Tìm kiếm (Mã đơn)</label>
          <input value={filters.q} onChange={e=>setFilters({...filters, q:e.target.value})} className='border rounded px-2 py-1' placeholder='Order ID...' />
        </div>
        <div className='flex flex-col'>
          <label className='text-xs text-gray-500'>Trạng thái</label>
          <select value={filters.status} onChange={e=>setFilters({...filters, status:e.target.value})} className='border rounded px-2 py-1'>
            <option value=''>Tất cả</option>
            {['','Created','Processing','Shipping','Delivered','Cancelled','Returned','Succeed'].filter(Boolean).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className='flex flex-col'>
          <label className='text-xs text-gray-500'>Từ ngày</label>
          <input type='date' value={filters.from} onChange={e=>setFilters({...filters, from:e.target.value})} className='border rounded px-2 py-1' />
        </div>
        <div className='flex flex-col'>
          <label className='text-xs text-gray-500'>Đến ngày</label>
          <input type='date' value={filters.to} onChange={e=>setFilters({...filters, to:e.target.value})} className='border rounded px-2 py-1' />
        </div>
        <button type='submit' className='px-3 py-2 bg-blue-600 text-white rounded'>Tìm kiếm</button>
      </form>

      {/* Table (concept style) */}
      <div className='bg-white rounded shadow overflow-x-auto'>
        <table className='min-w-full text-sm'>
          <thead>
            <tr className='bg-sky-900 text-white'>
              <th className='px-3 py-2 text-left w-16'>#</th>
              <th className='px-3 py-2 text-left'>Email Address</th>
              <th className='px-3 py-2 text-left'>Fullname</th>
              <th className='px-3 py-2 text-right'>Total</th>
              <th className='px-3 py-2 text-left'>Payment</th>
              <th className='px-3 py-2 text-left'>Status</th>
              <th className='px-3 py-2 text-left'>Created At</th>
              <th className='px-3 py-2 text-left'>Actions</th>
            </tr>
          </thead>
          <tbody>
            {!loading && orders.map((o, idx) => (
              <tr key={o._id} className='border-t hover:bg-gray-50'>
                <td className='px-3 py-2'>{(page-1)*limit + idx + 1}</td>
                <td className='px-3 py-2'>{o.orderBy?.email}</td>
                <td className='px-3 py-2'>{o.orderBy?.firstname} {o.orderBy?.lastname}</td>
                <td className='px-3 py-2 text-right'>{Number(o.total||0).toLocaleString()} VND</td>
                <td className='px-3 py-2'>{o.paymentMethod?.toUpperCase() || 'N/A'}</td>
                <td className='px-3 py-2'>
                  <StatusDropdown value={o.status} onChange={(st)=>handleUpdateStatus(o._id, st)} />
                </td>
                <td className='px-3 py-2'>{moment(o.createdAt).format('DD/MM/YYYY HH:mm')}</td>
                <td className='px-3 py-2'>
                  <div className='flex gap-2'>
                    <button className='px-2 py-1 border rounded' onClick={()=>handleView(o)}>Xem</button>
                    <button className='px-2 py-1 border rounded' onClick={()=>exportPDF(o)}>In</button>
                    <button className='px-2 py-1 border rounded text-red-600' disabled={loading} onClick={()=>handleCancel(o._id)}>Hủy</button>
                  </div>
                </td>
              </tr>
            ))}
            {loading && (
              <tr><td className='px-3 py-6 text-center' colSpan={8}>Đang tải...</td></tr>
            )}
            {!loading && orders.length === 0 && (
              <tr><td className='px-3 py-6 text-center' colSpan={8}>Không có đơn hàng</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className='flex items-center justify-between mt-3'>
        <div className='text-sm text-gray-500'>Trang {page}/{totalPages || 1}</div>
        <div className='flex gap-2'>
          <button disabled={page<=1} onClick={()=>setPage(p=>p-1)} className='px-3 py-1 border rounded disabled:opacity-50'>Prev</button>
          <button disabled={page>=totalPages} onClick={()=>setPage(p=>p+1)} className='px-3 py-1 border rounded disabled:opacity-50'>Next</button>
        </div>
      </div>
    </div>
  )
}

export default ManageOrder
