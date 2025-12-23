const Order = require('../models/order')
const User = require('../models/user')
const Coupon = require('../models/coupon')
const asyncHandler = require('express-async-handler')

const createOrder = asyncHandler(async(req, res) => {
    const {_id} = req.user
    const {coupon} = req.body
    const userCart = await User.findById(_id).select('cart').populate('cart.product', 'title price')
    const products = userCart?.cart?.map(el => ({
        product: el.product._id,
        count: el.quantity,
        color: el.color,
    }))
    let total = userCart?.cart?.reduce((sum,el) => el.product.price * el.quantity + sum, 0)
    const createData = {products, total, orderBy: _id }
    if (coupon) {
        const selectedCoupon = await Coupon.findById(coupon)
        total = Math.round(total * (1 - +selectedCoupon?.discount/100) / 1000) * 1000 || total
        createData.total = total
        createData.coupon = coupon
    }
    const rs = await Order.create(createData)
    return res.json({
        success: rs ? true : false,
        rs: rs ? rs : 'Something went wrong',
        
    })
})

const updateStatus = asyncHandler(async(req, res) => {
    const {oid} = req.params
    const {status} = req.body
    if (!status) throw new Error('Missing status')
    const response = await Order.findByIdAndUpdate(oid, {status}, {new: true})
    return res.json({
        success: response ? true : false,
        response: response ? response : 'Something went wrong',
        
    })
})

const getUserOrder = asyncHandler(async(req, res) => {
    const {_id} = req.user
    try {
        const response = await Order.find({orderBy: _id})
            .populate({
                path: 'products.product',
                select: 'title thumb price slug category variants'
            })
            .sort({ createdAt: -1 })
        
        // Lọc bỏ các sản phẩm không tồn tại
        const validOrders = response.map(order => {
            const orderObj = order.toObject ? order.toObject() : order;
            return {
                ...orderObj,
                products: orderObj.products?.filter(p => p.product) || []
            };
        });
        
        return res.json({
            success: true,
            response: validOrders
        })
    } catch (error) {
        console.error('Error in getUserOrder:', error)
        return res.status(500).json({
            success: false,
            response: 'Internal server error'
        })
    }
})

const getOrderDetail = asyncHandler(async(req, res) => {
    const {_id} = req.user
    const {orderId} = req.params
    
    if (!orderId) {
        return res.status(400).json({
            success: false,
            response: 'Order ID is required'
        })
    }
    
    try {
        const response = await Order.findOne({_id: orderId, orderBy: _id})
            .populate({
                path: 'products.product',
                select: 'title thumb price slug category variants description brand'
            })
            .populate('coupon', 'name discount')
        
        if (!response) {
            return res.status(404).json({
                success: false,
                response: 'Order not found'
            })
        }
        
        // Lọc bỏ các sản phẩm không tồn tại
        const validOrder = {
            ...response.toObject(),
            products: response.products?.filter(p => p.product) || []
        }
        
        return res.json({
            success: true,
            response: validOrder
        })
    } catch (error) {
        console.error('Error in getOrderDetail:', error)
        return res.status(500).json({
            success: false,
            response: 'Internal server error'
        })
    }
})

const getOrders = asyncHandler(async(req, res) => {
    const response = await Order.find()
    return res.json({
        success: response ? true : false,
        response: response ? response : 'Something went wrong',
        
    })
})

