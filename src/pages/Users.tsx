import React, { useState, useEffect } from 'react';
import { Search, Star, MessageCircle, Package } from 'lucide-react';
import { User } from '../types';
import { useAuth } from '../hooks/useAuth.tsx';
import { apiClient } from '../utils/api';
import StarRating from '../components/StarRating';

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showRatingModal, setShowRatingModal] = useState<User | null>(null);
  const [ratingValue, setRatingValue] = useState(5);
  const [submittingRating, setSubmittingRating] = useState(false);
  const { user: currentUser } = useAuth();

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm]);

  const fetchUsers = async () => {
    try {
      // This would be an endpoint to get all users
      const response = await apiClient.get<User[]>('/auth/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      // Mock data for demo
      const mockUsers: User[] = [
        {
          id: 2,
          name: "Fashion Forward",
          email: "fashion@example.com",
          contact: "+233541234567",
          rating: 4.8,
          total_ratings: 124,
          location: "Accra, Ghana",
          is_business: true,
          business_category: "Fashion & Clothing",
          created_at: "2024-01-15T08:00:00Z",
          updated_at: "2024-01-15T08:00:00Z"
        },
        {
          id: 3,
          name: "John Mensah",
          email: "john@example.com",
          contact: "+233559876543",
          rating: 4.2,
          total_ratings: 67,
          location: "Kumasi, Ghana",
          is_business: false,
          created_at: "2024-01-10T10:00:00Z",
          updated_at: "2024-01-10T10:00:00Z"
        },
        {
          id: 4,
          name: "Beauty Bliss",
          email: "beauty@example.com",
          contact: "+233501122334",
          rating: 4.7,
          total_ratings: 203,
          location: "Takoradi, Ghana",
          is_business: true,
          business_category: "Beauty & Cosmetics",
          created_at: "2024-01-12T12:00:00Z",
          updated_at: "2024-01-12T12:00:00Z"
        },
        {
          id: 5,
          name: "Tech Solutions",
          email: "tech@example.com",
          contact: "+233245667788",
          rating: 4.6,
          total_ratings: 89,
          location: "Accra, Ghana",
          is_business: true,
          business_category: "Electronics & Gadgets",
          created_at: "2024-01-08T14:00:00Z",
          updated_at: "2024-01-08T14:00:00Z"
        }
      ];
      setUsers(mockUsers);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users.filter(user => user.id !== currentUser?.id);

    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.business_category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.location?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredUsers(filtered);
  };

  const handleRateUser = async (userId: number, rating: number) => {
    setSubmittingRating(true);
    try {
      await apiClient.post(`/auth/rate-user/${userId}`, { rating });
      
      // Update the user's rating in local state
      setUsers(users.map(user => 
        user.id === userId 
          ? { 
              ...user, 
              rating: ((user.rating * user.total_ratings) + rating) / (user.total_ratings + 1),
              total_ratings: user.total_ratings + 1
            }
          : user
      ));
      
      setShowRatingModal(null);
      setRatingValue(5);
    } catch (error) {
      console.error('Failed to rate user:', error);
    } finally {
      setSubmittingRating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Users Directory</h1>
            <p className="text-gray-600">Connect with other users and rate your experiences</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search users by name, email, category, or location..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map((user) => (
          <div
            key={user.id}
            className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 p-6"
          >
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl font-bold text-white">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{user.name}</h3>
              
              {user.is_business && user.business_category && (
                <p className="text-sm text-blue-600 font-medium mb-2">
                  {user.business_category}
                </p>
              )}
              
              <div className="flex items-center justify-center mb-2">
                <StarRating 
                  rating={user.rating} 
                  readonly 
                  size="sm" 
                  showCount 
                  count={user.total_ratings} 
                />
              </div>
              
              {user.location && (
                <p className="text-sm text-gray-600">{user.location}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-600">
                <MessageCircle className="h-4 w-4 mr-2" />
                <span>{user.contact}</span>
              </div>
              
              <div className="flex items-center text-sm text-gray-600">
                <Package className="h-4 w-4 mr-2" />
                <span>{user.is_business ? 'Business Account' : 'Personal Account'}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowRatingModal(user)}
                  className="flex-1 bg-blue-600 text-white text-sm py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Star className="h-4 w-4 inline mr-1" />
                  Rate User
                </button>
                <a
                  href={`https://wa.me/${user.contact.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 border border-gray-300 text-gray-700 text-sm py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors text-center"
                >
                  <MessageCircle className="h-4 w-4 inline mr-1" />
                  Contact
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Search className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
            <p className="text-gray-600">
              Try adjusting your search terms to find more users.
            </p>
          </div>
        </div>
      )}

      {/* Rating Modal */}
      {showRatingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl font-bold text-white">
                  {showRatingModal.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Rate {showRatingModal.name}
              </h3>
              <p className="text-gray-600">
                Share your experience with this user
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
                Your Rating
              </label>
              <div className="flex justify-center">
                <StarRating
                  rating={ratingValue}
                  onRatingChange={setRatingValue}
                  size="lg"
                />
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowRatingModal(null);
                  setRatingValue(5);
                }}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRateUser(showRatingModal.id, ratingValue)}
                disabled={submittingRating}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {submittingRating ? 'Submitting...' : 'Submit Rating'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;