const { Sequelize } = require('sequelize');

module.exports = new Sequelize(
    'test',
    'root',
    '12345',
    {
        host: 'localhost',
        port: '5432',
        dialect: 'postgres'
    }
)