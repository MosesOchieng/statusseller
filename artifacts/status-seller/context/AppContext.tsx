import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User, Store, Product, Order, Message, Notification } from '@/types';
import { generateId } from '@/utils/formatters';
import { apiFetch, saveTokens, clearTokens } from '@/lib/api';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.1-8b-instant';

// ─── Type helpers for API responses ──────────────────────────────────────────
interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    fullName: string;
    email: string;
    phone: string | null;
    avatarUrl: string | null;
  };
  business: {
    id: string;
    name: string;
    description: string | null;
    logoUrl: string | null;
    phone: string | null;
    email: string | null;
    location: string | null;
    verified?: boolean;
    kybStatus: string;
    rating: string | null;
    totalSales: number;
    totalRevenue: string;
    joinedDate?: string;
    businessHours: string | null;
    deliveryRadius: string | null;
    whatsappLinked: boolean;
    createdAt: string;
  } | null;
}

function apiBusinessToStore(b: NonNullable<AuthResponse['business']>): Store {
  return {
    id: b.id,
    name: b.name,
    description: b.description ?? '',
    logo: b.logoUrl ?? undefined,
    phone: b.phone ?? '',
    email: b.email ?? '',
    location: b.location ?? 'Nairobi, Kenya',
    verified: b.kybStatus === 'approved',
    rating: parseFloat(b.rating ?? '0'),
    totalSales: b.totalSales,
    totalRevenue: parseFloat(b.totalRevenue),
    joinedDate: b.createdAt,
    businessHours: b.businessHours ?? 'Mon-Sat: 8AM - 8PM',
    deliveryRadius: b.deliveryRadius ?? '50km from Nairobi CBD',
    whatsappLinked: b.whatsappLinked,
  };
}

function apiProductToProduct(p: Record<string, unknown>): Product {
  return {
    id: p['id'] as string,
    title: p['title'] as string,
    description: (p['description'] as string) ?? '',
    price: parseFloat(p['price'] as string),
    originalPrice: p['originalPrice'] ? parseFloat(p['originalPrice'] as string) : undefined,
    currency: (p['currency'] as string) ?? 'KSh',
    images: (p['images'] as string[]) ?? [],
    category: (p['category'] as string) ?? '',
    stock: (p['stock'] as number) ?? 0,
    sku: (p['sku'] as string) ?? '',
    variants: (p['variants'] as Product['variants']) ?? [],
    status: (p['status'] as Product['status']) ?? 'draft',
    shopLink: (p['shopLink'] as string) ?? '',
    views: (p['views'] as number) ?? 0,
    orders: (p['orders'] as number) ?? 0,
    createdAt: p['createdAt'] as string,
    colorHex: p['colorHex'] as string | undefined,
  };
}

function apiOrderToOrder(o: Record<string, unknown>): Order {
  return {
    id: o['id'] as string,
    orderNumber: o['orderNumber'] as string,
    customer: {
      name: o['customerName'] as string,
      phone: (o['customerPhone'] as string) ?? '',
      address: (o['customerAddress'] as string) ?? '',
    },
    items: (o['items'] as Order['items']) ?? [],
    subtotal: parseFloat(o['subtotal'] as string),
    deliveryFee: parseFloat((o['deliveryFee'] as string) ?? '0'),
    total: parseFloat(o['total'] as string),
    currency: (o['currency'] as string) ?? 'KSh',
    status: o['status'] as Order['status'],
    paymentMethod: (o['paymentMethod'] as string) ?? 'M-Pesa',
    paymentStatus: o['paymentStatus'] as Order['paymentStatus'],
    createdAt: o['createdAt'] as string,
    updatedAt: o['updatedAt'] as string,
    notes: o['notes'] as string | undefined,
    trackingNumber: o['trackingNumber'] as string | undefined,
  };
}

export interface DashboardStats {
  todayRevenue: number;
  weekRevenue: number[];
  todayOrders: number;
  totalProducts: number;
  linkClicks: number;
  conversionRate: number;
  currency: string;
  totalSales: number;
  totalRevenue: number;
}

const DEFAULT_STATS: DashboardStats = {
  todayRevenue: 0,
  weekRevenue: [0, 0, 0, 0, 0, 0, 0],
  todayOrders: 0,
  totalProducts: 0,
  linkClicks: 0,
  conversionRate: 0,
  currency: 'KSh',
  totalSales: 0,
  totalRevenue: 0,
};

interface AppContextValue {
  // Auth
  isLoggedIn: boolean;
  user: User | null;
  store: Store | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, businessName?: string) => Promise<void>;
  logout: () => void;
  refreshData: () => Promise<void>;
  // Stats
  stats: DashboardStats;
  // Products
  products: Product[];
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'views' | 'orders' | 'shopLink'>) => Promise<void>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  // Orders
  orders: Order[];
  updateOrderStatus: (id: string, status: Order['status']) => Promise<void>;
  // Notifications
  notifications: Notification[];
  unreadCount: number;
  markAllRead: () => Promise<void>;
  // AI Chat
  messages: Message[];
  sendMessage: (content: string) => Promise<void>;
  clearChat: () => void;
  isAILoading: boolean;
  groqEnabled: boolean;
}

