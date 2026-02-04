const Transaction = require('../models/Transaction');
const Product = require('../models/Product');
const User = require('../models/User');
const { encrypt, decrypt } = require('../utils/encryption');
const { signData, generateKeyPair } = require('../utils/signature');
const QRCode = require('qrcode');

// Buy Metal (Customer)
exports.buyMetal = async (req, res) => {
    try {
        const { dealer_id, metal_type, quantity } = req.body;

        const product = await Product.findOne({ dealer_id, metal_type });
        if (!product) return res.status(404).json({ message: 'Product not found' });

        const amount = product.price_per_gram * quantity;
        const encryptedAmount = encrypt(amount.toString());

        const transaction = new Transaction({
            customer_id: req.user.id,
            dealer_id,
            metal_type,
            quantity,
            amount_encrypted: encryptedAmount,
            status: 'pending' // waits for dealer approval
        });

        await transaction.save();
        res.status(201).json({ message: 'Order placed, waiting for dealer approval', transactionId: transaction._id });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Dealer Approves Transaction & Signs it
exports.approveTransaction = async (req, res) => {
    try {
        const { transactionId } = req.body;
        const transaction = await Transaction.findById(transactionId);

        if (!transaction) return res.status(404).json({ message: 'Transaction not found' });

        // Allow if user is the dealer OR an admin
        if (transaction.dealer_id.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        if (transaction.status !== 'pending') return res.status(400).json({ message: 'Transaction already processed' });

        // Update Stock
        // Update Stock & Customer Portfolio based on Type
        const product = await Product.findOne({ dealer_id: transaction.dealer_id, metal_type: transaction.metal_type });
        const customer = await User.findById(transaction.customer_id);

        if (transaction.type === 'buy') {
            // Dealer Sells, Customer Buys
            if (product.stock < transaction.quantity) return res.status(400).json({ message: 'Insufficient Stock' });
            product.stock -= transaction.quantity;

            if (transaction.metal_type === 'gold') customer.portfolio.gold += transaction.quantity;
            else customer.portfolio.silver += transaction.quantity;

        } else if (transaction.type === 'sell') {
            // Customer Sells, Dealer Buys
            product.stock += transaction.quantity;

            if (transaction.metal_type === 'gold') {
                if (customer.portfolio.gold < transaction.quantity) return res.status(400).json({ message: 'Customer has insufficient Gold' });
                customer.portfolio.gold -= transaction.quantity;
            } else {
                if (customer.portfolio.silver < transaction.quantity) return res.status(400).json({ message: 'Customer has insufficient Silver' });
                customer.portfolio.silver -= transaction.quantity;
            }
        }

        await product.save();
        await customer.save();

        // Digital Signature
        // Simulating getting Dealer's Private Key (In real app, dealer provides it or it's stored securely)
        // For demo, we stick to a generated pair per session or just generate one here
        const keys = generateKeyPair(); // SIMULATION: New keys for each sign (In reality, load from DB/Keystore)
        const signature = signData({
            id: transaction._id,
            amount: decrypt(transaction.amount_encrypted),
            qty: transaction.quantity
        }, keys.privateKey);
        // Generate Invoice QR (URL)
        const qrData = `http://localhost:5173/invoice/${transaction._id}`;
        const qrCode = await QRCode.toDataURL(qrData);

        transaction.dealer_signature = signature;
        transaction.invoice_qr = qrCode;
        transaction.status = 'completed';

        await transaction.save();

        res.json({ message: 'Transaction Approved & Signed', transaction });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Public Invoice API
exports.getInvoice = async (req, res) => {
    try {
        const { id } = req.params;
        const transaction = await Transaction.findById(id)
            .populate('dealer_id', 'name company_name')
            .populate('customer_id', 'name email');

        if (!transaction) return res.status(404).json({ message: 'Invoice Not Found' });

        const txObj = transaction.toObject();
        try {
            txObj.amount = decrypt(transaction.amount_encrypted);
        } catch (e) {
            txObj.amount = 'Error Decrypting';
        }

        res.json(txObj);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Get My Transactions
exports.getMyTransactions = async (req, res) => {
    try {
        const field = req.user.role === 'dealer' ? 'dealer_id' : 'customer_id';
        const transactions = await Transaction.find({ [field]: req.user.id })
            .populate('customer_id', 'name email')
            .populate('dealer_id', 'name company_name');

        // Decrypt amounts for display
        const decryptedTransactions = transactions.map(tx => {
            const txObj = tx.toObject();
            try {
                txObj.amount = decrypt(tx.amount_encrypted);
            } catch (e) {
                txObj.amount = 'Error Decrypting';
            }
            return txObj;
        });

        res.json(decryptedTransactions);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};
