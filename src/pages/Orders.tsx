import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  Plus,
  Package,
  Eye,
  ChevronDown
} from 'lucide-react';
import { Order, OrderStatus } from '../types';
import { apiClient } from '../utils/api';

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('');
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, searchTerm, statusFilter]);

  const fetchOrders = async () => {
    try {
      const response = await apiClient.get<Order[]>('/orders/');
      setOrders(response.data);
    } catch (error) {
      // fallback mock data
      const mockOrders: Order[] = [
        { id: 1, order_id: "ORD-001", product_title: "iPhone 14 Pro", description: "Brand new iPhone 14 Pro 256GB Space Black", amount: 3500, sender_id: 1, receiver_id: 2, status: OrderStatus.PENDING, payment_code: "ABC12345", payment_link: "https://pay.clarsix.com/ABC12345", created_at: "2024-01-20T10:30:00Z", updated_at: "2024-01-20T10:30:00Z" },
        { id: 2, order_id: "ORD-002", product_title: "MacBook Air M2", description: "Barely used MacBook Air with M2 chip, 16GB RAM, 512GB SSD", amount: 4200, sender_id: 1, status: OrderStatus.PAID, payment_code: "DEF67890", created_at: "2024-01-19T14:15:00Z", updated_at: "2024-01-20T09:00:00Z" },
        { id: 3, order_id: "ORD-003", product_title: "Designer Handbag", description: "Authentic Louis Vuitton handbag in excellent condition", amount: 1800, sender_id: 1, receiver_id: 3, status: OrderStatus.COMPLETED, payment_code: "GHI11223", created_at: "2024-01-18T16:45:00Z", updated_at: "2024-01-19T11:30:00Z" },
        { id: 4, order_id: "ORD-004", product_title: "Gaming Setup", description: "Complete gaming setup with RTX 4080, 32GB RAM", amount: 7500, sender_id: 1, status: OrderStatus.DISPUTED, payment_code: "JKL44556", created_at: "2024-01-17T12:20:00Z", updated_at: "2024-01-18T08:15:00Z" }
      ];
      setOrders(mockOrders);
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = orders;
    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.product_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.order_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.payment_code.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (statusFilter) {
      filtered = filtered.filter(order => order.status === statusFilter);
    }
    setFilteredOrders(filtered);
  };

  const formatAmount = (amount: number) => {
    return `₵${amount.toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
          <p className="mt-1 text-gray-600">Manage and track all your orders.</p>
        </div>
        <Link
          to="/orders/create"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg shadow-sm hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Create Order
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by product, ID, or payment code..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="relative">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="w-full sm:w-auto inline-flex items-center justify-between px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter className="h-5 w-5 mr-2 text-gray-500" />
              <span className="font-medium">{statusFilter || 'All Statuses'}</span>
              <ChevronDown className="h-5 w-5 ml-2 text-gray-500" />
            </button>
            {showFilters && (
              <div className="absolute top-full right-0 mt-2 w-full sm:w-48 bg-white rounded-lg shadow-lg border z-10">
                <button onClick={() => { setStatusFilter(''); setShowFilters(false); }} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">All Statuses</button>
                {Object.values(OrderStatus).map((status) => (
                  <button key={status} onClick={() => { setStatusFilter(status); setShowFilters(false); }} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-6">
        {filteredOrders.map((order) => (
          <div
            key={order.order_id}
            className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200 p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6"
          >
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                    <Package className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{order.product_title}</h3>
                    <p className="text-gray-500 text-sm">{order.order_id}</p>
                  </div>
                </div>
                <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium mt-2 sm:mt-0 ${
                  order.status === OrderStatus.PENDING ? 'bg-yellow-100 text-yellow-800' :
                  order.status === OrderStatus.PAID ? 'bg-blue-100 text-blue-800' :
                  order.status === OrderStatus.COMPLETED ? 'bg-green-100 text-green-800' :
                  order.status === OrderStatus.DISPUTED ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {order.status}
                </span>
              </div>
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-4 text-sm">
                <div>
                  <div className="text-gray-500">Amount</div>
                  <div className="font-medium text-gray-900">{formatAmount(order.amount)}</div>
                </div>
                <div>
                  <div className="text-gray-500">Payment Code</div>
                  <div className="font-medium text-gray-900">{order.payment_code}</div>
                </div>
                <div>
                  <div className="text-gray-500">Created</div>
                  <div className="font-medium text-gray-900">{new Date(order.created_at).toLocaleDateString()}</div>
                </div>
                <div>
                  <div className="text-gray-500">Description</div>
                  <div className="font-medium text-gray-900 truncate">{order.description}</div>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-3 min-w-[160px]">
              {order.payment_link && (
                <button
                  type="button"
                  onClick={() => navigate(`/payment/initiate-payment/${order.order_id}`)}
                  className="px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  Go to Payment
                </button>
              )}
              <button
                onClick={() => navigate(`/orders/${order.order_id}`, { state: { order } })}
                className="inline-flex items-center justify-center gap-2 px-3 py-2 bg-white text-gray-700 text-sm font-medium rounded-lg border border-gray-300 shadow-sm hover:bg-gray-50 transition-colors"
              >
                <Eye className="h-4 w-4" />
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredOrders.length === 0 && !loading && (
        <div className="text-center py-16">
          <div className="max-w-md mx-auto">
            <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Package className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || statusFilter ? 'No orders found' : 'No orders yet'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || statusFilter
                ? 'Try adjusting your search terms or filters.'
                : 'Create your first order to get started.'
              }
            </p>
            <Link
              to="/orders/create"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg shadow-sm hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Create Order
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;