import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';

const stripePromise = loadStripe('your-public-stripe-key');

const PaymentForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [amount, setAmount] = useState(0);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    const cardElement = elements.getElement(CardElement);

    try {
      const { data: paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });

      const { data: paymentIntent } = await axios.post('/payments/create-payment-intent', {
        amount: amount * 100, // Convert to cents
        currency: 'usd',
        paymentMethod: paymentMethod.id,
      });

      const confirmedPaymentIntent = await stripe.confirmCardPayment(paymentIntent.client_secret);
      
      if (confirmedPaymentIntent.error) {
        console.error('Error confirming payment:', confirmedPaymentIntent.error.message);
      } else {
        console.log('Payment successful:', confirmedPaymentIntent);
      }
    } catch (error) {
      console.error('Error handling payment:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Amount"
      />
      <CardElement />
      <button type="submit" disabled={!stripe}>
        Pay
      </button>
    </form>
  );
};

const Payment = () => (
  <Elements stripe={stripePromise}>
    <PaymentForm />
  </Elements>
);

export default Payment;
