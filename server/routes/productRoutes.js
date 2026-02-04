const express = require('express');
const router = express.Router();
const { addProduct, updateProduct, getAllProducts, getMyProducts } = require('../controllers/productController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

// Public: View Prices
router.get('/', getAllProducts);

// Dealer Only Routes
router.post('/', verifyToken, authorizeRoles('dealer'), addProduct);
router.put('/:id', verifyToken, authorizeRoles('dealer'), updateProduct);
router.get('/my-inventory', verifyToken, authorizeRoles('dealer'), getMyProducts);

module.exports = router;
