export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
}

export interface Store {
  id: string;
  name: string;
  description: string;
  logo?: string;
  phone: string;
  email: string;
  location: string;
  verified: boolean;
  rating: number;
  totalSales: number;
  totalRevenue: number;
  joinedDate: string;
  businessHours: string;
  deliveryRadius: string;
  whatsappLinked: boolean;
}

export type ProductStatus = 'active' | 'draft' | 'out_of_stock';

export interface ProductVariant {
  name: string;
  options: string[];
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  currency: string;
  images: string[];
  category: string;
  stock: number;
  sku: string;
  variants: ProductVariant[];
  status: ProductStatus;
  shopLink: string;
  views: number;
  orders: number;
  createdAt: string;
  colorHex?: string; // placeholder color for image
}

export type OrderStatus =
  | 'pending'
  | 'accepted'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export interface OrderItem {
  productId: string;
  productTitle: string;
  productImage: string;
  quantity: number;
  price: number;
  variant?: string;
  colorHex?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customer: {
    name: string;
    phone: string;
    address: string;
  };
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  currency: string;
  status: OrderStatus;
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid' | 'refunded';
  createdAt: string;
  updatedAt: string;
  notes?: string;
  trackingNumber?: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface DashboardStats {
  todayRevenue: number;
  weekRevenue: number[];
  todayOrders: number;
  totalProducts: number;
  activeLinks: number;
  aiConversations: number;
  linkClicks: number;
  conversionRate: number;
  currency: string;
}

export interface Notification {
  id: string;
  type: 'order' | 'payment' | 'stock' | 'message' | 'review';
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
}
