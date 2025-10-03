import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Package, DollarSign, User, Clock, CheckCircle, CreditCard } from 'lucide-react';
import { Order, OrderStatus } from '../types';
import { useAuth } from '../hooks/useAuth.tsx';
import { apiClient } from '../utils/api';

const PaymentCode: React.FC = () => {
  const { paymentCode } = useParams<{ paymentCode: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (paymentCode) {
      fetchOrderByPaymentCode();
    }
  }, [paymentCode]);

  const fetchOrderByPaymentCode = async () => {
    try {
      const response = await apiClient.get<Order>(`/orders/payment-code/${paymentCode}`);
      setOrder(response.data);
    } catch (error) {
      console.error('Failed to fetch order:', error);
      // Mock data for demo
      const mockOrder: Order = {
        id: 1,
        order_id: "ORD-001",
        product_title: "iPhone 14 Pro",
        description: "Brand new iPhone 14 Pro 256GB Space Black",
        amount: 3500,
        sender_id: 1,
        receiver_id: 2,
        sender: {
          id: 1,
          name: "John Doe",
          email: "john@example.com",
          contact: "+233541234567",
          rating: 4.5,
          total_ratings: 23,
          is_business: false,
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-01T00:00:00Z"
        },
        status: OrderStatus.PENDING,
        payment_code: paymentCode!,
        created_at: "2024-01-20T10:30:00Z",
        updated_at: "2024-01-20T10:30:00Z"
      };
      setOrder(mockOrder);
    } finally {
      setLoading(false);
    }
  };

  const processPayment = async () => {
    if (!order) return;
    
    setProcessing(true);
    try {
      // This would integrate with your payment provider (Paystack, etc.)
      const response = await apiClient.post(`/payment/initiate-payment`, {
        order_id: order.id,
        amount: order.amount,
        callback_url: window.location.origin + `/orders/${order.id}`
      });
      
      // Redirect to payment provider or show payment form
      if (response.data.payment_url) {
        window.location.href = response.data.payment_url;
      }
    } catch (error) {
      setError('Failed to process payment. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const assignSelfAsReceiver = async () => {
    if (!order || !user) return;
    
    try {
      await apiClient.patch(`/orders/${order.id}/assign-receiver`, {
        receiver_id: user.id
      });
      
      setOrder({
        ...order,
        receiver_id: user.id,
        receiver: user
      });
    } catch (error) {
      setError('Failed to assign receiver. Please try again.');
    }
  };

  const formatAmount = (amount: number) => {
    return `₵${amount.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Order Not Found</h2>
          <p className="text-gray-600 mb-6">
            The payment code "{paymentCode}" doesn't match any active orders.
          </p>
          <button
            onClick={() => navigate('/orders')}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            View My Orders
          </button>
        </div>
      </div>
    );
  }

  const canPay = order.status === OrderStatus.PENDING;
  const isPaid = [OrderStatus.PAID, OrderStatus.IN_TRANSIT, OrderStatus.DELIVERED, OrderStatus.COMPLETED].includes(order.status);
  const isReceiver = order.receiver_id === user?.id;
  const isSender = order.sender_id === user?.id;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            {isPaid ? (
              <CheckCircle className="h-8 w-8 text-green-600" />
            ) : (
              <Package className="h-8 w-8 text-blue-600" />
            )}
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {isPaid ? 'Payment Completed' : 'Secure Payment'}
          </h1>
          <p className="text-gray-600">
            Payment Code: <span className="font-medium">{paymentCode}</span>
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {/* Order Details */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Package className="h-5 w-5 text-blue-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Order Details</h2>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {order.product_title}
            </h3>
            <p className="text-gray-600 leading-relaxed">
              {order.description}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
            <div>
              <span className="text-sm text-gray-500">Order ID</span>
              <p className="font-medium text-gray-900">{order.order_id}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Amount</span>
              <p className="font-medium text-gray-900">{formatAmount(order.amount)}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Status</span>
              <p className="font-medium text-gray-900 capitalize">{order.status}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Created</span>
              <p className="font-medium text-gray-900">
                {new Date(order.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Seller Information */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <User className="h-5 w-5 text-purple-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Seller Information</h2>
        </div>

        <div className="p-4 border border-gray-200 rounded-lg">
          <h4 className="font-medium text-gray-900">{order.sender?.name}</h4>
          <p className="text-sm text-gray-600">{order.sender?.email}</p>
          <p className="text-sm text-gray-600">{order.sender?.contact}</p>
          {order.sender?.rating && (
            <div className="flex items-center mt-2">
              <div className="flex space-x-1">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(order.sender!.rating)
                        ? 'text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  >
                    ★
                  </div>
                ))}
              </div>
              <span className="ml-2 text-sm text-gray-600">
                {order.sender.rating.toFixed(1)} ({order.sender.total_ratings} reviews)
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Payment Action */}
      {!isPaid && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CreditCard className="h-5 w-5 text-green-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Payment</h2>
          </div>

          {!order.receiver_id && !isSender && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800 mb-3">
                This order doesn't have an assigned receiver yet. Would you like to proceed as the receiver?
              </p>
              <button
                onClick={assignSelfAsReceiver}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                Accept as Receiver
              </button>
            </div>
          )}

          {canPay && (order.receiver_id || !isSender) && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">{formatAmount(order.amount)}</span>
                </div>
                <div className="flex justify-between items-center text-lg font-semibold pt-2 border-t border-gray-200">
                  <span>Total:</span>
                  <span>{formatAmount(order.amount)}</span>
                </div>
              </div>

              <button
                onClick={processPayment}
                disabled={processing || isSender}
                className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {processing ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Processing Payment...
                  </div>
                ) : isSender ? (
                  'Cannot pay your own order'
                ) : (
                  `Pay ${formatAmount(order.amount)}`
                )}
              </button>

              <p className="text-sm text-gray-500 text-center">
                Your payment is secured by escrow. The seller will only receive funds after you confirm delivery.
              </p>
            </div>
          )}

          {isSender && (
            <div className="text-center py-4">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">Waiting for payment from buyer</p>
            </div>
          )}
        </div>
      )}

      {/* Status Message */}
      {isPaid && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
          <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-green-900 mb-2">Payment Successful!</h3>
          <p className="text-green-700 mb-4">
            The payment has been processed and is being held in escrow until delivery is confirmed.
          </p>
          <button
            onClick={() => navigate(`/orders/${order.id}`)}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            View Order Details
          </button>
        </div>
      )}
    </div>
  );
};

export default PaymentCode;