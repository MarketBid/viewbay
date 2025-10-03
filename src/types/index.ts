export interface User {
  id: number;
  name: string;
  email: string;
  contact: string;
  rating: number;
  total_ratings: number;
  date_of_birth?: string;
  location?: string;
  is_business: boolean;
  social_media_links?: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
    whatsapp?: string;
  };
  business_category?: string;
  profile_image?: string;
  created_at: string;
  updated_at: string;
}

export enum OrderStatus {
  PENDING = "pending",
  PAID = "paid",
  IN_TRANSIT = "intransit", 
  DELIVERED = "delivered",
  COMPLETED = "completed",
  DISPUTED = "disputed",
  CANCELLED = "cancelled"
}

export interface Order {
  id: number;
  order_id: string;
  product_title: string;
  description: string;
  amount: number;
  sender_id: number;
  receiver_id?: number;
  sender?: User; 
  receiver?: User;
  status: OrderStatus;
  payment_code: string;
  payment_link?: string;
  created_at: string;
  updated_at: string;
}

export enum AccountType {
  MOMO = "momo",
  BANK = "bank"
}

export interface Account {
  id: number;
  user_id: number;
  type: AccountType;
  name: string;
  number: string;
  service_provider: string;
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: string;
}

export interface AuthTokens {
  access_token: string;
  token_type: string;
  refresh_token?: string;
}

export interface LoginData {
  username: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  contact: string;
  is_business: boolean;
  business_category?: string;
  social_media_links?: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
    whatsapp?: string;
  };
}

export const BUSINESS_CATEGORIES = [
  'Fashion & Clothing',
  'Electronics & Gadgets',
  'Food & Beverages',
  'Beauty & Cosmetics',
  'Home & Garden',
  'Sports & Fitness',
  'Books & Media',
  'Handmade & Crafts',
  'Automotive',
  'Services',
  'Other'
];