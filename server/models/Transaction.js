const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    customer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    dealer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    metal_type: { type: String, enum: ['gold', 'silver'], required: true },
    quantity: { type: Number, required: true }, // in grams

    // Security: Encrypted amount
    amount_encrypted: { type: String, required: true },

    // Security: Digital Signature
    dealer_signature: { type: String }, // Signed by dealer's private key

    type: { type: String, enum: ['buy', 'sell'], default: 'buy' },
    status: { type: String, enum: ['pending', 'completed', 'failed', 'rejected'], default: 'pending' },
    invoice_qr: { type: String }, // Base64 string
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Transaction', transactionSchema);
