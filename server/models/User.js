const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password_hash: { type: String, required: true },
    role: {
        type: String,
        enum: ['customer', 'dealer', 'admin'],
        default: 'customer'
    },
    // Dealer specific
    company_name: { type: String },
    is_verified: { type: Boolean, default: false }, // Admin approval for dealer

    // OTP Auth
    otp: { type: String },
    otpExpires: { type: Date },

    // Customer specific
    wallet_balance: { type: Number, default: 0 },
    portfolio: {
        gold: { type: Number, default: 0 }, // in grams
        silver: { type: Number, default: 0 } // in grams
    },

    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
