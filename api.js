const axios = require('axios');
const { BSCSCAN_API_KEY, TRONSCAN_API_KEY } = require('./config');

const checkBscTransaction = async (txId) => {
    try {
        const response = await axios.get(
            `https://api.bscscan.com/api?module=transaction&action=gettxreceiptstatus&txhash=${txId}&apikey=${BSCSCAN_API_KEY}`
        );
        return response.data.status === '1';
    } catch (error) {
        console.error('BSCScan API error:', error);
        return false;
    }
};

const checkTronTransaction = async (txId) => {
    try {
        const response = await axios.get(
            `https://api.tronscan.org/api/transaction-info?hash=${txId}`
        );
        return response.data.contractRet === 'SUCCESS';
    } catch (error) {
        console.error('TronScan API error:', error);
        return false;
    }
};

module.exports = {
    checkBscTransaction,
    checkTronTransaction
};