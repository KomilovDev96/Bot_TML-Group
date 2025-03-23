// /config/database.js
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect: 'postgres',
        logging: false,
    }
);

sequelize
    .authenticate()
    .then(() => console.log('✅ Connected to the database.'))
    .catch((err) => console.error('❌ Unable to connect to the database:', err));

module.exports = sequelize;
