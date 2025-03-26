// /bot/index.js

import TelegramBot from 'node-telegram-bot-api';

import { v4 as uuidv4 } from 'uuid';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import messages from './locales/translate.js';
import { User } from './database/models.js';
dotenv.config();

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

// Подключение к MongoDB
mongoose.set("strictQuery", false);
mongoose.connect(process.env.MONGODB_URI).then(() => {
    console.log(`Mongoga onlayn ulandik`);
})


const getTranslation = async (chatId, key) => {
    const user = await User.findOne({ chatId });
    const lang = user ? user.language : 'uz';
    return messages[lang][key];
};

// Стартовое сообщение
// === Обработка команды /start ===
// === Обработка команды /start ===
// === Обработка команды /start ===
bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;

    // Генерация уникального ID
    const uniqueId = uuidv4();

    // Сохранение пользователя с уникальным ID
    await User.findOneAndUpdate(
        { telegramId: chatId.toString() },
        { $setOnInsert: { uniqueId, chatId: chatId.toString() } },
        { upsert: true, new: true }
    );

    // Показать выбор языка
    bot.sendMessage(chatId, messages['ru'].start, {
        reply_markup: {
            keyboard: [
                [{ text: '🇷🇺 Русский' }, { text: '🇺🇿 Oʻzbekcha' }],
            ],
            resize_keyboard: true,
        },
    });
});

// === Обработка сообщений ===
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    const user = await User.findOne({ telegramId: chatId.toString() });
    const lang = user?.language || 'ru';

    if (text === '🇷🇺 Русский') {
        await setLanguage(chatId, 'ru');
        sendNetworkMessage(chatId, 'ru');
    } else if (text === '🇺🇿 Oʻzbekcha') {
        await setLanguage(chatId, 'uz');
        sendNetworkMessage(chatId, 'uz');
    } else if (text === 'BSC (BEP20)' || text === 'TRC (TRC20)') {
        const network = text.includes('BSC') ? 'BSC' : 'TRC';
        await User.findOneAndUpdate({ telegramId: chatId.toString() }, { network });

        const walletAddress = network === 'BSC'
            ? '0xb302eb2446dafc84c2ae7397b524f36df19ef116'
            : 'TWQRBDbi7yDcKmxRzBGFSi9ahDaRqxokSL';

        bot.sendMessage(chatId, `${messages[lang].network_selected(network)} ${walletAddress}. ${messages[lang].enter_txid}`);
    } else if (user?.network && (!user.walletBSC || !user.walletTRC)) {
        if (text.length < 10 || !/^([a-zA-Z0-9]+)$/.test(text)) {
            bot.sendMessage(chatId, messages[lang].invalid_address);
        } else {
            const updateField = user.network === 'BSC' ? 'walletBSC' : 'walletTRC';
            await User.findOneAndUpdate({ telegramId: chatId.toString() }, { [updateField]: text });
            bot.sendMessage(chatId, messages[lang].address_saved);
        }
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
// bot.onText(/\/stats/, async (msg) => {
//     const chatId = msg.chat.id.toString();

//     if (chatId !== process.env.ADMIN_CHAT_ID) return;

//     const totalUsers = await User.countDocuments();
//     await bot.sendMessage(chatId, `${await getTranslation(chatId, 'totalUsers')} ${totalUsers}`);
// });
