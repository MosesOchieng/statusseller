import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User, Store, Product, Order, Message, Notification } from '@/types';
import {
  MOCK_USER,
  MOCK_STORE,
  MOCK_PRODUCTS,
  MOCK_ORDERS,
  MOCK_NOTIFICATIONS,
} from '@/constants/mockData';
import { generateId, generateLinkCode } from '@/utils/formatters';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.1-8b-instant';

interface AppContextValue {
  // Auth
  isLoggedIn: boolean;
  user: User | null;
  store: Store | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  // Products
  products: Product[];
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'views' | 'orders' | 'shopLink'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  // Orders
  orders: Order[];
  updateOrderStatus: (id: string, status: Order['status']) => void;
  // Notifications
  notifications: Notification[];
  unreadCount: number;
  markAllRead: () => void;
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
  return `You are Seller AI, a friendly and knowledgeable sales assistant for ${store?.name ?? 'StatusSeller'}, a Kenyan online store. 

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

function simulatedResponse(content: string, products: Product[]): string {
  const lower = content.toLowerCase();
  if (lower.includes('size') || lower.includes('fit')) {
    return 'Sizes are listed per product. Nike Air Force 1: 40–44. Samsung Watch 6: 40mm or 44mm. Please confirm your size before ordering!';
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
  if (lower.includes('original') || lower.includes('authentic') || lower.includes('warranty')) {
    return 'All products are 100% authentic with official manufacturer warranties. Nike: 1 year, Samsung: 2 years. We provide receipts for all purchases.';
  }
  if (lower.includes('price') || lower.includes('cost') || lower.includes('ksh')) {
    const priceList = products.filter((p) => p.status !== 'draft').map((p) => `${p.title}: KSh ${p.price.toLocaleString()}`).join(', ');
    return `Current prices: ${priceList || 'Check individual products for pricing.'}`;
  }
  if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
    return `Hello! 👋 Welcome to ${MOCK_STORE.name}. I can help with product info, delivery, payments, and more. What would you like to know?`;
  }
  return 'I can help with product details, delivery times, payment options, stock levels, and return policies. What would you like to know?';
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [isAILoading, setIsAILoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm0',
      role: 'assistant',
      content: "Hi! I'm Seller AI — your always-on sales assistant. I can answer customer questions about your products, delivery, payments, and more. Try me! 🚀",
      timestamp: new Date().toISOString(),
    },
  ]);

  // Check if Groq API key is configured
  const groqKey = process.env.EXPO_PUBLIC_GROQ_API_KEY ?? '';
  const groqEnabled = groqKey.length > 0;

  // Keep products ref current for use inside sendMessage closure
  const productsRef = useRef(products);
  productsRef.current = products;
  const storeRef = useRef(store);
  storeRef.current = store;

  useEffect(() => {
    AsyncStorage.getItem('isLoggedIn').then((val) => {
      if (val === 'true') {
        setIsLoggedIn(true);
        setUser(MOCK_USER);
        setStore(MOCK_STORE);
      }
    });
  }, []);

  const login = async (email: string, _password: string) => {
    await AsyncStorage.setItem('isLoggedIn', 'true');
    setIsLoggedIn(true);
    setUser({ ...MOCK_USER, email });
    setStore(MOCK_STORE);
  };

  const register = async (name: string, email: string, _password: string) => {
    const newUser: User = { id: generateId(), name, email, phone: '' };
    const newStore: Store = {
      ...MOCK_STORE,
      id: generateId(),
      name,
      email,
      totalSales: 0,
      totalRevenue: 0,
      verified: false,
      joinedDate: new Date().toISOString(),
    };
    await AsyncStorage.setItem('isLoggedIn', 'true');
    setIsLoggedIn(true);
    setUser(newUser);
    setStore(newStore);
    setProducts([]);
    setOrders([]);
  };

  const logout = () => {
    AsyncStorage.removeItem('isLoggedIn');
    setIsLoggedIn(false);
    setUser(null);
    setStore(null);
  };

  const addProduct = (product: Omit<Product, 'id' | 'createdAt' | 'views' | 'orders' | 'shopLink'>) => {
    const newProduct: Product = {
      ...product,
      id: generateId(),
      createdAt: new Date().toISOString(),
      views: 0,
      orders: 0,
      shopLink: `statusseller.app/p/${generateLinkCode()}`,
    };
    setProducts((prev) => [newProduct, ...prev]);
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const updateOrderStatus = (id: string, status: Order['status']) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status, updatedAt: new Date().toISOString() } : o))
    );
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const sendMessage = useCallback(async (content: string) => {
    const userMsg: Message = {
      id: generateId(),
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsAILoading(true);

    try {
      const key = process.env.EXPO_PUBLIC_GROQ_API_KEY ?? '';
      if (key) {
        // Real Groq API call
        const systemPrompt = buildSystemPrompt(storeRef.current, productsRef.current);
        const resp = await fetch(GROQ_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${key}`,
          },
          body: JSON.stringify({
            model: GROQ_MODEL,
            messages: [
              { role: 'system', content: systemPrompt },
              // Include last 10 messages for context
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
        const aiMsg: Message = {
          id: generateId(),
          role: 'assistant',
          content: aiContent,
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, aiMsg]);
      } else {
        // Simulated fallback with realistic delay
        await new Promise<void>((resolve) => setTimeout(resolve, 900));
        const aiMsg: Message = {
          id: generateId(),
          role: 'assistant',
          content: simulatedResponse(content, productsRef.current),
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, aiMsg]);
      }
    } catch {
      const errMsg: Message = {
        id: generateId(),
        role: 'assistant',
        content: 'I had trouble connecting right now. Please try again in a moment.',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsAILoading(false);
    }
  }, [messages]);

  const clearChat = () => {
    setMessages([
      {
        id: generateId(),
        role: 'assistant',
        content: "Chat cleared! I'm ready to help. Ask me anything about your store. 🚀",
        timestamp: new Date().toISOString(),
      },
    ]);
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
