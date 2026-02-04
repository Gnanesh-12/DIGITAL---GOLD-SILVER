const express = require('express');
const router = express.Router();
const {
    getDashboardStats,
    getPendingDealers,
    approveDealer,
    getAllTransactions,
    getAllCustomers,
    getAllDealers
} = require('../controllers/adminController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

// All Admin routes require 'admin' role
router.use(verifyToken, authorizeRoles('admin'));

router.get('/dashboard', getDashboardStats);
router.get('/pending-dealers', getPendingDealers);
router.post('/approve-dealer', approveDealer);
router.get('/monitor-transactions', getAllTransactions);
router.get('/customers', getAllCustomers);
router.get('/dealers', getAllDealers);

module.exports = router;
