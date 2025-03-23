const TelegramApi = require('node-telegram-bot-api')

const token = '7917858444:AAEKF8AHppu-MVkP7CifGH7d8jWVcx-N8iE'

// /index.js
require('dotenv').config();
const { Telegraf } = require('telegraf');
const sequelize = require('./config/database');

const bot = new Telegraf(process.env.BOT_TOKEN);

// Запуск бота
bot.start((ctx) => ctx.reply('Привет! Я твой новый бот.'));

// Проверка подключения к БД и запуск бота
(async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ База данных подключена.');
        await bot.launch();
        console.log('🤖 Бот запущен.');
    } catch (error) {
        console.error('❌ Ошибка при запуске бота:', error);
    }
})();

// Остановка бота корректно
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
