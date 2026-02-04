const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const runTest = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        // 1. Get an Admin User
        const admin = await User.findOne({ role: 'admin' });
        if (!admin) {
            console.error('No Admin found in DB!');
            process.exit(1);
        }
        console.log('Testing with Admin:', admin.email);

        // 2. Generate Token
        const token = jwt.sign({ id: admin._id, role: admin.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
        console.log('Generated Token');

        // Helper for fetch
        const fetchAPI = async (endpoint) => {
            console.log(`Fetching ${endpoint}...`);
            const res = await fetch(`http://localhost:5000/api/admin/${endpoint}`, {
                headers: { 'Authorization': token }
            });
            console.log(`${endpoint} Status:`, res.status);
            if (res.ok) {
                const data = await res.json();
                console.log(`${endpoint} Count:`, data.length);
                if (data.length > 0) console.log(`First ${endpoint} Item:`, JSON.stringify(data[0], null, 2));
            } else {
                const err = await res.text();
                console.error(`${endpoint} Failed:`, err);
            }
        };

        await fetchAPI('customers');
        await fetchAPI('dealers');

        mongoose.connection.close();
    } catch (error) {
        console.error('Test Failed:', error);
        if (mongoose.connection.readyState === 1) mongoose.connection.close();
    }
};

runTest();
