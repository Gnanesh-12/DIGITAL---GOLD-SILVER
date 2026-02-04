const express = require('express');
const router = express.Router();
const { getHoldingsByDealer, sellMetal } = require('../controllers/customerController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

router.use(verifyToken, authorizeRoles('customer'));

router.get('/holdings', getHoldingsByDealer);
router.post('/sell', sellMetal);

module.exports = router;
