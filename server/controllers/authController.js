const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendOTP } = require('../utils/emailService');

// Helper to generate 6 digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Register User (Step 1: Save User & Send OTP)
exports.register = async (req, res) => {
    try {
        const { name, email, password, role, company_name } = req.body;

        // Check if user exists
        console.log('Registering user:', email, role); // DEBUG LOG
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: 'User already exists' });

        // Password Hashing
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        const otp = generateOTP();
        const otpExpires = Date.now() + 10 * 60 * 1000; // 10 mins

        const newUser = new User({
            name,
            email,
            password_hash,
            role,
            company_name: role === 'dealer' ? company_name : undefined,
            is_verified: role === 'dealer' ? false : true, // Dealers still need admin verify
            otp,
            otpExpires
        });

        await newUser.save();
        await sendOTP(email, otp);

        res.status(201).json({ message: 'User registered. OTP sent to email.', otpSent: true, email });

    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Login User (Step 1: Check Creds & Send OTP)
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });

        // Check verification (for Dealers)
        if (user.role === 'dealer' && !user.is_verified) {
            return res.status(403).json({ message: 'Dealer account not verified by Admin.' });
        }

        // Compare Hash
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        // Generate & Send OTP
        const otp = generateOTP();
        user.otp = otp;
        user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 mins
        await user.save();

        await sendOTP(email, otp);

        res.json({ message: 'OTP sent to email', otpSent: true, email });

    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Verify OTP (Step 2: Issue Token or Confirm Email)
exports.verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'User not found' });

        if (!user.otp || !user.otpExpires) {
            return res.status(400).json({ message: 'No OTP requested' });
        }

        if (user.otp !== otp) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        if (user.otpExpires < Date.now()) {
            return res.status(400).json({ message: 'OTP Expired' });
        }

        // OTP Verified - Clear it
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        // Special Case: Dealer registering for the first time
        // If they are verifying email but are NOT verified by Admin yet, do NOT log them in.
        console.log('Verifying OTP for:', user.email, 'Role:', user.role, 'Verified:', user.is_verified); // DEBUG LOG

        if (user.role === 'dealer' && !user.is_verified) {
            return res.json({
                success: true,
                message: 'Email Verified! Pending Admin Approval.',
                pendingApproval: true
            });
        }

        // Generate JWT (For Customers or Verified Dealers)
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({ token, role: user.role, name: user.name, message: 'Login Successful' });

    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};
