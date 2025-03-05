const router = require('express').Router()
const ctrls = require('../controllers/product')
const {verifyAccessToken, isAdmin} = require('../middleware/verifyToken')


router.post('/',[verifyAccessToken, isAdmin], ctrls.createProduct)
router.get('/', ctrls.getProducts)
router.delete('/:pid',[verifyAccessToken, isAdmin], ctrls.deleteProduct)
router.put('/:pid',[verifyAccessToken, isAdmin], ctrls.updateProduct)
router.get('/:pid',[verifyAccessToken, isAdmin], ctrls.getProduct)






module.exports = router

// CREATE - READ - UPDATE - DELETE | POST - GET - PUT - DELETE 
// POST + PUT - BODY
// GET + DELETE - QUERY