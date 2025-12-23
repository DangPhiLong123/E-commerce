import React, { useEffect, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, AreaChart, Area } from 'recharts'
import { FaChartBar, FaMoneyBill, FaUsers, FaShoppingCart, FaSync, FaPlus, FaBox } from 'react-icons/fa'
import { apiGetAdminMetrics } from 'apis'

const Stat = ({ label, value }) => (
  <div className='bg-white rounded shadow p-3'>
    <div className='text-xs text-gray-500'>{label}</div>
    <div className='text-lg font-semibold'>{Number(value || 0).toLocaleString()}</div>
  </div>
)

const currency = (v) => (Number(v || 0)).toLocaleString('vi-VN') + ' VND'
const compact = (v) => new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(Number(v || 0))
const formatMonth = (id) => {
  if (!id) return ''
  const [y, m] = id.split('-')
  const month = ['','01','02','03','04','05','06','07','08','09','10','11','12'].indexOf(m)
  const names = ['','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return `${names[month]} ${y}`
}

const Dashboard = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [metrics, setMetrics] = useState({ totals: {}, monthly: [], recentOrders: [], today: {}, thisMonth: {}, avgOrderValue: 0 })

  useEffect(() => {
    const fetchMetrics = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await apiGetAdminMetrics()
        if (res?.success && res.metrics) {
          setMetrics(res.metrics)
        } else {
          setError('Không thể tải số liệu dashboard')
        }
      } catch (e) {
        setError('Có lỗi khi tải số liệu dashboard')
      }
      setLoading(false)
    }
    fetchMetrics()
  }, [])

  const summary = [
    { key: 'revenue', label: 'Total Revenue', value: metrics.totals?.revenue || 0, icon: <FaMoneyBill className='text-green-600' /> },
    { key: 'orders', label: 'Total Orders', value: metrics.totals?.orders || 0, icon: <FaShoppingCart className='text-blue-600' /> },
    { key: 'succeed', label: 'Orders Succeed', value: metrics.totals?.succeedOrders || 0, icon: <FaBox className='text-amber-600' /> },
    { key: 'users', label: 'Total Users', value: metrics.totals?.users || 0, icon: <FaUsers className='text-purple-600' /> }
  ]

  const barData = (metrics.monthly || []).map(m => ({ month: formatMonth(m._id), revenue: m.value, projection: Math.round(m.value * 0.4) }))
  const areaData = (metrics.monthly || []).map(m => ({ month: formatMonth(m._id), net: Math.round(m.value * 0.6), gross: m.value }))

  const tooltipStyle = { background: 'white', border: '1px solid #e5e7eb', borderRadius: 8 }

  return (
    <div className='w-full p-4'>
      {loading && <div>Đang tải số liệu...</div>}
      {error && <div className='text-red-600'>{error}</div>}

      {/* Summary Cards */}
      <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4'>
        {summary.map(card => (
          <div key={card.key} className='bg-white rounded-xl shadow p-4 flex items-center gap-4'>
            <div className='text-3xl p-3 rounded-full bg-gray-50'>{card.icon}</div>
            <div className='flex-1'>
              <div className='text-sm text-gray-500'>{card.label}</div>
              <div className='text-2xl font-semibold'>{Number(card.value || 0).toLocaleString()}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick KPI row */}
      <div className='grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 mt-4'>
        <Stat label='Revenue Today' value={metrics.today?.revenue} />
        <Stat label='Orders Today' value={metrics.today?.orders} />
        <Stat label='Revenue This Month' value={metrics.thisMonth?.revenue} />
        <Stat label='Orders This Month' value={metrics.thisMonth?.orders} />
        <Stat label='Cancelled Orders' value={metrics.totals?.cancelledOrders} />
        <Stat label='Avg Order Value' value={metrics.avgOrderValue} />
      </div>

      {/* Charts */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4'>
        <div className='bg-white rounded-xl shadow p-4'>
          <div className='flex items-center gap-2 mb-2 font-semibold'><FaChartBar /> Revenue By Month</div>
          <ResponsiveContainer width='100%' height={300}>
            <BarChart data={barData} barCategoryGap={20} margin={{ top: 10, right: 20, left: 50, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke='#e5e7eb' />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis width={70} tickFormatter={(v)=>compact(v)} tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v,n)=>[currency(v), n]} />
              <Legend />
              <Bar dataKey="revenue" fill="#2563eb" name='Revenue' radius={[8,8,0,0]} />
              <Bar dataKey="projection" fill="#fb923c" name='Projection' radius={[8,8,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className='bg-white rounded-xl shadow p-4'>
          <div className='flex items-center gap-2 mb-2 font-semibold'>Net vs Gross</div>
          <ResponsiveContainer width='100%' height={300}>
            <AreaChart data={areaData} margin={{ top: 10, right: 20, left: 50, bottom: 10 }}>
              <defs>
                <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorGross" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.35}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke='#e5e7eb' />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis width={70} tickFormatter={(v)=>compact(v)} tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v,n)=>[currency(v), n]} />
              <Legend />
              <Area type="monotone" dataKey="gross" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorGross)" name='Gross' />
              <Area type="monotone" dataKey="net" stroke="#22c55e" fillOpacity={1} fill="url(#colorNet)" name='Net' />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Activity & Notifications */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4'>
        <div className='bg-white rounded-xl shadow p-4 lg:col-span-2'>
          <div className='font-semibold mb-3'>Recent Activity</div>
          <ul className='space-y-2'>
            {(metrics.recentOrders || []).map((o, idx) => (
              <li key={o._id || idx} className='flex items-center justify-between border-b last:border-b-0 pb-2'>
                <span className='text-gray-700'>Order {o._id?.slice(-6) || ''} • {o.status} • {(o.total || 0).toLocaleString()} VND</span>
                <span className='text-xs text-gray-500'>{new Date(o.createdAt).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className='bg-white rounded-xl shadow p-4'>
          <div className='font-semibold mb-3'>Alerts</div>
          <div className='text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded p-3 mb-2'>
            Inventory low: 5 products under safety stock.
          </div>
          <div className='text-sm text-red-700 bg-red-50 border border-red-200 rounded p-3'>
            2 payments overdue over 30 days.
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className='bg-white rounded-xl shadow p-4 mt-4'>
        <div className='font-semibold mb-3'>Quick Actions</div>
        <div className='flex flex-wrap gap-3'>
          <button className='px-3 py-2 bg-blue-600 text-white rounded flex items-center gap-2'>
            <FaPlus /> Create Product
          </button>
          <button className='px-3 py-2 bg-green-600 text-white rounded flex items-center gap-2'>
            <FaSync /> Sync Inventory
          </button>
          <button className='px-3 py-2 bg-purple-600 text-white rounded flex items-center gap-2'>
            <FaUsers /> Invite Staff
          </button>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
