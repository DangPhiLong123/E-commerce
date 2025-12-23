const router = require('express').Router()
const {verifyAccessToken, isAdmin} = require('../middleware/verifyToken')
const ctrls = require('../controllers/order')


router.post('/', verifyAccessToken, ctrls.createOrder)
router.put('/status/:oid', verifyAccessToken, isAdmin, ctrls.updateStatus)
router.get('/admin/metrics', verifyAccessToken, isAdmin, ctrls.getAdminMetrics)
router.get('/admin', verifyAccessToken, isAdmin, ctrls.getOrders)
router.get('/admin/list', verifyAccessToken, isAdmin, ctrls.listAdminOrders)
router.put('/admin/:oid/status', verifyAccessToken, isAdmin, ctrls.adminUpdateStatus)
router.delete('/admin/:oid', verifyAccessToken, isAdmin, ctrls.adminDeleteOrder)
router.get('/:orderId', verifyAccessToken, ctrls.getOrderDetail)
router.get('/', verifyAccessToken, ctrls.getUserOrder)


module.exports = router