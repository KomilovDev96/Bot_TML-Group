// Импорт нужных модулей
const { Telegraf } = require('telegraf');
const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

// Инициализация бота и базы данных
const bot = new Telegraf(process.env.BOT_TOKEN);
const sequelize = new Sequelize('test', 'postgres', '1234', {
    host: 'localhost',
    dialect: 'postgres',
    port: 5432,
});


// Модель пользователя
const User = sequelize.define('User', {
    telegramId: { type: DataTypes.STRING, unique: true },
    language: { type: DataTypes.STRING, defaultValue: 'uz' },
    network: { type: DataTypes.STRING },
    txId: { type: DataTypes.STRING },
    referralCode: { type: DataTypes.STRING },
    referredBy: { type: DataTypes.STRING },
});

// Стартовое сообщение
bot.start(async (ctx) => {
    const telegramId = ctx.from.id.toString();
    const referredBy = ctx.startPayload || null;
    let user = await User.findOne({ where: { telegramId } });

    if (!user) {
        const referralCode = Math.random().toString(36).substring(2, 8);
        user = await User.create({ telegramId, referralCode, referredBy });
    }

    await ctx.reply('Tilni tanlang / Выберите язык:', {
        reply_markup: {
            inline_keyboard: [
                [
                    { text: 'Oʻzbekcha', callback_data: 'lang_uz' },
                    { text: 'Русский', callback_data: 'lang_ru' },
                ],
            ],
        },
    });
});

// Обработка выбора языка
bot.on('callback_query', async (ctx) => {
    const telegramId = ctx.from.id.toString();
    const user = await User.findOne({ where: { telegramId } });
    const data = ctx.callbackQuery.data;

    if (data === 'lang_uz') {
        user.language = 'uz';
        await user.save();
        await ctx.reply('Siz Oʻzbek tilini tanladingiz!');
        // Отправляем меню выбора сети
        await ctx.reply('Tarmoqni tanlang:', {
            reply_markup: {
                inline_keyboard: [
                    [{ text: '1. BSC (BEP20)', callback_data: 'network_bsc' }],
                    [{ text: '2. TRC (TRC20)', callback_data: 'network_trc' }]
                ]
            }
        });
    } else if (data === 'lang_ru') {
        user.language = 'ru';
        await user.save();
        await ctx.reply('Вы выбрали русский язык!');
        // Отправляем меню выбора сети
        await ctx.reply('Выберите сеть:', {
            reply_markup: {
                inline_keyboard: [
                    [{ text: '1. BSC (BEP20)', callback_data: 'network_bsc' }],
                    [{ text: '2. TRC (TRC20)', callback_data: 'network_trc' }]
                ]
            }
        });
    } else if (data === 'network_bsc') {
        user.network = 'BSC';
        await user.save();
        await ctx.reply('Вы выбрали BSC. Отправьте свой TxID.');
    } else if (data === 'network_trc') {
        user.network = 'TRC';
        await user.save();
        await ctx.reply('Вы выбрали TRC. Отправьте свой TxID.');
    }

    await ctx.answerCbQuery();
});


// Обработка текста
bot.on('text', async (ctx) => {
    const telegramId = ctx.from.id.toString();
    const text = ctx.message.text;
    let user = await User.findOne({ where: { telegramId } });

    const messages = {
        uz: {
            networkBSC: 'BSC tarmogʻini tanladingiz. Pulingizni quyidagi manzilga yuboring: 0xBSC_ADDRESS\nJo\'natganingizdan so\'ng TxID ni yuboring.',
            networkTRC: 'TRC tarmogʻini tanladingiz. Pulingizni quyidagi manzilga yuboring: TTRC_ADDRESS\nJo\'natganingizdan so\'ng TxID ni yuboring.',
            txReceived: 'TxID qabul qilindi. Tasdiqni kuting.',
            invalidTx: 'Notoʻgʻri format. Qaytadan urinib ko\'ring.',
        },
        ru: {
            networkBSC: 'Вы выбрали сеть BSC. Отправьте средства на адрес: 0xBSC_ADDRESS\nПосле отправки пришлите TxID.',
            networkTRC: 'Вы выбрали сеть TRC. Отправьте средства на адрес: TTRC_ADDRESS\nПосле отправки пришлите TxID.',
            txReceived: 'TxID получен. Ожидайте подтверждения.',
            invalidTx: 'Неверный формат. Попробуйте снова.',
        },
    };

    const lang = user.language || 'uz';

    if (text === '1') {
        user.network = 'BSC';
        await user.save();
        await ctx.reply(messages[lang].networkBSC);
    } else if (text === '2') {
        user.network = 'TRC';
        await user.save();
        await ctx.reply(messages[lang].networkTRC);
    } else if (text.startsWith('0x') || text.length === 64) {
        user.txId = text;
        await user.save();
        await ctx.reply(messages[lang].txReceived);
    } else {
        await ctx.reply(messages[lang].invalidTx);
    }
});

// Команда /referrals
bot.command('referrals', async (ctx) => {
    const telegramId = ctx.from.id.toString();
    const user = await User.findOne({ where: { telegramId } });
    const referrals = await User.findAll({ where: { referredBy: user.referralCode } });

    if (referrals.length === 0) {
        return ctx.reply('Sizda hali referral yo\'q. / У вас пока нет рефералов.');
    }

    const referralList = referrals.map(u => u.telegramId).join('\n');
    await ctx.reply(`Sizning referralaringiz: / Ваши рефералы:\n${referralList}`);
});

// Команда /admin
bot.command('admin', (ctx) => {
    ctx.reply('Admin bilan bog\'lanish uchun: @AdminUsername / Связаться с админом: @AdminUsername');
});

// Запуск бота и базы данных
sequelize.sync().then(() => {
    bot.launch();
    console.log('Бот запущен!');
});
