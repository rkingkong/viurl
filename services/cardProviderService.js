const requestPrepaidCard = async (userId, amount) => {
    // Mock implementation. Replace with actual API call to card provider.
    console.log(`Requesting prepaid card for user ${userId} with amount ${amount}`);
    return {
      cardNumber: '4111 1111 1111 1111',
      expiryDate: '12/23',
      cvv: '123'
    };
  };
  
  module.exports = {
    requestPrepaidCard
  };
  