// Admin metrics for dashboard
const getAdminMetrics = asyncHandler(async(req, res) => {
    const [totalUsers, totalOrders, succeedOrders, processingOrders, cancelledOrders] = await Promise.all([
        User.countDocuments({}),
        Order.countDocuments({}),
        Order.countDocuments({ status: 'Succeed' }),
        Order.countDocuments({ status: 'Processing' }),
        Order.countDocuments({ status: 'Cancelled' }),
    ])

    const revenueAgg = await Order.aggregate([
        { $match: { status: 'Succeed' } },
        { $group: { _id: null, revenue: { $sum: { $ifNull: ['$total', 0] } } } }
    ])
    const totalRevenue = revenueAgg?.[0]?.revenue || 0

    // Time ranges
    const todayStart = new Date(); todayStart.setHours(0,0,0,0)
    const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0,0,0,0)

    const [todayAgg, monthAgg] = await Promise.all([
        Order.aggregate([
            { $match: { status: 'Succeed', paidAt: { $gte: todayStart } } },
            { $group: { _id: null, revenue: { $sum: { $ifNull: ['$total', 0] } }, orders: { $sum: 1 } } }
        ]),
        Order.aggregate([
            { $match: { status: 'Succeed', paidAt: { $gte: monthStart } } },
            { $group: { _id: null, revenue: { $sum: { $ifNull: ['$total', 0] } }, orders: { $sum: 1 } } }
        ])
    ])

    const revenueToday = todayAgg?.[0]?.revenue || 0
    const ordersToday = todayAgg?.[0]?.orders || 0
    const revenueThisMonth = monthAgg?.[0]?.revenue || 0
    const ordersThisMonth = monthAgg?.[0]?.orders || 0

    // Revenue by month (last 12 months)
    const monthly = await Order.aggregate([
        { $match: { status: 'Succeed' } },
        { $group: { _id: { $dateToString: { format: '%Y-%m', date: { $ifNull: ['$paidAt', '$$NOW'] } } }, value: { $sum: { $ifNull: ['$total', 0] } } } },
        { $sort: { _id: 1 } }
    ])

    // Latest 10 activities (orders)
    const recentOrders = await Order.find({}).sort({ createdAt: -1 }).limit(10).select('status total createdAt')

    const avgOrderValue = succeedOrders ? Math.round((totalRevenue / succeedOrders) * 100) / 100 : 0

    return res.json({
        success: true,
        metrics: {
            totals: { users: totalUsers, orders: totalOrders, revenue: totalRevenue, succeedOrders, processingOrders, cancelledOrders },
            today: { revenue: revenueToday, orders: ordersToday },
            thisMonth: { revenue: revenueThisMonth, orders: ordersThisMonth },
            avgOrderValue,
            monthly,
            recentOrders,
        }
    })
})

const listAdminOrders = asyncHandler(async (req, res) => {
    const { q, status, from, to, page = 1, limit = 20 } = req.query
    const query = {}
    if (status) query.status = status
    if (from || to) {
        query.createdAt = {}
        if (from) query.createdAt.$gte = new Date(new Date(from).setHours(0,0,0,0))
        if (to) query.createdAt.$lte = new Date(new Date(to).setHours(23,59,59,999))
    }
    if (q) {
        if (q.match(/^[0-9a-fA-F]{24}$/)) query._id = q
    }

    const skip = (Number(page) - 1) * Number(limit)

    const [orders, total] = await Promise.all([
        Order.find(query)
            .populate('orderBy', 'firstname lastname email')
            .populate('products.product', 'title thumb price category')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit)),
        Order.countDocuments(query)
    ])

    res.json({ success: true, result: orders, total })
})

const adminUpdateStatus = asyncHandler(async (req, res) => {
    const { oid } = req.params
    const { status } = req.body
    if (!status) throw new Error('Missing status')
    const allow = ['Created', 'Processing', 'Shipping', 'Delivered', 'Cancelled', 'Returned', 'Succeed']
    if (!allow.includes(status)) return res.status(400).json({ success: false, message: 'Invalid status' })
    const updated = await Order.findByIdAndUpdate(oid, { status }, { new: true })
    res.json({ success: !!updated, result: updated })
})

const adminDeleteOrder = asyncHandler(async (req, res) => {
    const { oid } = req.params
    const deleted = await Order.findByIdAndDelete(oid)
    return res.json({ success: !!deleted })
})

module.exports = {
    createOrder,
    updateStatus,
    getUserOrder,
    getOrderDetail,
    getOrders,
    getAdminMetrics,
    listAdminOrders,
    adminUpdateStatus,
    adminDeleteOrder,
}