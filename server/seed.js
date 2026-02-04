const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Product = require('./models/Product');

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected for Seeding'))
    .catch(err => console.error(err));

const seedData = async () => {
    try {
        // Clear existing data (optional, but good for clean state)
        // await User.deleteMany({});
        // await Product.deleteMany({});

        // 1. Create a Verified Dealer
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash('password123', salt);

        const dealer = new User({
            name: 'Gold King Ltd',
            email: 'dealer@test.com',
            password_hash: hash,
            role: 'dealer',
            company_name: 'Gold King Ltd',
            is_verified: true
        });

        const savedDealer = await dealer.save();
        console.log('Dealer created:', savedDealer.email);

        // 2. Add Products
        const products = [
            {
                dealer_id: savedDealer._id,
                metal_type: 'gold',
                price_per_gram: 65,
                stock: 1000
            },
            {
                dealer_id: savedDealer._id,
                metal_type: 'silver',
                price_per_gram: 0.85,
                stock: 5000
            }
        ];

        await Product.insertMany(products);
        console.log('Products added!');

        mongoose.connection.close();
    } catch (error) {
        console.error('Seeding Error:', error);
        process.exit(1);
    }
};

seedData();
