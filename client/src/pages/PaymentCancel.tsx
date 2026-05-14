import React from 'react';
import { useNavigate } from 'react-router-dom';

const PaymentCancel: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="container" style={{ textAlign: 'center', padding: '5rem' }}>
      <div style={{ fontSize: '4rem', color: 'red', marginBottom: '1rem' }}>✕</div>
      <h1>Payment Cancelled</h1>
      <p style={{ margin: '1rem 0', color: 'var(--text-muted)' }}>Your payment was not processed. You can try again whenever you're ready.</p>
      <button className="btn btn-outline" onClick={() => navigate('/')}>Return to Shop</button>
    </div>
  );
};

export default PaymentCancel;
