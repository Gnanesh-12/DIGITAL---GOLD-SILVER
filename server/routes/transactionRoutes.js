const express = require('express');
const router = express.Router();
const { buyMetal, approveTransaction, getMyTransactions, getInvoice } = require('../controllers/transactionController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

// Public Route
router.get('/invoice/:id', getInvoice);

// Protected Routes
router.use(verifyToken);
router.post('/buy', authorizeRoles('customer'), buyMetal);
router.post('/approve', authorizeRoles('dealer', 'admin'), approveTransaction);
router.get('/my-transactions', getMyTransactions);

module.exports = router;
