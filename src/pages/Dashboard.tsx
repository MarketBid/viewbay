import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Package,
  Clock,
  DollarSign,
  Truck,
  CheckCircle,
  AlertCircle,
  XCircle,
  ArrowRight
} from 'lucide-react';
import { Order, OrderStatus } from '../types';
import { useAuth } from '../hooks/useAuth.tsx';
import { apiClient } from '../utils/api';

const statusMeta = [
  { status: OrderStatus.PENDING, label: 'Pending', icon: <Clock className="h-6 w-6 text-yellow-500" /> },
  { status: OrderStatus.PAID, label: 'Paid', icon: <DollarSign className="h-6 w-6 text-blue-500" /> },
  { status: OrderStatus.IN_TRANSIT, label: 'In Transit', icon: <Truck className="h-6 w-6 text-indigo-500" /> },
  { status: OrderStatus.DELIVERED, label: 'Delivered', icon: <Package className="h-6 w-6 text-green-500" /> },
  { status: OrderStatus.COMPLETED, label: 'Completed', icon: <CheckCircle className="h-6 w-6 text-green-700" /> },
  { status: OrderStatus.DISPUTED, label: 'Disputed', icon: <AlertCircle className="h-6 w-6 text-red-500" /> },
  { status: OrderStatus.CANCELLED, label: 'Cancelled', icon: <XCircle className="h-6 w-6 text-gray-400" /> },
];

const StatCard: React.FC<{ label: string; value: number; icon: React.ReactNode }> = ({ label, value, icon }) => (
  <div className="rounded-2xl p-6 flex flex-col bg-white shadow-sm min-w-[160px] items-center">
    <div className="mb-2">{icon}</div>
    <span className="text-2xl font-bold text-gray-900">{value}</span>
    <span className="text-sm font-medium text-gray-500 mt-1">{label}</span>
  </div>
);

const Dashboard: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await apiClient.get<Order[]>('/orders/');
      setOrders(response.data);
    } catch (error) {
      // fallback mock data
      setOrders([
        { id: 1, order_id: "ORD-001", product_title: "iPhone 14 Pro", description: "Brand new iPhone 14 Pro 256GB", amount: 3500, sender_id: 1, receiver_id: 2, status: OrderStatus.PENDING, payment_code: "ABC12345", created_at: "2024-01-20T10:30:00Z", updated_at: "2024-01-20T10:30:00Z" },
        { id: 2, order_id: "ORD-002", product_title: "MacBook Air M2", description: "Barely used MacBook Air with M2 chip", amount: 4200, sender_id: 1, status: OrderStatus.PAID, payment_code: "DEF67890", created_at: "2024-01-19T14:15:00Z", updated_at: "2024-01-20T09:00:00Z" },
        { id: 3, order_id: "ORD-003", product_title: "Designer Handbag", description: "Authentic Louis Vuitton handbag", amount: 1800, sender_id: 1, receiver_id: 3, status: OrderStatus.COMPLETED, payment_code: "GHI11223", created_at: "2024-01-18T16:45:00Z", updated_at: "2024-01-19T11:30:00Z" },
        { id: 4, order_id: "ORD-004", product_title: "Gaming Setup", description: "Complete gaming setup", amount: 7500, sender_id: 1, status: OrderStatus.IN_TRANSIT, payment_code: "JKL44556", created_at: "2024-01-17T12:20:00Z", updated_at: "2024-01-18T08:15:00Z" },
        { id: 5, order_id: "ORD-005", product_title: "Book", description: "A book", amount: 100, sender_id: 1, status: OrderStatus.DELIVERED, payment_code: "MNO77889", created_at: "2024-01-16T10:00:00Z", updated_at: "2024-01-16T10:00:00Z" },
        { id: 6, order_id: "ORD-006", product_title: "Shoes", description: "Running shoes", amount: 250, sender_id: 1, status: OrderStatus.DISPUTED, payment_code: "PQR11223", created_at: "2024-01-15T09:00:00Z", updated_at: "2024-01-15T09:00:00Z" },
        { id: 7, order_id: "ORD-007", product_title: "Bag", description: "Travel bag", amount: 400, sender_id: 1, status: OrderStatus.CANCELLED, payment_code: "STU33445", created_at: "2024-01-14T08:00:00Z", updated_at: "2024-01-14T08:00:00Z" }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusCount = (status: OrderStatus) =>
    orders.filter(order => order.status === status).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          Hello {user?.name} <span className="text-2xl">👋</span>
        </h1>
      </div>
      {/* Order Status Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-6">
        {statusMeta.map(meta => (
          <StatCard key={meta.status} label={meta.label} value={getStatusCount(meta.status)} icon={meta.icon} />
        ))}
      </div>
      {/* Recent Orders/Transactions */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
          <Link
            to="/orders"
            className="flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            View All <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {orders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Product</th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Amount</th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Date</th>
                  <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                    <span className="sr-only">View</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {orders.slice(0, 5).map((order) => (
                  <tr key={order.order_id} className="hover:bg-gray-50 transition-colors">
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 bg-gray-100 rounded-md flex items-center justify-center">
                          <Package className="h-4 w-4 text-blue-500" />
                        </div>
                        <div className="ml-4">
                          <div className="font-medium text-gray-900">{order.product_title}</div>
                          <div className="text-gray-500">{order.order_id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        order.status === OrderStatus.PENDING ? 'bg-yellow-100 text-yellow-800' :
                        order.status === OrderStatus.PAID ? 'bg-blue-100 text-blue-800' :
                        order.status === OrderStatus.COMPLETED ? 'bg-green-100 text-green-800' :
                        order.status === OrderStatus.DISPUTED ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900">₵{order.amount.toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      <button
                        onClick={() => navigate(`/orders/${order.order_id}`, { state: { order } })}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        View<span className="sr-only">, {order.product_title}</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16 px-6">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-semibold text-gray-900">No orders yet</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating your first order.</p>
            <div className="mt-6">
              <Link
                to="/orders/create"
                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg shadow-sm hover:bg-blue-700 transition-colors"
              >
                Create Order
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;