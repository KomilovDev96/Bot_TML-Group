const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    telegramId: { type: Number, required: true, unique: true },
    language: { type: String, enum: ['ru', 'uz'], default: 'ru' },
    network: { type: String },
    txId: { type: String, unique: true },
    bnbAddress: { type: String },
    referrerId: { type: Number },
    referrals: { type: [Number], default: [] },
    points: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

const connectDB = async () => {
    try {
        await mongoose.connect(require('./config').MONGO_URI);
        console.log('MongoDB connected');
    } catch (err) {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    }
};

module.exports = { User, connectDB };