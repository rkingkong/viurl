import React, { useState } from 'react';
import axios from 'axios';

const ConvertAndTransfer = () => {
  const [formData, setFormData] = useState({
    cryptoAmount: '',
    cryptoType: 'VIURL',
    fiatCurrency: 'USD',
    fiatAmount: '',
    userId: '',
    amount: '',
    currency: 'USD'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleConvert = async (e) => {
    e.preventDefault();
    const { cryptoAmount, cryptoType, fiatCurrency } = formData;
    try {
      const res = await axios.post('/fiat/convert', { cryptoAmount, cryptoType, fiatCurrency });
      setFormData({ ...formData, fiatAmount: res.data.fiatAmount });
    } catch (err) {
      console.error(err);
    }
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    const { userId, amount, currency } = formData;
    try {
      const res = await axios.post('/fiat/transfer', { userId, amount, currency });
      console.log(res.data.message);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <form onSubmit={handleConvert}>
        <input
          type="text"
          name="cryptoAmount"
          placeholder="Crypto Amount"
          onChange={handleChange}
        />
        <input
          type="text"
          name="cryptoType"
          placeholder="Crypto Type"
          value="VIURL"
          readOnly
        />
        <input
          type="text"
          name="fiatCurrency"
          placeholder="Fiat Currency"
          value="USD"
          readOnly
        />
        <button type="submit">Convert to Fiat</button>
      </form>
      {formData.fiatAmount && <p>Converted Amount: {formData.fiatAmount} USD</p>}
      <form onSubmit={handleTransfer}>
        <input
          type="text"
          name="userId"
          placeholder="User ID"
          onChange={handleChange}
        />
        <input
          type="text"
          name="amount"
          placeholder="Amount"
          onChange={handleChange}
        />
        <input
          type="text"
          name="currency"
          placeholder="Currency"
          value="USD"
          readOnly
        />
        <button type="submit">Transfer to Bank Account</button>
      </form>
    </div>
  );
};

export default ConvertAndTransfer;
