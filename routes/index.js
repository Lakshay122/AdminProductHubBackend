const express = require('express');
const router = express.Router();


const userRoutes = require('./user.routes')
const productRoutes = require('./product.routes')

router.use('/admin-user',userRoutes)
router.use('/product',productRoutes)

module.exports = router;
