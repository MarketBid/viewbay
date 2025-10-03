import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Star, MapPin, ExternalLink, Instagram, Facebook, MessageCircle } from 'lucide-react';
import { User, BUSINESS_CATEGORIES } from '../types';
import { apiClient } from '../utils/api';
import StarRating from '../components/StarRating';

const Marketplace: React.FC = () => {
  const [sellers, setSellers] = useState<User[]>([]);
  const [filteredSellers, setFilteredSellers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchSellers();
  }, []);

  useEffect(() => {
    filterSellers();
  }, [sellers, searchTerm, selectedCategory]);

  const fetchSellers = async () => {
    try {
      // This would be an endpoint to get all business users
      const response = await apiClient.get<User[]>('/auth/business-users');
      setSellers(response.data);
    } catch (error) {
      console.error('Failed to fetch sellers:', error);
      // Mock data for demo
      const mockSellers: User[] = [
        {
          id: 1,
          name: "Fashion Forward",
          email: "fashion@example.com",
          contact: "+233541234567",
          rating: 4.8,
          total_ratings: 124,
          location: "Accra, Ghana",
          is_business: true,
          business_category: "Fashion & Clothing",
          social_media_links: {
            instagram: "https://instagram.com/fashionforward",
            facebook: "https://facebook.com/fashionforward",
            whatsapp: "+233541234567"
          },
          profile_image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop",
          created_at: "2024-01-15T08:00:00Z",
          updated_at: "2024-01-15T08:00:00Z"
        },
        {
          id: 2,
          name: "TechHub Ghana",
          email: "tech@example.com",
          contact: "+233559876543",
          rating: 4.6,
          total_ratings: 89,
          location: "Kumasi, Ghana",
          is_business: true,
          business_category: "Electronics & Gadgets",
          social_media_links: {
            instagram: "https://instagram.com/techhubgh",
            whatsapp: "+233559876543"
          },
          profile_image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop",
          created_at: "2024-01-10T10:00:00Z",
          updated_at: "2024-01-10T10:00:00Z"
        },
        {
          id: 3,
          name: "Mama's Kitchen",
          email: "mama@example.com",
          contact: "+233501122334",
          rating: 4.9,
          total_ratings: 156,
          location: "Takoradi, Ghana",
          is_business: true,
          business_category: "Food & Beverages",
          social_media_links: {
            facebook: "https://facebook.com/mamaskitchen",
            whatsapp: "+233501122334"
          },
          profile_image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop",
          created_at: "2024-01-12T12:00:00Z",
          updated_at: "2024-01-12T12:00:00Z"
        },
        {
          id: 4,
          name: "Beauty Bliss",
          email: "beauty@example.com",
          contact: "+233245667788",
          rating: 4.7,
          total_ratings: 203,
          location: "Accra, Ghana",
          is_business: true,
          business_category: "Beauty & Cosmetics",
          social_media_links: {
            instagram: "https://instagram.com/beautybliss",
            facebook: "https://facebook.com/beautybliss",
            whatsapp: "+233245667788"
          },
          profile_image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&h=400&fit=crop",
          created_at: "2024-01-08T14:00:00Z",
          updated_at: "2024-01-08T14:00:00Z"
        }
      ];
      setSellers(mockSellers);
    } finally {
      setLoading(false);
    }
  };

  const filterSellers = () => {
    let filtered = sellers;

    if (searchTerm) {
      filtered = filtered.filter(seller =>
        seller.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        seller.business_category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        seller.location?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(seller => seller.business_category === selectedCategory);
    }

    setFilteredSellers(filtered);
  };

  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case 'instagram':
        return <Instagram className="h-4 w-4" />;
      case 'facebook':
        return <Facebook className="h-4 w-4" />;
      case 'whatsapp':
        return <MessageCircle className="h-4 w-4" />;
      default:
        return <ExternalLink className="h-4 w-4" />;
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
            <h1 className="text-2xl font-bold text-gray-900">Marketplace</h1>
            <p className="text-gray-600">Discover trusted sellers and their products</p>
          </div>
          
          <Link
            to="/orders/create"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Order
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search sellers, categories, or locations..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Filter className="h-5 w-5 mr-2" />
            Filters
          </button>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Categories</option>
                  {BUSINESS_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sellers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSellers.map((seller) => (
          <div
            key={seller.id}
            className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
          >
            {/* Profile Image */}
            <div className="h-48 bg-gray-200 relative overflow-hidden">
              {seller.profile_image ? (
                <img
                  src={seller.profile_image}
                  alt={seller.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                  <span className="text-4xl font-bold text-white">
                    {seller.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900">{seller.name}</h3>
                <StarRating 
                  rating={seller.rating} 
                  readonly 
                  size="sm"
                  showCount
                  count={seller.total_ratings}
                />
              </div>

              <div className="space-y-2 mb-4">
                {seller.business_category && (
                  <p className="text-sm text-blue-600 font-medium">
                    {seller.business_category}
                  </p>
                )}
                
                {seller.location && (
                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span className="text-sm">{seller.location}</span>
                  </div>
                )}
              </div>

              {/* Social Media Links */}
              {seller.social_media_links && (
                <div className="flex items-center space-x-3 mb-4">
                  {Object.entries(seller.social_media_links).map(([platform, link]) => {
                    if (!link) return null;
                    
                    const isWhatsApp = platform === 'whatsapp';
                    const href = isWhatsApp ? `https://wa.me/${link.replace(/[^0-9]/g, '')}` : link;
                    
                    return (
                      <a
                        key={platform}
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors text-gray-600 hover:text-gray-800"
                        title={`Visit ${platform}`}
                      >
                        {getSocialIcon(platform)}
                      </a>
                    );
                  })}
                </div>
              )}

              {/* Actions */}
              <div className="flex space-x-3">
                <Link
                  to={`/orders/create?sender=${seller.id}`}
                  className="flex-1 bg-blue-600 text-white text-center py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  Create Order
                </Link>
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700">
                  View Profile
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredSellers.length === 0 && (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Search className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No sellers found</h3>
            <p className="text-gray-600">
              Try adjusting your search terms or filters to find more sellers.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Marketplace;