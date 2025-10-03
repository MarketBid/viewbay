import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../utils/api';

const JoinOrder: React.FC = () => {
  const [orderId, setOrderId] = useState('');
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [joining, setJoining] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [agreed, setAgreed] = useState(false);
  const navigate = useNavigate();

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setOrder(null);
    setMessage(null);
    try {
      const response = await apiClient.get(`/orders/${orderId}`);
      setOrder(response.data);
    } catch (err: any) {
      setError('Order not found. Please check the link or code and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) return;
    setJoining(true);
    setMessage(null);
    setError(null);
    try {
      await apiClient.post('/orders/join', { order_id: orderId });
      setMessage('You have joined the order successfully!');
      setTimeout(() => {
        navigate(`/orders/${orderId}`);
      }, 1500);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to join order. Please try again.');
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-12">
      <div className="flex items-center mb-8">
        {order && (
          <button
            type="button"
            onClick={() => { setOrder(null); setError(null); setMessage(null); setAgreed(false); setOrderId(''); }}
            className="mr-2 p-2 rounded-full hover:bg-gray-100 focus:outline-none"
            aria-label="Back"
          >
            <svg className="h-6 w-6 text-gray-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Join Transaction</h1>
      </div>
      {!order && (
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <p className="text-gray-500 mb-8 text-base">Please paste the Order ID you received from the Person you are transacting with.</p>
          <form onSubmit={handleConfirm} className="space-y-8">
            <div>
              <label htmlFor="order_id" className="block text-gray-600 text-base mb-2">Order ID</label>
              <input
                type="text"
                id="order_id"
                name="order_id"
                required
                value={orderId}
                onChange={e => setOrderId(e.target.value)}
                className="w-full border-0 border-b-2 border-gray-300 focus:border-blue-700 focus:ring-0 focus:outline-none text-lg px-0 py-2 bg-transparent placeholder-gray-400"
                placeholder=""
              />
            </div>
            <button
              type="submit"
              disabled={loading || !orderId}
              className="w-full py-3 text-base font-semibold rounded bg-blue-700 text-white shadow-md hover:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Confirming...' : 'Confirm'}
            </button>
            {error && <div className="text-red-600 text-center text-base mt-4">{error}</div>}
          </form>
        </div>
      )}
      {order && (
        <form onSubmit={handleJoin} className="space-y-8">
          <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <div className="text-xs text-gray-500 mb-1">Order ID</div>
                <div className="text-gray-800 text-base font-mono break-all">{order.order_id}</div>
                <div className="mt-6">
                  <div className="text-xs text-gray-500 mb-1">Description</div>
                  <div className="text-gray-800 text-base">{order.product_title}</div>
                </div>
              </div>
              <div className="space-y-6">
                {order.sender && (
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Sender</div>
                    <div className="text-gray-800 text-base">{order.sender.name}</div>
                  </div>
                )}
                {order.receiver && (
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Receiver</div>
                    <div className="text-gray-800 text-base">{order.receiver.name}</div>
                  </div>
                )}
                <div>
                  <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">Amount <span className="text-gray-400" title="Total order amount">&#9432;</span></div>
                  <div className="text-gray-800 text-base font-semibold">₵{order.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Currency</div>
                  <div className="text-gray-800 text-base">GHS</div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center mt-4">
            <input
              id="agree"
              type="checkbox"
              checked={agreed}
              onChange={e => setAgreed(e.target.checked)}
              className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="agree" className="ml-2 block text-gray-700 text-base">
              Agree to our <a href="#" className="text-blue-600 underline">Terms of Use</a>
            </label>
          </div>
          <button
            type="submit"
            disabled={joining || !agreed}
            className="w-full py-3 text-base font-semibold rounded border border-blue-600 text-gray-500 bg-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {joining ? 'Joining...' : 'Join Transaction'}
          </button>
          {message && <div className="text-green-600 text-center text-base mt-4">{message}</div>}
          {error && <div className="text-red-600 text-center text-base mt-4">{error}</div>}
        </form>
      )}
    </div>
  );
};

export default JoinOrder;