const AppContext = createContext<AppContextValue | null>(null);

function buildSystemPrompt(store: Store | null, products: Product[]): string {
  const productSummary = products
    .filter((p) => p.status !== 'draft')
    .map((p) => `- ${p.title}: KSh ${p.price.toLocaleString()}, ${p.stock} units in stock, ${p.status}`)
    .join('\n');
  return `You are the Business Assistant for ${store?.name ?? 'StatusSeller'}, a Kenyan online store. 

You help customers with product information, delivery, payments, returns, and order status.

Store details:
- Location: ${store?.location ?? 'Nairobi, Kenya'}
- Delivery: Same-day within Nairobi (KSh 200-500), 2-3 days upcountry
- Payment: M-Pesa, Visa, Mastercard, Cash on Delivery
- Returns: 7 days, original condition required

Current products:
${productSummary || 'No products currently listed.'}

Keep responses concise (2-4 sentences max), warm, and helpful. Use KSh for prices. If asked something you don't know, offer to connect the customer with the merchant.`;
}

function simulatedResponse(content: string, products: Product[], storeName: string): string {
  const lower = content.toLowerCase();
  if (lower.includes('size') || lower.includes('fit')) {
    return 'Sizes are listed per product. Please confirm your size before ordering!';
  }
  if (lower.includes('deliver') || lower.includes('ship')) {
    return 'Nairobi delivery: 1–2 days (KSh 200–300). Upcountry: 2–3 days (KSh 300–500). Same-day express in Nairobi for KSh 500.';
  }
  if (lower.includes('pay') || lower.includes('mpesa') || lower.includes('m-pesa')) {
    return 'We accept M-Pesa (instant!), Visa, Mastercard, and Cash on Delivery. M-Pesa is the easiest — just send to the number provided at checkout.';
  }
  if (lower.includes('stock') || lower.includes('available') || lower.includes('left')) {
    const summary = products.filter((p) => p.status !== 'draft').map((p) => `${p.title}: ${p.stock} units`).join(', ');
    return `Current stock: ${summary || 'Please check individual product pages.'}`;
  }
  if (lower.includes('return') || lower.includes('refund')) {
    return '7-day hassle-free returns on all items in original condition. Refunds processed within 3–5 business days to your original payment method.';
  }
  if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
    return `Hello! 👋 Welcome to ${storeName}. I can help with product info, delivery, payments, and more. What would you like to know?`;
  }
  return 'I can help with product details, delivery times, payment options, stock levels, and return policies. What would you like to know?';
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<DashboardStats>(DEFAULT_STATS);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isAILoading, setIsAILoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm0',
      role: 'assistant',
      content: "Hi! I'm your Business Assistant — always on, answering customer questions about your products, delivery, and more. Try me! 🚀",
      timestamp: new Date().toISOString(),
    },
  ]);

  const groqKey = process.env['EXPO_PUBLIC_GROQ_API_KEY'] ?? '';
  const groqEnabled = groqKey.length > 0;

  const productsRef = useRef(products);
  productsRef.current = products;
  const storeRef = useRef(store);
  storeRef.current = store;

  // ── Load live data ───────────────────────────────────────────────────────
  const loadBusinessData = async () => {
    try {
      const [prods, ords, notifs, dashStats] = await Promise.all([
        apiFetch<Record<string, unknown>[]>('/products'),
        apiFetch<Record<string, unknown>[]>('/orders'),
        apiFetch<Record<string, unknown>[]>('/notifications'),
        apiFetch<DashboardStats>('/stats').catch(() => DEFAULT_STATS),
      ]);
      setProducts(prods.map(apiProductToProduct));
      setOrders(ords.map(apiOrderToOrder));
      setNotifications(
        notifs.map((n) => ({
          id: n['id'] as string,
          type: n['type'] as Notification['type'],
          title: n['title'] as string,
          body: n['body'] as string,
          read: n['read'] as boolean,
          createdAt: n['createdAt'] as string,
        })),
      );
      setStats(dashStats);
    } catch {
      // Data load failed — keep empty state, don't crash
    }
  };

  const refreshData = async () => {
    await loadBusinessData();
  };

  // ── Restore session on mount ─────────────────────────────────────────────
  useEffect(() => {
    AsyncStorage.getItem('ss_user').then(async (val) => {
      if (!val) return;
      try {
        const { user: u, store: s } = JSON.parse(val) as { user: User; store: Store };
        setUser(u);
        setStore(s);
        setIsLoggedIn(true);
        await loadBusinessData();
      } catch { /* corrupted storage — ignore */ }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Auth ─────────────────────────────────────────────────────────────────
  const login = async (emailOrPhone: string, password: string) => {
    const data = await apiFetch<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ emailOrPhone, password }),
    });

    await saveTokens(data.accessToken, data.refreshToken);

    const appUser: User = {
      id: data.user.id,
      name: data.user.fullName,
      email: data.user.email,
      phone: data.user.phone ?? '',
      avatar: data.user.avatarUrl ?? undefined,
    };
    const appStore = data.business ? apiBusinessToStore(data.business) : null;

    setUser(appUser);
    setStore(appStore);
    setIsLoggedIn(true);

    await AsyncStorage.setItem('ss_user', JSON.stringify({ user: appUser, store: appStore }));
    await loadBusinessData();
  };

  const register = async (name: string, email: string, password: string, businessName?: string) => {
    const data = await apiFetch<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ fullName: name, email, password, businessName: businessName ?? name }),
    });

    await saveTokens(data.accessToken, data.refreshToken);

    const appUser: User = {
      id: data.user.id,
      name: data.user.fullName,
      email: data.user.email,
      phone: data.user.phone ?? '',
      avatar: data.user.avatarUrl ?? undefined,
    };
    const appStore = data.business ? apiBusinessToStore(data.business) : null;

    setUser(appUser);
    setStore(appStore);
    setIsLoggedIn(true);
    setProducts([]);
    setOrders([]);

    await AsyncStorage.setItem('ss_user', JSON.stringify({ user: appUser, store: appStore }));
  };

  const logout = async () => {
    try {
      await apiFetch('/auth/logout', { method: 'POST' });
    } catch { /* best effort */ }
    await clearTokens();
    await AsyncStorage.removeItem('ss_user');
    setIsLoggedIn(false);
    setUser(null);
    setStore(null);
    setProducts([]);
    setOrders([]);
    setNotifications([]);
  };

  // ── Products ─────────────────────────────────────────────────────────────
  const addProduct = async (product: Omit<Product, 'id' | 'createdAt' | 'views' | 'orders' | 'shopLink'>) => {
    const created = await apiFetch<Record<string, unknown>>('/products', {
      method: 'POST',
      body: JSON.stringify({
        ...product,
        images: (product.images as string[]).filter((i) => typeof i === 'string'),
      }),
    });
    setProducts((prev) => [apiProductToProduct(created), ...prev]);
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    const updated = await apiFetch<Record<string, unknown>>(`/products/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
    setProducts((prev) => prev.map((p) => (p.id === id ? apiProductToProduct(updated) : p)));
  };

  const deleteProduct = async (id: string) => {
    await apiFetch(`/products/${id}`, { method: 'DELETE' });
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  // ── Orders ───────────────────────────────────────────────────────────────
  const updateOrderStatus = async (id: string, status: Order['status']) => {
    const updated = await apiFetch<Record<string, unknown>>(`/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    setOrders((prev) => prev.map((o) => (o.id === id ? apiOrderToOrder(updated) : o)));
  };

  // ── Notifications ────────────────────────────────────────────────────────
  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = async () => {
    await apiFetch('/notifications/read-all', { method: 'PATCH' });
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  // ── AI Chat ──────────────────────────────────────────────────────────────
  const sendMessage = useCallback(
    async (content: string) => {
      const userMsg: Message = {
        id: generateId(),
        role: 'user',
        content,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setIsAILoading(true);

      try {
        const key = process.env['EXPO_PUBLIC_GROQ_API_KEY'] ?? '';
        if (key) {
          const systemPrompt = buildSystemPrompt(storeRef.current, productsRef.current);
          const resp = await fetch(GROQ_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
            body: JSON.stringify({
              model: GROQ_MODEL,
              messages: [
                { role: 'system', content: systemPrompt },
                ...messages.slice(-10).map((m) => ({ role: m.role, content: m.content })),
                { role: 'user', content },
              ],
              max_tokens: 300,
              temperature: 0.7,
            }),
          });
          if (!resp.ok) throw new Error(`Groq error: ${resp.status}`);
          const data = await resp.json();
          const aiContent: string = data.choices?.[0]?.message?.content ?? 'Sorry, I could not get a response right now.';
          setMessages((prev) => [...prev, { id: generateId(), role: 'assistant', content: aiContent, timestamp: new Date().toISOString() }]);
        } else {
          await new Promise<void>((resolve) => setTimeout(resolve, 900));
          setMessages((prev) => [
            ...prev,
            {
              id: generateId(),
              role: 'assistant',
              content: simulatedResponse(content, productsRef.current, storeRef.current?.name ?? 'StatusSeller'),
              timestamp: new Date().toISOString(),
            },
          ]);
        }
      } catch {
        setMessages((prev) => [...prev, { id: generateId(), role: 'assistant', content: 'I had trouble connecting right now. Please try again in a moment.', timestamp: new Date().toISOString() }]);
      } finally {
        setIsAILoading(false);
      }
    },
    [messages],
  );

  const clearChat = () => {
    setMessages([{ id: generateId(), role: 'assistant', content: "Chat cleared! I'm ready to help. Ask me anything about your store. 🚀", timestamp: new Date().toISOString() }]);
  };

  return (
    <AppContext.Provider
      value={{
        isLoggedIn,
        user,
        store,
        login,
        register,
        logout,
        refreshData,
        stats,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        orders,
        updateOrderStatus,
        notifications,
        unreadCount,
        markAllRead,
        messages,
        sendMessage,
        clearChat,
        isAILoading,
        groqEnabled,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
