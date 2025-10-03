import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, 
  Package, 
  User, 
  DollarSign, 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Copy,
  ExternalLink,
  Edit
} from 'lucide-react';
import { Order, OrderStatus } from '../types';
import { useAuth } from '../hooks/useAuth.tsx';
import { apiClient } from '../utils/api';
import OrderStatusTracker from '../components/OrderStatusTracker';

const OrderDetails: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [showWaitModal, setShowWaitModal] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.order) {
      setOrder(location.state.order);
      setLoading(false);
    } else if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId, location.state]);

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

  const updateOrderStatus = async (newStatus: OrderStatus) => {
    if (!order) return;
    
    setUpdating(true);
    try {
      await apiClient.patch(`/orders/${order.order_id}/status`, { status: newStatus });
      setOrder({ ...order, status: newStatus });
    } catch (error) {
      setError('Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  const cancelOrder = async () => {
    if (!order) return;
    setUpdating(true);
    setError('');
    try {
      await apiClient.put(`/orders/cancel/${order.order_id}`);
      setOrder({ ...order, status: OrderStatus.CANCELLED });
    } catch (error) {
      setError('Failed to cancel order');
    } finally {
      setUpdating(false);
    }
  };

  const restoreOrder = async () => {
    if (!order) return;
    setUpdating(true);
    setError('');
    try {
      await apiClient.put(`/orders/restore/${order.order_id}`);
      setOrder({ ...order, status: OrderStatus.PENDING });
    } catch (error) {
      setError('Failed to restore order');
    } finally {
      setUpdating(false);
    }
  };

  const inTransitOrder = async () => {
    if (!order) return;
    setUpdating(true);
    setError('');
    try {
      await apiClient.put(`/orders/in-transit/${order.order_id}`);
      setOrder({ ...order, status: OrderStatus.IN_TRANSIT });
    } catch (error) {
      setError('Failed to mark as in transit');
    } finally {
      setUpdating(false);
    }
  };

  const receivedOrder = async () => {
    if (!order) return;
    if (order.status === OrderStatus.IN_TRANSIT || order.status === 'in_transit') {
      setShowWaitModal(true);
      return;
    }
    setUpdating(true);
    setError('');
    try {
      await apiClient.put(`/orders/receive/${order.order_id}`);
      setOrder({ ...order, status: OrderStatus.COMPLETED });
    } catch (error) {
      setError('Failed to mark as received');
    } finally {
      setUpdating(false);
    }
  };

  const deliveredOrder = async () => {
    if (!order) return;
    setUpdating(true);
    setError('');
    try {
      await apiClient.put(`/orders/deliver/${order.order_id}`);
      setOrder({ ...order, status: OrderStatus.DELIVERED });
    } catch (error) {
      setError('Failed to mark as delivered');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case OrderStatus.PAID:
        return <DollarSign className="h-5 w-5 text-green-500" />;
      case OrderStatus.COMPLETED:
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case OrderStatus.DISPUTED:
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Package className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800';
      case OrderStatus.PAID:
        return 'bg-blue-100 text-blue-800';
      case OrderStatus.COMPLETED:
        return 'bg-green-100 text-green-800';
      case OrderStatus.DISPUTED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getAvailableActions = () => {
    if (!order || !user) return [];
    const isSender = String(order.sender_id) === String(user.id);
    const isReceiver = String(order.receiver_id) === String(user.id);
    const actions = [];
    if ((order.status === OrderStatus.PENDING || order.status === 'pending') && (isSender || isReceiver)) {
      actions.push({
        label: 'Decline',
        onClick: cancelOrder,
        color: 'bg-red-600 hover:bg-red-700',
      });
    }
    if ((order.status === OrderStatus.CANCELLED || order.status === 'cancelled') && isReceiver) {
      actions.push({
        label: 'Restore Order',
        onClick: restoreOrder,
        color: 'bg-blue-600 hover:bg-blue-700',
      });
    }
    if ((order.status === OrderStatus.PAID || order.status === 'paid') && isReceiver) {
      actions.push({
        label: 'Mark as In Transit',
        onClick: inTransitOrder,
        color: 'bg-blue-600 hover:bg-blue-700',
      });
    }
    if ((order.status === OrderStatus.IN_TRANSIT || order.status === 'in_transit')) {
      if (isReceiver) {
        actions.push({
          label: 'Delivered',
          onClick: deliveredOrder,
          color: 'bg-green-600 hover:bg-green-700',
        });
        actions.push({
          label: 'Disputed',
          onClick: () => updateOrderStatus(OrderStatus.DISPUTED),
          color: 'bg-red-600 hover:bg-red-700',
        });
      }
      if (isSender) {
        actions.push({
          label: 'Received',
          onClick: receivedOrder,
          color: 'bg-green-600 hover:bg-green-700',
        });
        actions.push({
          label: 'Disputed',
          onClick: () => updateOrderStatus(OrderStatus.DISPUTED),
          color: 'bg-red-600 hover:bg-red-700',
        });
      }
    }
    if ((order.status === OrderStatus.DELIVERED || order.status === 'delivered')) {
      if (isReceiver) {
        actions.push({
          label: 'Disputed',
          onClick: () => updateOrderStatus(OrderStatus.DISPUTED),
          color: 'bg-red-600 hover:bg-red-700',
        });
      }
      if (isSender) {
        actions.push({
          label: 'Received',
          onClick: receivedOrder,
          color: 'bg-green-600 hover:bg-green-700',
        });
        actions.push({
          label: 'Disputed',
          onClick: () => updateOrderStatus(OrderStatus.DISPUTED),
          color: 'bg-red-600 hover:bg-red-700',
        });
      }
    }
    return actions;
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy text: ', err);
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
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Order not found</h3>
          <p className="text-gray-600 mb-4">The order you're looking for doesn't exist.</p>
          <Link
            to="/orders"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  const isSender = order.sender_id === user?.id;
  const canEdit = isSender && order.status === OrderStatus.PENDING;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Order Status Tracker */}
      <OrderStatusTracker order={order} />

      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Order Details</h1>
            <p className="text-gray-600">Order ID: {order.order_id}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}> 
            {getStatusIcon(order.status)}
            <span className="ml-2">{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span>
          </div>
          {canEdit && (
            <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </button>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Order Information */}
        <div className="space-y-8">
          {/* Product Details */}
          <div className="bg-white rounded-2xl shadow-sm p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="h-5 w-5 text-blue-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Product Information</h2>
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
                  <span className="text-lg font-medium text-gray-900">Total Amount</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {formatAmount(order.amount)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="bg-white rounded-2xl shadow-sm p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Payment Information</h2>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Payment Code:</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">{order.payment_code}</span>
                  <button
                    onClick={() => copyToClipboard(order.payment_code)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <Copy className="h-4 w-4 text-gray-400" />
                  </button>
                </div>
              </div>
              {order.payment_link && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Payment Link:</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => navigate(`/payment/initiate-payment/${order.order_id}`)}
                      className="text-blue-600 hover:text-blue-700 underline"
                    >
                      Go to Payment
                    </button>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(order.payment_link!)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <Copy className="h-4 w-4 text-gray-400" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* User Information & Actions */}
        <div className="space-y-8">
          {/* Participants */}
          <div className="bg-white rounded-2xl shadow-sm p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <User className="h-5 w-5 text-purple-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Participants</h2>
            </div>
            <div className="space-y-4">
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-500">Sender</span>
                  {user?.id === order.sender_id && (
                    <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded-full">
                      You
                    </span>
                  )}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{order.sender?.name || '-'}</h4>
                  <p className="text-sm text-gray-600">{order.sender?.email || '-'}</p>
                  <p className="text-sm text-gray-600">{order.sender?.contact || '-'}</p>
                </div>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-500">Receiver</span>
                  {user?.id === order.receiver_id && (
                    <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded-full">
                      You
                    </span>
                  )}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{order.receiver?.name || '-'}</h4>
                  <p className="text-sm text-gray-600">{order.receiver?.email || '-'}</p>
                  <p className="text-sm text-gray-600">{order.receiver?.contact || '-'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-2xl shadow-sm p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <Calendar className="h-5 w-5 text-gray-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Timeline</h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-sm">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div>
                  <span className="text-gray-600">Created on </span>
                  <span className="font-medium text-gray-900">
                    {new Date(order.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                <div>
                  <span className="text-gray-600">Last updated on </span>
                  <span className="font-medium text-gray-900">
                    {new Date(order.updated_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          {getAvailableActions().length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm p-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Available Actions</h2>
              <div className="space-y-2">
                {getAvailableActions().map((action, index) => (
                  <button
                    key={index}
                    onClick={action.onClick}
                    disabled={updating}
                    className={`w-full py-2 px-4 rounded-lg text-white font-medium transition-colors ${action.color} disabled:opacity-50`}
                  >
                    {updating ? 'Updating...' : action.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal for sender trying to mark as received while in transit */}
      {showWaitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-2">Please wait</h3>
            <p className="mb-4">Wait for the receiver to acknowledge the order is delivered before marking as received.</p>
            <button
              onClick={() => setShowWaitModal(false)}
              className="w-full py-2 px-4 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetails;