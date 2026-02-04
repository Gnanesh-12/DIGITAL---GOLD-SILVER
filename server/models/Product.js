const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    dealer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    metal_type: { type: String, enum: ['gold', 'silver'], required: true },
    price_per_gram: { type: Number, required: true },
    stock: { type: Number, required: true }, // in grams
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', productSchema);
