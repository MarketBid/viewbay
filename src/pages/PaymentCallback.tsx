import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { apiClient } from '../utils/api';

const PaymentCallback: React.FC = () => {
  const location = useLocation();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const reference = params.get('reference');
    if (reference) {
      apiClient.post('/payment/payment-callback', { reference })
        .then(() => {
          setStatus('success');
          setMessage('Payment verified successfully!');
        })
        .catch(() => {
          setStatus('error');
          setMessage('Payment verification failed.');
        });
    } else {
      setStatus('error');
      setMessage('No payment reference found.');
    }
  }, [location]);

  return (
    <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-xl shadow text-center">
      {status === 'loading' && <div>Verifying payment...</div>}
      {status === 'success' && <div className="text-green-600 font-bold">{message}</div>}
      {status === 'error' && <div className="text-red-600 font-bold">{message}</div>}
    </div>
  );
};

export default PaymentCallback;
