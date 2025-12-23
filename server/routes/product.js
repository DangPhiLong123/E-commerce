const express = require('express');
const router = express.Router();
const ctrls = require('../controllers/product');
const { verifyAccessToken, isAdmin } = require('../middleware/verifyToken');
const uploadCloud = require('../config/cloudinary.config');

router.post('/',[verifyAccessToken, isAdmin], ctrls.createProduct)
router.get('/', ctrls.getProducts)
router.put('/ratings',verifyAccessToken, ctrls.ratings)
router.delete('/:pid',[verifyAccessToken, isAdmin], ctrls.deleteProduct)
router.put('/uploadimage/:pid',[verifyAccessToken, isAdmin], uploadCloud.array('images', 10), ctrls.uploadImagesProduct)
router.put('/:pid',[verifyAccessToken, isAdmin], ctrls.updateProduct)
router.get('/:pid', ctrls.getProduct)

router.post('/:pid/variant', [verifyAccessToken, isAdmin], ctrls.addVarriant)
router.delete('/:pid/variant/:variantId', [verifyAccessToken, isAdmin], ctrls.removeVarriant)

// Route upload thumb
router.post('/upload-thumb', verifyAccessToken, isAdmin, uploadCloud.single('image'), ctrls.uploadThumbImage);
// Route upload images
router.post('/upload-images', verifyAccessToken, isAdmin, uploadCloud.array('images', 10), ctrls.uploadImages);

module.exports = router;

// CREATE - READ - UPDATE - DELETE | POST - GET - PUT - DELETE 
// POST + PUT - BODY
// GET + DELETE - QUERY