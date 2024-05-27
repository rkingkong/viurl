import React, { useState } from 'react';
import axios from 'axios';

const RequestCard = () => {
  const [userId, setUserId] = useState('');
  const [amount, setAmount] = useState('');
  const [cardDetails, setCardDetails] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const { data } = await axios.post('/cards/request-card', { userId, amount });
      setCardDetails(data);
    } catch (error) {
      console.error('Error requesting card:', error);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="User ID"
        />
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount"
        />
        <button type="submit">Request Card</button>
      </form>
      {cardDetails && (
        <div>
          <p>Card Number: {cardDetails.cardNumber}</p>
          <p>Expiry Date: {cardDetails.expiryDate}</p>
          <p>CVV: {cardDetails.cvv}</p>
        </div>
      )}
    </div>
  );
};

export default RequestCard;
