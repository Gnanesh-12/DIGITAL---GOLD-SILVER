const User = require('../models/User');
const Product = require('../models/Product');
const Transaction = require('../models/Transaction');
const { decrypt } = require('../utils/encryption');

// Dashboard Stats
exports.getDashboardStats = async (req, res) => {
    try {
        const totalCustomers = await User.countDocuments({ role: 'customer' });
        const totalDealers = await User.countDocuments({ role: 'dealer' });
        const totalTransactions = await Transaction.countDocuments();
        const pendingDealers = await User.countDocuments({ role: 'dealer', is_verified: false });

        res.json({
            totalCustomers,
            totalDealers,
            totalTransactions,
            pendingDealers
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Get Pending Dealers
exports.getPendingDealers = async (req, res) => {
    try {
        const dealers = await User.find({ role: 'dealer', is_verified: false });
        res.json(dealers);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Approve Dealer
exports.approveDealer = async (req, res) => {
    try {
        const { id } = req.body;
        const dealer = await User.findById(id);
        if (!dealer) return res.status(404).json({ message: 'User not found' });

        dealer.is_verified = true;
        await dealer.save();

        res.json({ message: 'Dealer Approved successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Monitor All Transactions AND Security Logs
exports.getAllTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find()
            .populate('customer_id', 'name email')
            .populate('dealer_id', 'name company_name')
            .sort({ timestamp: -1 });

        // Admin can see decrypted amounts
        const data = transactions.map(tx => {
            const txObj = tx.toObject();
            try {
                txObj.amount = decrypt(tx.amount_encrypted);
            } catch (e) {
                txObj.amount = 'Error Decrypting';
            }
            return txObj;
        });

        res.json(data);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Get All Customers
exports.getAllCustomers = async (req, res) => {
    try {
        const customers = await User.find({ role: 'customer' }).select('-password_hash');
        res.json(customers);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Get All Dealers with Inventory
exports.getAllDealers = async (req, res) => {
    try {
        const dealers = await User.find({ role: 'dealer' }).select('-password_hash');

        // Fetch inventory for each dealer
        const dealersWithInventory = await Promise.all(dealers.map(async (dealer) => {
            const products = await Product.find({ dealer_id: dealer._id });
            return {
                ...dealer.toObject(),
                inventory: products
            };
        }));

        res.json(dealersWithInventory);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};
