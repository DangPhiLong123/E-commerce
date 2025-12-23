import React, { useEffect, useMemo, useState } from 'react'
import { apiGetAdminMetrics, apiAdminListOrders } from 'apis'
import moment from 'moment'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, PieChart, Pie, Cell, AreaChart, Area } from 'recharts'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const COLORS = ['#2563eb','#fb923c','#10b981','#8b5cf6','#ef4444','#f59e0b']

const GRANULARITIES = [
  { value: 'day', label: 'Ngày' },
  { value: 'week', label: 'Tuần' },
  { value: 'month', label: 'Tháng' },
  { value: 'quarter', label: 'Quý' },
  { value: 'year', label: 'Năm' },
]

const compact = (v) => new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(Number(v||0))

const Analytics = () => {
  const [metrics, setMetrics] = useState({ totals: {}, monthly: [], recentOrders: [] })
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)

  // Filters
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [granularity, setGranularity] = useState('month')
  const [topN, setTopN] = useState(5)
  const [comparePrev, setComparePrev] = useState(false)

  useEffect(() => { (async ()=>{
    try {
      const res = await apiGetAdminMetrics()
      if (res?.success) setMetrics(res.metrics)
    } catch {}
  })() }, [])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const params = { page: 1, limit: 1000 }
      if (from) params.from = from
      if (to) params.to = to
      const res = await apiAdminListOrders(params)
      if (res?.success) setOrders(res.result || [])
      else setOrders([])
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchOrders() }, [])

  const periodKey = (d) => {
    const m = moment(d)
    switch (granularity) {
      case 'day': return m.format('YYYY-MM-DD')
      case 'week': return `${m.format('GGGG')}-W${m.format('WW')}`
      case 'quarter': return `${m.format('YYYY')}-Q${m.quarter()}`
      case 'year': return m.format('YYYY')
      case 'month':
      default: return m.format('YYYY-MM')
    }
  }

  const timeSeries = useMemo(() => {
    const map = {}
    for (const o of orders) {
      const k = periodKey(o.createdAt)
      map[k] = (map[k] || 0) + (o.total || 0)
    }
    const current = Object.keys(map).sort().map(k => ({ period: k, revenue: map[k] }))

    if (!comparePrev || !from || !to) return { current }

    const fromM = moment(from), toM = moment(to)
    const diff = toM.diff(fromM, 'days') + 1
    const prevFrom = fromM.clone().subtract(diff, 'days')
    const prevTo = toM.clone().subtract(diff, 'days')

    const prevMap = {}
    for (const o of orders) {
      const t = moment(o.createdAt)
      if (t.isBetween(prevFrom, prevTo, 'day', '[]')) {
        const k = periodKey(o.createdAt)
        prevMap[k] = (prevMap[k] || 0) + (o.total || 0)
      }
    }
    const prev = Object.keys(prevMap).sort().map(k => ({ period: k, prev: prevMap[k] }))
    const merged = {}
    for (const r of current) merged[r.period] = { ...(merged[r.period]||{}), ...r }
    for (const r of prev) merged[r.period] = { ...(merged[r.period]||{}), ...r }
    return { current: Object.keys(merged).sort().map(k => ({ period: k, revenue: merged[k].revenue || 0, prev: merged[k].prev || 0 })) }
  }, [orders, granularity, comparePrev, from, to])

  const topProducts = useMemo(() => {
    const map = {}
    for (const o of orders) {
      (o.products||[]).forEach(p => {
        const name = p.product?.title || 'Unknown'
        const value = (p.unitPrice || p.product?.price || 0) * (p.count || 0)
        map[name] = (map[name] || 0) + value
      })
    }
    return Object.entries(map)
      .sort((a,b)=>b[1]-a[1])
      .slice(0, topN)
      .map(([name,value])=>({ name, value }))
  }, [orders, topN])

  const categoryBreakdown = useMemo(() => {
    const map = {}
    for (const o of orders) {
      (o.products||[]).forEach(p => {
        const cat = p.product?.category || 'Others'
        const value = (p.unitPrice || p.product?.price || 0) * (p.count || 0)
        map[cat] = (map[cat] || 0) + value
      })
    }
    return Object.entries(map).map(([name, value]) => ({ name, value }))
  }, [orders])

  const exportCsv = () => {
    const rows = orders.map(o => [o._id, o.orderBy?.email, moment(o.createdAt).format('YYYY-MM-DD HH:mm'), o.status, o.paymentMethod, o.total])
    const csv = ['orderId,email,createdAt,status,payment,total', ...rows.map(r=>r.join(','))].join('\n')
    const blob = new Blob([csv], {type:'text/csv;charset=utf-8;'})
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'analytics.csv'; a.click(); URL.revokeObjectURL(url)
  }

  const exportPdf = () => {
    const doc = new jsPDF('p', 'pt')
    const rangeText = `${from || '...'} → ${to || '...'}`
    doc.text(`Analytics Report`, 40, 40)
    doc.text(`Range: ${rangeText}`, 40, 60)

    // Summary table
    autoTable(doc, {
      startY: 80,
      head: [['Metric', 'Value']],
      body: [
        ['Total Orders', metrics.totals?.orders || 0],
        ['Users', metrics.totals?.users || 0],
        ['Revenue', (metrics.totals?.revenue || 0).toLocaleString()],
        ['Processing', metrics.totals?.processingOrders || 0],
      ]
    })

    // Revenue by period
    autoTable(doc, {
      startY: doc.lastAutoTable ? doc.lastAutoTable.finalY + 16 : 120,
      head: [['Period', 'Revenue']],
      body: (timeSeries.current || []).map(r => [r.period, (r.revenue || 0).toLocaleString()])
    })

    // Top products
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 16,
      head: [['Top Products', 'Revenue']],
      body: (topProducts || []).map(p => [p.name, (p.value || 0).toLocaleString()])
    })

    // Category share
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 16,
      head: [['Category', 'Revenue']],
      body: (categoryBreakdown || []).map(c => [c.name, (c.value || 0).toLocaleString()])
    })

    doc.save('analytics.pdf')
  }

  return (
    <div className='w-full p-4'>
      <div className='text-xl font-semibold mb-3'>Analytics</div>

      {/* Filters */}
      <div className='bg-white rounded shadow p-3 mb-4 flex flex-wrap gap-3 items-end'>
        <div className='flex flex-col'>
          <label className='text-xs text-gray-500'>Từ ngày</label>
          <input type='date' value={from} onChange={e=>setFrom(e.target.value)} className='border rounded px-2 py-1' />
        </div>
        <div className='flex flex-col'>
          <label className='text-xs text-gray-500'>Đến ngày</label>
          <input type='date' value={to} onChange={e=>setTo(e.target.value)} className='border rounded px-2 py-1' />
        </div>
        <div className='flex flex-col'>
          <label className='text-xs text-gray-500'>Độ chi tiết</label>
          <select value={granularity} onChange={e=>setGranularity(e.target.value)} className='border rounded px-2 py-1'>
            {GRANULARITIES.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
          </select>
        </div>
        <div className='flex flex-col'>
          <label className='text-xs text-gray-500'>Top sản phẩm</label>
          <input type='number' min={1} max={20} value={topN} onChange={e=>setTopN(+e.target.value)} className='border rounded px-2 py-1 w-24' />
        </div>
        <label className='flex items-center gap-2'>
          <input type='checkbox' checked={comparePrev} onChange={e=>setComparePrev(e.target.checked)} /> So sánh kỳ trước
        </label>
        <button onClick={fetchOrders} className='px-3 py-2 bg-blue-600 text-white rounded'>Phân tích</button>
        <button onClick={exportCsv} className='px-3 py-2 border rounded'>Xuất CSV</button>
        <button onClick={exportPdf} className='px-3 py-2 border rounded'>Xuất PDF</button>
        <div className='text-sm text-gray-500'>Đã tải: {orders.length} đơn</div>
      </div>

      {/* Summary */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-3 mb-4'>
        <div className='bg-white rounded shadow p-3'><div className='text-xs text-gray-500'>Total Orders</div><div className='text-lg font-semibold'>{metrics.totals?.orders || 0}</div></div>
        <div className='bg-white rounded shadow p-3'><div className='text-xs text-gray-500'>Users</div><div className='text-lg font-semibold'>{metrics.totals?.users || 0}</div></div>
        <div className='bg-white rounded shadow p-3'><div className='text-xs text-gray-500'>Revenue</div><div className='text-lg font-semibold'>{Number(metrics.totals?.revenue || 0).toLocaleString()} VND</div></div>
        <div className='bg-white rounded shadow p-3'><div className='text-xs text-gray-500'>Processing</div><div className='text-lg font-semibold'>{metrics.totals?.processingOrders || 0}</div></div>
      </div>

      {/* Charts */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
        <div className='bg-white rounded shadow p-4'>
          <div className='font-semibold mb-2'>Revenue by {granularity}</div>
          <ResponsiveContainer width='100%' height={280}>
            <AreaChart data={timeSeries.current} margin={{ left: 50, right: 20, top: 10, bottom: 10 }}>
              <defs>
                <linearGradient id='revGrad' x1='0' y1='0' x2='0' y2='1'>
                  <stop offset='5%' stopColor='#2563eb' stopOpacity={0.35} />
                  <stop offset='95%' stopColor='#2563eb' stopOpacity={0} />
                </linearGradient>
                <linearGradient id='prevGrad' x1='0' y1='0' x2='0' y2='1'>
                  <stop offset='5%' stopColor='#fb923c' stopOpacity={0.35} />
                  <stop offset='95%' stopColor='#fb923c' stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey='period' />
              <YAxis width={70} tickFormatter={(v)=>compact(v)} />
              <Tooltip formatter={(v)=>Number(v).toLocaleString()} />
              <Legend />
              <Area type='monotone' dataKey='revenue' stroke='#2563eb' fill='url(#revGrad)' dot={false} name='Doanh thu' />
              {comparePrev && <Area type='monotone' dataKey='prev' stroke='#fb923c' fill='url(#prevGrad)' dot={false} name='Kỳ trước' />}
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className='bg-white rounded shadow p-4'>
          <div className='font-semibold mb-2'>Top sản phẩm bán chạy</div>
          <ResponsiveContainer width='100%' height={280}>
            <BarChart data={topProducts} margin={{ left: 50, right: 20, top: 10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey='name' hide={false} />
              <YAxis width={70} tickFormatter={(v)=>compact(v)} />
              <Tooltip formatter={(v)=>Number(v).toLocaleString()} />
              <Bar dataKey='value'>
                {topProducts.map((e,i)=>(<Cell key={i} fill={COLORS[i % COLORS.length]} />))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className='bg-white rounded shadow p-4 mt-4'>
        <div className='font-semibold mb-2'>Tỷ lệ doanh thu theo danh mục</div>
        <ResponsiveContainer width='100%' height={300}>
          <PieChart>
            <Pie data={categoryBreakdown} dataKey='value' nameKey='name' outerRadius={110} label>
              {categoryBreakdown.map((e,i)=>(<Cell key={i} fill={COLORS[i % COLORS.length]} />))}
            </Pie>
            <Tooltip formatter={(v)=>Number(v).toLocaleString()} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Orders table brief */}
      <div className='bg-white rounded shadow p-4 mt-4'>
        <div className='font-semibold mb-2'>Đơn hàng ({orders.length})</div>
        <div className='overflow-x-auto'>
          <table className='min-w-full text-sm'>
            <thead className='bg-gray-50'><tr><th className='px-2 py-1 text-left'>Mã</th><th className='px-2 py-1 text-left'>Khách</th><th className='px-2 py-1 text-left'>Trạng thái</th><th className='px-2 py-1 text-right'>Tổng</th><th className='px-2 py-1 text-left'>Ngày tạo</th></tr></thead>
            <tbody>
              {orders.slice(0,50).map(o=> (
                <tr key={o._id} className='border-t'>
                  <td className='px-2 py-1'>{o._id}</td>
                  <td className='px-2 py-1'>{o.orderBy?.email}</td>
                  <td className='px-2 py-1'>{o.status}</td>
                  <td className='px-2 py-1 text-right'>{Number(o.total||0).toLocaleString()}</td>
                  <td className='px-2 py-1'>{moment(o.createdAt).format('YYYY-MM-DD HH:mm')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Analytics
