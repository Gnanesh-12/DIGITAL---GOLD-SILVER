const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Transaction = require('./models/Transaction');

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        const result = await Transaction.deleteMany({});
        console.log(`Deleted ${result.deletedCount} invalid transactions.`);
        mongoose.connection.close();
    })
    .catch(err => console.error(err));
