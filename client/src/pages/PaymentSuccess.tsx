import React from 'react';
import { useNavigate } from 'react-router-dom';

const PaymentSuccess: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="container" style={{ textAlign: 'center', padding: '5rem' }}>
      <div style={{ fontSize: '4rem', color: 'green', marginBottom: '1rem' }}>✓</div>
      <h1>Payment Successful!</h1>
      <p style={{ margin: '1rem 0', color: 'var(--text-muted)' }}>Thank you for your purchase. Your order is being processed.</p>
      <button className="btn btn-primary" onClick={() => navigate('/')}>Continue Shopping</button>
    </div>
  );
};

export default PaymentSuccess;
