const router = require('express').Router()
const ctrls = require('../controllers/user')
const {verifyAccessToken, isAdmin} = require('../middleware/verifyToken')
const uploadCloud = require('../config/cloudinary.config');


router.post('/register', ctrls.register)
router.post('/mock', ctrls.createUsers)
router.get('/finalregister/:token', ctrls.finalregister)
router.post('/login', ctrls.login)
router.get('/current', verifyAccessToken, ctrls.getCurrent)
router.post('/refreshtoken',  ctrls.refreshAccessToken)
router.get('/logout', ctrls.logout)
router.post('/forgotpassword', ctrls.forgotPassword)
router.put('/resetpassword', ctrls.resetPassword)
router.get('/',[verifyAccessToken, isAdmin], ctrls.getUsers)
router.delete('/',[verifyAccessToken, isAdmin], ctrls.deleteUser)
router.put('/current',[verifyAccessToken], uploadCloud.single('avatar'), ctrls.updateUser)
router.put('/address',[verifyAccessToken], ctrls.updateAddressUser)
router.put('/cart',[verifyAccessToken], ctrls.updateCart)
router.delete('/remove-cart/:pid',[verifyAccessToken], ctrls.removeProductInCart)
router.get('/public/:id', ctrls.getUserById)


router.put('/:uid',[verifyAccessToken, isAdmin], ctrls.updateUserByAdmin)









module.exports = router

// CREATE - READ - UPDATE - DELETE | POST - GET - PUT - DELETE 
// POST + PUT - BODY
// GET + DELETE - QUERY