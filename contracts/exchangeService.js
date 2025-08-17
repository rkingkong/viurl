const axios = require('axios');

const COINBASE_API_URL = 'https://api.coinbase.com/v2';
const BINANCE_API_URL = 'https://api.binance.com/api/v3';

const convertToFiat = async (cryptoAmount, cryptoType, fiatCurrency) => {
  try {
    const response = await axios.get(`${COINBASE_API_URL}/prices/${cryptoType}-${fiatCurrency}/spot`);
    const conversionRate = response.data.data.amount;
    const fiatAmount = cryptoAmount * conversionRate;
    return fiatAmount;
  } catch (error) {
    console.error('Error converting to fiat:', error);
    throw new Error('Conversion failed');
  }
};

const transferToBankAccount = async (userId, amount, currency) => {
  // This is a mock implementation. Replace with actual API calls to transfer to the user's bank account.
  console.log(`Transferring ${amount} ${currency} to user ${userId}'s bank account`);
  return true;
};

module.exports = {
  convertToFiat,
  transferToBankAccount
};
