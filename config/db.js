const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.set("strictQuery", false);
        await mongoose.connect(process.env.MONGODB_URI).then(() => {
            console.log(`Mongoga onlayn ulandik`);
        })
    } catch (err) {
        console.error('MongoDB connection error:', err);
    }
};

module.exports = connectDB;