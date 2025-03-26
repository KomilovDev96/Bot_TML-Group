const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    telegramId: { type: Number, required: true, unique: true },
    language: { type: String, enum: ['ru', 'uz'], default: 'ru' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);