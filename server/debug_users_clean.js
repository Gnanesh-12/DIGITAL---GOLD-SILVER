const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        const customers = await User.find({ role: 'customer' }, 'name email');
        console.log('--- CUSTOMERS ---');
        console.log(JSON.stringify(customers, null, 2));
        console.log('-----------------');
        mongoose.connection.close();
    })
    .catch(err => console.error(err));
