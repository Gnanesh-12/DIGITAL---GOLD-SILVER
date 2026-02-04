const Transaction = require('../models/Transaction');
const User = require('../models/User');
const Product = require('../models/Product');
const { encrypt } = require('../utils/encryption');

// Get Holdings Breakdown by Dealer
exports.getHoldingsByDealer = async (req, res) => {
    try {
        const userId = req.user.id;
        const transactions = await Transaction.find({ customer_id: userId, status: 'completed' })
            .populate('dealer_id', 'name company_name');

        const holdings = {};

        transactions.forEach(tx => {
            const dealerId = tx.dealer_id._id.toString();
            const dealerName = tx.dealer_id.company_name || tx.dealer_id.name;

            if (!holdings[dealerId]) {
                holdings[dealerId] = {
                    dealerId,
                    dealerName,
                    gold: 0,
                    silver: 0
                };
            }

            // Default to 'buy' if type is missing (backward compatibility)
            const type = tx.type || 'buy';

            if (type === 'buy') {
                if (tx.metal_type === 'gold') holdings[dealerId].gold += tx.quantity;
                else holdings[dealerId].silver += tx.quantity;
            } else if (type === 'sell') {
                if (tx.metal_type === 'gold') holdings[dealerId].gold -= tx.quantity;
                else holdings[dealerId].silver -= tx.quantity;
            }
        });

        res.json(Object.values(holdings));
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Sell Metal to Dealer
exports.sellMetal = async (req, res) => {
    try {
        const { dealerId, metal_type, quantity } = req.body;
        const customerId = req.user.id;

        // Verify Customer has enough metal OVERALL (Simple check)
        // Or strictly per dealer? Usually fungible, but let's stick to user portfolio check first.
        const customer = await User.findById(customerId);
        if (metal_type === 'gold' && customer.portfolio.gold < quantity) {
            return res.status(400).json({ message: 'Insufficient Gold Balance' });
        }
        if (metal_type === 'silver' && customer.portfolio.silver < quantity) {
            return res.status(400).json({ message: 'Insufficient Silver Balance' });
        }

        // Get Dealer Price (Used as Sell Price? Or slightly lower? For demo, same price)
        const product = await Product.findOne({ dealer_id: dealerId, metal_type });
        if (!product) return res.status(404).json({ message: 'Dealer not accepting this metal' });

        const amount = product.price_per_gram * quantity;
        const encryptedAmount = encrypt(amount.toString());

        const transaction = new Transaction({
            customer_id: customerId,
            dealer_id: dealerId,
            metal_type,
            quantity,
            amount_encrypted: encryptedAmount,
            type: 'sell',
            status: 'pending' // waits for dealer approval
        });

        await transaction.save();
        res.status(201).json({ message: 'Sell Order Placed. Waiting for Dealer Approval', transaction });

    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};
