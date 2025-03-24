// /bot/index.js

import TelegramBot from 'node-telegram-bot-api';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import translations from './locales/translate.js';
import { User } from './database/models.js';

dotenv.config();

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

// Подключение к MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const getTranslation = async (chatId, key) => {
    const user = await User.findOne({ chatId });
    const lang = user ? user.language : 'uz';
    return translations[lang][key];
};

// Стартовое сообщение
bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id.toString();
    let user = await User.findOne({ chatId });

    if (!user) {
        await bot.sendMessage(chatId, await getTranslation(chatId, 'start'), {
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: 'Oʻzbekcha', callback_data: 'lang_uz' },
                        { text: 'Русский', callback_data: 'lang_ru' },
                    ],
                    [
                        { text: 'Связаться с админом', url: 'https://t.me/admin_username' }
                    ]
                ],
            },
        });
    } else {
        await bot.sendMessage(chatId, await getTranslation(chatId, 'alreadyRegistered'));
    }
});

// Обработка изменения языка
bot.on('callback_query', async (query) => {
    const chatId = query.message.chat.id.toString();
    const data = query.data;

    if (data.startsWith('lang_')) {
        const lang = data.split('_')[1];
        await User.findOneAndUpdate({ chatId }, { language: lang }, { upsert: true });
        await bot.sendMessage(chatId, await getTranslation(chatId, 'languageSet'));
    }
});

// Просмотр баланса
bot.onText(/\/balance/, async (msg) => {
    const chatId = msg.chat.id.toString();
    const user = await User.findOne({ chatId });
    const balance = user ? user.balance : 0;
    await bot.sendMessage(chatId, `${await getTranslation(chatId, 'walletDetails')} ${balance} USDT`);
});

// Просмотр реферальной ссылки
bot.onText(/\/referral/, async (msg) => {
    const chatId = msg.chat.id.toString();
    const referralLink = `https://t.me/YourBotName?start=${chatId}`;
    const user = await User.findOne({ chatId });
    const referrals = user ? user.referrals.length : 0;

    await bot.sendMessage(chatId, `${await getTranslation(chatId, 'referralLink')} ${referralLink}\n${await getTranslation(chatId, 'referralCount')} ${referrals}`);
});

// Добавление промо-кода
bot.onText(/\/promo (.+)/, async (msg, match) => {
    const chatId = msg.chat.id.toString();
    const promoCode = match[1];
    await User.findOneAndUpdate({ chatId }, { promoCode });
    await bot.sendMessage(chatId, `Промо-код '${promoCode}' успешно добавлен!`);
});

// Топ пользователей
bot.onText(/\/top/, async (msg) => {
    const chatId = msg.chat.id.toString();
    const topUsers = await User.find().sort({ referrals: -1 }).limit(10);

    let message = await getTranslation(chatId, 'topUsers');
    topUsers.forEach((user, index) => {
        message += `${index + 1}. Chat ID: ${user.chatId} — ${user.referrals.length} рефералов\n`;
    });

    await bot.sendMessage(chatId, message);
});

// Статистика для администратора
bot.onText(/\/stats/, async (msg) => {
    const chatId = msg.chat.id.toString();

    if (chatId !== process.env.ADMIN_CHAT_ID) return;

    const totalUsers = await User.countDocuments();
    await bot.sendMessage(chatId, `${await getTranslation(chatId, 'totalUsers')} ${totalUsers}`);
});
