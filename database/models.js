// /database/models.js

import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    chatId: { type: String, required: true },
    language: { type: String, enum: ['uz', 'ru'], default: 'uz' },
    walletBSC: { type: String, default: '' },
    walletTRC: { type: String, default: '' },
    referrals: { type: [String], default: [] },
    balance: { type: Number, default: 0 },
    promoCode: { type: String, default: '' },
});

export const User = mongoose.model('User', UserSchema);
