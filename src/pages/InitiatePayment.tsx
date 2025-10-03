import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Package, 
  DollarSign, 
  User, 
  Clock, 
  CheckCircle, 
  CreditCard,
  ArrowLeft,
  Shield,
  AlertCircle
} from 'lucide-react';
import { Order, OrderStatus } from '../types';
import { useAuth } from '../hooks/useAuth';
import { apiClient } from '../utils/api';

const InitiatePayment: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      const response = await apiClient.get<Order>(`/orders/${orderId}`);
      setOrder(response.data);
    } catch (error) {
      console.error('Failed to fetch order details:', error);
    } finally {
      setLoading(false);
    }
  };

  const processPayment = async () => {
    if (!order) return;
    setProcessing(true);
    setError('');
    try {
      // Send GET request to initiate payment
      const response = await apiClient.get(`/payment/initiate-payment/${order.order_id}`);
      window.location.href = response.data

      // You can handle response here (e.g., redirect, show message)
      // Example: if (response.data.payment_url) window.location.href = response.data.payment_url;
    } catch (error) {
      setError('Failed to initiate payment. Please try again.');
    } finally {
      setProcessing(false);
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
            The order you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => navigate('/orders')}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            View Orders
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
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Payment Details</h1>
              <p className="text-gray-600">Review order details before making payment</p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-sm text-gray-500">Order ID</div>
            <div className="font-medium text-gray-900">{order.order_id}</div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          {error}
        </div>
      )}

      {/* Payment Status */}
      {isPaid && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
          <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-green-900 mb-2">Payment Already Completed</h3>
          <p className="text-green-700 mb-4">
            This order has already been paid for and is being processed.
          </p>
          <button
            onClick={() => navigate(`/orders/${order.order_id}`)}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            View Order Details
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Product Information */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="h-5 w-5 text-blue-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Product Details</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {order.product_title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {order.description}
                </p>
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium text-gray-900">Amount</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {formatAmount(order.amount)}
                  </span>
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
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium">
                    {order.receiver?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{order.receiver?.name}</h4>
                  <p className="text-sm text-gray-600">{order.receiver?.email}</p>
                  <p className="text-sm text-gray-600">{order.receiver?.contact}</p>
                  {order.receiver?.rating && (
                    <div className="flex items-center mt-1">
                      <div className="flex space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(order.receiver!.rating)
                                ? 'text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          >
                            ★
                          </div>
                        ))}
                      </div>
                      <span className="ml-2 text-sm text-gray-600">
                        {order.receiver.rating.toFixed(1)} ({order.receiver.total_ratings} reviews)
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Section */}
        <div className="space-y-6">
          {/* Security Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-3">
              <Shield className="h-6 w-6 text-blue-600" />
              <h3 className="font-semibold text-blue-900">Secure Escrow Payment</h3>
            </div>
            <p className="text-sm text-blue-800">
              Your payment is protected by our escrow system. The seller will only receive funds after you confirm delivery.
            </p>
          </div>

          {/* Payment Summary */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-green-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Payment Summary</h2>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">{formatAmount(order.amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Escrow Fee:</span>
                <span className="font-medium text-green-600">Free</span>
              </div>
              <div className="pt-3 border-t border-gray-200">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total:</span>
                  <span className="text-blue-600">{formatAmount(order.amount)}</span>
                </div>
              </div>
            </div>

            {canPay && !isReceiver && (
              <button
                onClick={processPayment}
                disabled={processing}
                className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {processing ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Processing Payment...
                  </div>
                ) : (
                  `Pay ${formatAmount(order.amount)}`
                )}
              </button>
            )}

            {isReceiver && (
              <div className="text-center py-4">
                <AlertCircle className="h-8 w-8 text-amber-500 mx-auto mb-2" />
                <p className="text-gray-600 text-sm">You cannot pay for your own order</p>
              </div>
            )}

            {!canPay && !isPaid && (
              <div className="text-center py-4">
                <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600 text-sm">Payment not available for this order status</p>
              </div>
            )}
          </div>

          {/* Order Timeline */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Order Timeline</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-sm">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div>
                  <span className="text-gray-600">Created on </span>
                  <span className="font-medium text-gray-900">
                    {new Date(order.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 text-sm">
                <div className={`w-2 h-2 rounded-full ${isPaid ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <div>
                  <span className="text-gray-600">Payment </span>
                  <span className={`font-medium ${isPaid ? 'text-green-600' : 'text-gray-500'}`}>
                    {isPaid ? 'Completed' : 'Pending'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InitiatePayment;