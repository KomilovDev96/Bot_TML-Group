require('dotenv').config();

module.exports = {
    TOKEN: process.env.TELEGRAM_BOT_TOKEN,
    MONGO_URI: process.env.MONGO_URI,
    ADMIN_USERNAME: process.env.ADMIN_USERNAME,

    NETWORKS: {
        TRC20: {
            address: "TLa2f6VPqDgRE67v1736s7bJ8Ray5wYjU7",
            name: { ru: "TRC20", uz: "TRON" }
        },
        BEP20: {
            address: "0xb302eb2446dafc84c2ae7397b524f36df19ef116",
            name: { ru: "BEP20", uz: "BNB" }
        }
    },

    TEXTS: {
        ru: {
            start: "🇷🇺 Выберите язык:",
            languageSelected: "Язык установлен: Русский\n\nВыберите сеть для перевода:",
            networkSelected: "Вы выбрали {network}. Отправьте USDT на:\n\n`{address}`\n\nПосле отправки введите TxID:",
            invalidTxId: "❌ Ошибка: TxID должен содержать 64 hex-символа",
            txIdRequest: "Введите TxID транзакции:",
            txIdExists: "❌ Этот TxID уже используется",
            txIdValid: "✅ TxID подтвержден! Введите BNB-адрес (BEP20):",
            invalidBnbAddress: "❌ Неверный адрес. Пример: 0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
            success: "✅ Готово!\n\nID: {userId}\nРеферальная ссылка: {refLink}\nПриглашено: {refCount}\n\nДля вывода: @{adminUsername}",
            referralsInfo: "👥 Ваши рефералы:\n\nПриглашено: {count} человек\nБаллы: {points}",
            noReferrals: "У вас пока нет приглашенных пользователей",
            referralsTitle: "👥 Ваши рефералы",
            referralsCount: "Приглашено: {count} человек",
            referralsPoints: "Ваши баллы: {points}",
            inviteFriends: "Пригласить друзей",
            
        },
        uz: {
            start: "🇺🇿 Tilni tanlang:",
            languageSelected: "Til: O'zbek\n\nUSDT yuborish uchun tarmoqni tanlang:",
            networkSelected: "Siz {network} tanladingiz. USDT manzilga yuboring:\n\n`{address}`\n\nTxID kiriting:",
            invalidTxId: "❌ Xato: TxID 64 ta belgidan iborat bo'lishi kerak",
            txIdRequest: "TxID tranzaksiyasini kiriting:",
            txIdExists: "❌ Bu TxID allaqachon ishlatilgan",
            txIdValid: "✅ TxID tasdiqlandi! BNB manzilini kiriting:",
            invalidBnbAddress: "❌ Xato manzil. Misol: 0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
            success: "✅ Tayyor!\n\nID: {userId}\nReferal havola: {refLink}\nTakliflar: {refCount}\n\nYechish uchun: @{adminUsername}",
            referralsInfo: "👥 Sizning referallaringiz:\n\nTaklif qilinganlar: {count} kishi\nBallar: {points}",
            noReferrals: "Hozircha taklif qilinganlar yo'q", 
            referralsTitle: "👥 Sizning referallaringiz",
            referralsCount: "Taklif qilinganlar: {count} kishi",
            referralsPoints: "Sizning ballaringiz: {points}",
            inviteFriends: "Do'stlarni taklif qilish",
        }
    }
};