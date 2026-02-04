const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log('Connected. Fetching Customers...');
        const customers = await User.find({ role: 'customer' });
        console.log(JSON.stringify(customers, null, 2));
        mongoose.connection.close();
    })
    .catch(err => console.error(err));
