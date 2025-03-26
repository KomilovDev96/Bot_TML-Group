const TelegramBot = require('node-telegram-bot-api');
const { connectDB } = require('./models');
const { TOKEN } = require('./config');
const setupHandlers = require('./handlers');

const bot = new TelegramBot(TOKEN, { polling: true });

(async () => {
    try {
        await connectDB();
        setupHandlers(bot);
        console.log('Bot started successfully!');
    } catch (error) {
        console.error('Failed to start bot:', error);
        process.exit(1);
    }
})();