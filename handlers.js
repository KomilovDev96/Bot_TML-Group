const { User } = require('./models');
const { TEXTS, NETWORKS, ADMIN_USERNAME } = require('./config');

module.exports = (bot) => {
    // Проверка TxID
    const isValidTxId = (txId) => /^[0-9a-fA-F]{64}$/.test(txId);

    // Проверка BNB адреса
    const isValidBnbAddress = (address) => /^0x[a-fA-F0-9]{40}$/.test(address);

    const getReferralLink = async (userId) => {
        const botInfo = await bot.getMe();
        return `https://t.me/${botInfo.username}?start=ref${userId}`;
    };
    // Обработка команды /start
    bot.onText(/\/start(?: ref(\d+))?/, async (msg, match) => {
        const chatId = msg.chat.id;
        const userId = msg.from.id;
        const referrerId = match[1] ? parseInt(match[1]) : null;

        try {
            let user = await User.findOneAndUpdate(
                { telegramId: userId },
                { $setOnInsert: { telegramId: userId, language: 'ru' } },
                { upsert: true, new: true }
            );

            if (referrerId && referrerId !== userId) {
                await User.updateOne(
                    { telegramId: referrerId },
                    { $addToSet: { referrals: userId }, $inc: { points: 1 } }
                );
            }

            // Клавиатура выбора языка
            bot.sendMessage(chatId, "Выберите язык / Tilni tanlang:", {
                reply_markup: {
                    keyboard: [
                        [{ text: "🇷🇺 Русский" }, { text: "🇺🇿 O'zbekcha" }]
                    ],
                    resize_keyboard: true
                }
            });
        } catch (error) {
            console.error('Start error:', error);
            bot.sendMessage(chatId, "⚠️ Ошибка / Xatolik");
        }
    });

    // Основной обработчик сообщений
    bot.on('message', async (msg) => {
        const { text, chat, from } = msg;
        const chatId = chat.id;
        const userId = from.id;

        if (!text || chat.type !== 'private') return;

        try {
            const user = await User.findOne({ telegramId: userId });
            if (!user) return;

            const lang = user.language;
            const texts = TEXTS[lang];


            // Генерация реферальной ссылки


            // Выбор языка
            if (["🇷🇺 Русский", "🇺🇿 O'zbekcha"].includes(text)) {
                const language = text.includes('Русский') ? 'ru' : 'uz';
                await User.updateOne({ telegramId: userId }, { language });

                // Клавиатура выбора сети
                bot.sendMessage(chatId, texts.languageSelected, {
                    reply_markup: {
                        keyboard: [["TRC20", "BEP20"]],
                        resize_keyboard: true
                    }
                });
            }

            // Выбор сети
            else if (["TRC20", "BEP20"].includes(text)) {
                await User.updateOne({ telegramId: userId }, { network: text });
                const address = NETWORKS[text];

                bot.sendMessage(chatId, texts.networkSelected
                    .replace('{network}', text)
                    .replace('{address}', address), {
                    parse_mode: 'Markdown',
                    reply_markup: { remove_keyboard: true }
                });
            }

            // Обработка TxID
            else if (user.network && !user.txId) {
                if (!isValidTxId(text)) {
                    return bot.sendMessage(chatId, texts.invalidTxId);
                }

                const existingTx = await User.findOne({ txId: text });
                if (existingTx) {
                    return bot.sendMessage(chatId, texts.txIdExists);
                }

                await User.updateOne({ telegramId: userId }, { txId: text });
                bot.sendMessage(chatId, texts.txIdValid);
            }

            // Обработка BNB адреса
            else if (user.txId && !user.bnbAddress) {
                if (!isValidBnbAddress(text)) {
                    return bot.sendMessage(chatId, texts.invalidBnbAddress);
                }

                await User.updateOne({ telegramId: userId }, { bnbAddress: text });
                const refLink = await getReferralLink(userId); // Ждем разрешения Promise
                const refCount = user.referrals.length;
                // Определяем текст кнопки в зависимости от языка
                const referralButtonText = lang === 'ru'
                    ? '/referrals - Мои рефералы'
                    : '/referrals - Referallarim';

                // Формируем финальное сообщение без Markdown
                const finalMessage = texts.success
                    .replace('{userId}', userId)
                    .replace('{refLink}', refLink) // Теперь refLink - строка, а не Promise
                    .replace('{refCount}', refCount)
                    .replace('{adminUsername}', ADMIN_USERNAME);

                bot.sendMessage(chatId, finalMessage, {
                    reply_markup: {
                        keyboard: [[{ text: referralButtonText }]],
                        resize_keyboard: true
                    }
                });
            }

            // Обработка команды /referrals

            else if (text.startsWith('/referrals')) {
                try {
                    const refCount = user.referrals.length;
                    const points = user.points;
                    const refLink = await getReferralLink(userId);

                    let message;
                    if (refCount > 0) {
                        message = lang === 'ru'
                            ? `📊 Ваши рефералы:\n\n👥 Приглашено: ${refCount}\n⭐ Баллы: ${points}`
                            : `📊 Referallaringiz:\n\n👥 Taklif qilganlar: ${refCount}\n⭐ Ballar: ${points}`;
                    } else {
                        message = lang === 'ru'
                            ? '🔹 Пригласите друзей и получайте бонусы!'
                            : '🔹 Do‘stlaringizni taklif qiling va bonus oling!';
                    }

                    const inviteButton = {
                        text: lang === 'ru' ? 'Пригласить друзей ✉️' : 'Do‘stlarni taklif qilish ✉️',
                        url: `https://t.me/share/url?url=${encodeURIComponent(`Присоединяйся к боту! ${refLink}`)}`
                    };

                    await bot.sendMessage(chatId, message, {
                        reply_markup: {
                            inline_keyboard: [[inviteButton]]
                        }
                    });

                } catch (error) {
                    console.error('Ошибка в /referrals:', error);
                    const errorText = lang === 'ru'
                        ? '❌ Ошибка при загрузке рефералов'
                        : '❌ Referallarni yuklashda xatolik';
                    bot.sendMessage(chatId, errorText);
                }
            }

        } catch (error) {
            console.error('Message error:', error);
            bot.sendMessage(chatId, "⚠️ Ошибка / Xatolik");
        }
    });
};