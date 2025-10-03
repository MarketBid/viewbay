import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Package, DollarSign, User, FileText, ArrowLeft } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.tsx';
import { apiClient } from '../utils/api';
import { User as UserType } from '../types';

interface CreateOrderForm {
  product_title: string;
  description: string;
  amount: number;
  sender_id?: number;
}

const CreateOrder: React.FC = () => {
  const [formData, setFormData] = useState<CreateOrderForm>({
    product_title: '',
    description: '',
    amount: 0,
    sender_id: undefined
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [users, setUsers] = useState<UserType[]>([]);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orderIdInput, setOrderIdInput] = useState('');
  const [manualSenderId, setManualSenderId] = useState('');
  const [manualReceiverId, setManualReceiverId] = useState('');
  const [role, setRole] = useState<'sender' | 'receiver'>('receiver');

  useEffect(() => {
    fetchUsers();
    
    // Check if sender ID is provided in URL
    const senderId = searchParams.get('sender');
    if (senderId) {
      setFormData(prev => ({ ...prev, sender_id: parseInt(senderId) }));
    }
  }, [searchParams]);

  const fetchUsers = async () => {
    try {
      // This would fetch all users for selection
      const response = await apiClient.get<UserType[]>('/auth/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      // Mock users for demo
      const mockUsers: UserType[] = [
        {
          id: 2,
          name: "Fashion Forward",
          email: "fashion@example.com",
          contact: "+233541234567",
          rating: 4.8,
          total_ratings: 124,
          is_business: true,
          created_at: "2024-01-15T08:00:00Z",
          updated_at: "2024-01-15T08:00:00Z"
        },
        {
          id: 3,
          name: "TechHub Ghana",
          email: "tech@example.com",
          contact: "+233559876543",
          rating: 4.6,
          total_ratings: 89,
          is_business: true,
          created_at: "2024-01-10T10:00:00Z",
          updated_at: "2024-01-10T10:00:00Z"
        }
      ];
      setUsers(mockUsers);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.amount <= 0) {
      setError('Amount must be greater than 0');
      setLoading(false);
      return;
    }

    try {
      const orderData = {
        ...formData,
        sender_id: role === 'sender' ? user?.id : (manualSenderId ? parseInt(manualSenderId) : undefined),
        receiver_id: role === 'receiver' ? user?.id : (manualReceiverId ? parseInt(manualReceiverId) : undefined)
      };
      const response = await apiClient.post('/orders/create', orderData);
      navigate(`/orders/${response.data.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create New Order</h1>
            <p className="text-gray-600">Set up a secure escrow payment for your transaction</p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Product Information */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package className="h-5 w-5 text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Product Information</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="product_title" className="block text-sm font-medium text-gray-700 mb-2">
                Product Title *
              </label>
              <input
                type="text"
                id="product_title"
                name="product_title"
                required
                value={formData.product_title}
                onChange={handleInputChange}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter the product or service title"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                required
                rows={4}
                value={formData.description}
                onChange={handleInputChange}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Provide detailed description of the product or service"
              />
            </div>
          </div>
        </div>

        {/* Payment Information */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Payment Information</h2>
          </div>

          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
              Amount (₵) *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">₵</span>
              </div>
              <input
                type="number"
                id="amount"
                name="amount"
                required
                min="0"
                step="0.01"
                value={formData.amount || ''}
                onChange={handleInputChange}
                className="w-full pl-8 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
              />
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Enter the total amount to be paid by the buyer
            </p>
          </div>
        </div>

        {/* Role Selection */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <User className="h-5 w-5 text-purple-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Your Role</h2>
          </div>

          <div className="space-y-4">
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => setRole('sender')}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                  role === 'sender'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                I am the Sender
              </button>
              <button
                type="button"
                onClick={() => setRole('receiver')}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                  role === 'receiver'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                I am the Receiver
              </button>
            </div>
          </div>
        </div>

        {/* Party Information */}
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <User className="h-5 w-5 text-purple-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              {role === 'sender' ? 'Receiver' : 'Sender'} Information
            </h2>
          </div>

          <div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-center">
                <User className="h-5 w-5 text-blue-600 mr-2" />
                <div>
                  <p className="text-sm font-medium text-blue-900">You are the {role}</p>
                  <p className="text-sm text-blue-700">{user?.name} ({user?.email})</p>
                </div>
              </div>
            </div>
            
            {role === 'receiver' && (
              <div>
                <label htmlFor="manual_sender_id" className="block text-sm font-medium text-gray-700 mb-2">
                  Enter Sender ID (Optional)
                </label>
                <input
                  type="text"
                  id="manual_sender_id"
                  name="manual_sender_id"
                  placeholder="Enter sender ID"
                  value={manualSenderId}
                  onChange={e => setManualSenderId(e.target.value)}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            )}

            {role === 'sender' && (
              <div>
                <label htmlFor="manual_receiver_id" className="block text-sm font-medium text-gray-700 mb-2">
                  Enter Receiver ID (Optional)
                </label>
                <input
                  type="text"
                  id="manual_receiver_id"
                  name="manual_receiver_id"
                  placeholder="Enter receiver ID"
                  value={manualReceiverId}
                  onChange={e => setManualReceiverId(e.target.value)}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            )}
            
            <p className="mt-1 text-sm text-gray-500">
              You can leave this empty if you don't know who the {role === 'sender' ? 'receiver' : 'sender'} will be yet
            </p>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <FileText className="h-5 w-5 text-gray-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Order Summary</h2>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Product:</span>
              <span className="font-medium text-gray-900">
                {formData.product_title || 'Not specified'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Amount:</span>
              <span className="font-medium text-gray-900">
                ₵{formData.amount.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Receiver:</span>
              <span className="font-medium text-gray-900">
                {user?.name} (You)
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Sender:</span>
              <span className="font-medium text-gray-900">
                {formData.sender_id 
                  ? users.find(u => u.id === formData.sender_id)?.name || 'Unknown'
                  : 'To be assigned'
                }
              </span>
            </div>
            <div className="pt-3 border-t border-gray-200">
              <div className="flex justify-between text-base font-semibold">
                <span className="text-gray-900">Total Amount:</span>
                <span className="text-gray-900">₵{formData.amount.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !formData.product_title || !formData.description || formData.amount <= 0}
            className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Creating...
              </div>
            ) : (
              'Create Order'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateOrder;