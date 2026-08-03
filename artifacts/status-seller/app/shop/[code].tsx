/**
 * Customer-facing shopping popup — "Everything Happens Inside the Popup"
 * Tabs: Product → Cart → Chat → Checkout → Confirmed
 */
import React, { useRef, useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/context/AppContext';
import { LinearGradient } from 'expo-linear-gradient';
import { formatCurrency } from '@/utils/formatters';

type TabType = 'product' | 'cart' | 'chat' | 'checkout' | 'confirmed';

interface CartItem {
  productId: string;
  title: string;
  price: number;
  currency: string;
  selectedColor: string;
  selectedSize: string;
  quantity: number;
  colorHex?: string;
}

interface ChatMessage {
  id: string;
  role: 'customer' | 'seller';
  text: string;
  time: string;
  options?: string[];
}

const INITIAL_CHAT: ChatMessage[] = [
  {
    id: 'm1',
    role: 'seller',
    text: 'Hi! Welcome to Urban Wear 👋 How can we help you today?',
    time: '10:30 AM',
  },
];

const OFFER_STATES = ['none', 'customer_offer', 'seller_counter', 'agreement'] as const;
type OfferState = (typeof OFFER_STATES)[number];

export default function ShopScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { code } = useLocalSearchParams<{ code: string }>();
  const { products, store } = useApp();

  const product = products.find((p) => p.shopLink?.includes(code ?? '')) ?? products[0];

  const [tab, setTab] = useState<TabType>('product');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedColor, setSelectedColor] = useState<string>('White');
  const [selectedSize, setSelectedSize] = useState<string>('42');
  const [quantity, setQuantity] = useState(1);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(INITIAL_CHAT);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [offerState, setOfferState] = useState<OfferState>('none');
  const [offerPrice, setOfferPrice] = useState('');
  const [agreedPrice, setAgreedPrice] = useState(product?.price ?? 0);
  const [offerTimer, setOfferTimer] = useState(598); // 9:58

  // Checkout fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'mpesa' | 'card'>('mpesa');
  const [deliveryOption, setDeliveryOption] = useState<'same_day' | 'next_day'>('same_day');

  const listRef = useRef<FlatList>(null);
  const topInset = Platform.OS === 'web' ? 0 : insets.top;

  if (!product) return null;

  const colors_v = product.variants.find((v) => v.name === 'Color');
  const sizes_v = product.variants.find((v) => v.name === 'Size');
  const colorOptions = colors_v?.options ?? ['White', 'Black'];
  const sizeOptions = sizes_v?.options ?? ['40', '41', '42', '43', '44'];

  const deliveryFee = deliveryOption === 'same_day' ? 0 : 200;
  const cartTotal = cartItems.reduce((s, i) => s + i.price * i.quantity, 0);
  const orderTotal = cartTotal + deliveryFee;

  const handleAddToCart = () => {
    setCartItems([{
      productId: product.id,
      title: product.title,
      price: agreedPrice,
      currency: product.currency,
      selectedColor,
      selectedSize,
      quantity,
      colorHex: product.colorHex,
    }]);
    setTab('cart');
  };

  const handleBuyNow = () => {
    setCartItems([{
      productId: product.id,
      title: product.title,
      price: agreedPrice,
      currency: product.currency,
      selectedColor,
      selectedSize,
      quantity,
      colorHex: product.colorHex,
    }]);
    setTab('checkout');
  };

  const handleSendMessage = async () => {
    const text = chatInput.trim();
    if (!text) return;
    setChatInput('');

    const customerMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'customer',
      text,
      time: new Date().toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' }),
    };
    setChatMessages((prev) => [...prev, customerMsg]);
    setIsChatLoading(true);

    await new Promise<void>((r) => setTimeout(r, 900));

    let replyText = "I'll check on that for you right away! 😊";
    let options: string[] | undefined;

    const lower = text.toLowerCase();
    if (lower.includes('size') || lower.includes('43')) {
      replyText = 'Yes! Size 43 is available in White and Black.';
      options = ['White', 'Black'];
    } else if (lower.includes('deliver') || lower.includes('ship')) {
      replyText = 'We offer Same-Day Delivery in Nairobi (KSh 0 today!) and Next-Day Delivery for KSh 200.';
    } else if (lower.includes('original') || lower.includes('authentic')) {
      replyText = 'Yes ✅ All our sneakers are 100% original and come with a 12-month warranty.';
    } else if (lower.includes('ksh 5') || lower.includes('5,500') || lower.includes('5500') || lower.includes('lower') || lower.includes('discount')) {
      replyText = 'Thanks for your offer. The current price is KSh 6,000.';
      setOfferState('customer_offer');
    } else if (lower.includes('pay') || lower.includes('mpesa')) {
      replyText = 'We accept M-Pesa (instant!), Visa, Mastercard, and Cash on Delivery.';
    }

    const replyMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'seller',
      text: replyText,
      time: new Date().toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' }),
      options,
    };
    setChatMessages((prev) => [...prev, replyMsg]);
    setIsChatLoading(false);

    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const handleMakeOffer = () => {
    const offered = Number(offerPrice);
    if (!offered || offered <= 0) return;
    const msg: ChatMessage = {
      id: Date.now().toString(),
      role: 'customer',
      text: `Can you do KSh ${offered.toLocaleString()}?`,
      time: new Date().toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' }),
    };
    setChatMessages((prev) => [...prev, msg]);
    setOfferInput(false);

    setTimeout(() => {
      const sellerPrice = Math.round(offered * 1.04 / 100) * 100;
      const replyMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'seller',
        text: `I can offer you ${formatCurrency(sellerPrice, 'KSh')} if you place the order in the next 10 minutes.`,
        time: new Date().toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' }),
      };
      setChatMessages((prev) => [...prev, replyMsg]);
      setAgreedPrice(sellerPrice);
      setOfferState('seller_counter');
    }, 1000);
  };

  const [showOfferInput, setOfferInput] = useState(false);

  const handleAcceptOffer = () => {
    const agrMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'customer',
      text: `Offer accepted! 🎉 Here is your order summary.`,
      time: new Date().toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' }),
    };
    setChatMessages((prev) => [...prev, agrMsg]);
    setOfferState('agreement');
    setCartItems([{
      productId: product.id,
      title: product.title,
      price: agreedPrice,
      currency: product.currency,
      selectedColor,
      selectedSize,
      quantity,
      colorHex: product.colorHex,
    }]);
  };

  const handlePlaceOrder = () => {
    if (!name || !phone) {
      Alert.alert('Missing Info', 'Please fill in your name and phone number.');
      return;
    }
    setTab('confirmed');
  };

  const cartBadge = cartItems.reduce((s, i) => s + i.quantity, 0);

  // ---------- RENDER SECTIONS ----------

  const renderProductTab = () => (
    <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
      {/* Product image */}
      <LinearGradient
        colors={[product.colorHex ? product.colorHex + 'DD' : '#E5E5E5', product.colorHex ? product.colorHex + '66' : '#F0F0F0']}
        style={styles.productImage}
      >
        {product.images?.[0] ? null : (
          <View style={styles.productImageInner}>
            <Text style={[styles.productImageText, { color: '#fff', fontFamily: 'Inter_700Bold' }]}>
              {product.title.toUpperCase()}
            </Text>
          </View>
        )}
      </LinearGradient>

      <View style={styles.productDetails}>
        {/* Store + rating */}
        <View style={styles.storeRow}>
          <View style={[styles.storeBadge, { backgroundColor: colors.primary }]}>
            <Feather name="check-circle" size={10} color="#fff" />
            <Text style={[styles.storeText, { fontFamily: 'Inter_600SemiBold' }]}>
              {' '}{store?.name ?? 'Urban Wear'}
            </Text>
          </View>
          <View style={styles.ratingRow}>
            <Feather name="star" size={13} color="#F59E0B" />
            <Text style={[styles.ratingText, { color: colors.foreground, fontFamily: 'Inter_600SemiBold' }]}>
              {' '}4.9
            </Text>
            <Text style={[styles.ratingCount, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
              {' '}(128)
            </Text>
          </View>
        </View>

        <Text style={[styles.productTitle, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>
          {product.title}
        </Text>
        <Text style={[styles.productPrice, { color: colors.primary, fontFamily: 'Inter_700Bold' }]}>
          {formatCurrency(agreedPrice, product.currency)}
        </Text>
        {product.originalPrice && (
          <Text style={[styles.originalPrice, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
            {formatCurrency(product.originalPrice, product.currency)}
          </Text>
        )}

        {/* Color variants */}
        {colorOptions.length > 0 && (
          <View style={styles.variantSection}>
            <Text style={[styles.variantLabel, { color: colors.foreground, fontFamily: 'Inter_600SemiBold' }]}>
              Color
            </Text>
            <View style={styles.colorRow}>
              {colorOptions.map((c) => {
                const colorMap: Record<string, string> = { White: '#F5F5F5', Black: '#1A1A1A', Gray: '#9CA3AF', Green: '#25D366', Red: '#EF4444', Blue: '#3B82F6' };
                const hex = colorMap[c] ?? '#888';
                const isSelected = selectedColor === c;
                return (
                  <TouchableOpacity
                    key={c}
                    onPress={() => setSelectedColor(c)}
                    style={[
                      styles.colorSwatch,
                      { backgroundColor: hex },
                      isSelected && { borderColor: colors.primary, borderWidth: 3 },
                    ]}
                  />
                );
              })}
            </View>
          </View>
        )}

        {/* Size variants */}
        {sizeOptions.length > 0 && (
          <View style={styles.variantSection}>
            <Text style={[styles.variantLabel, { color: colors.foreground, fontFamily: 'Inter_600SemiBold' }]}>
              Size
            </Text>
            <View style={styles.sizeRow}>
              {sizeOptions.map((s) => {
                const isSelected = selectedSize === s;
                return (
                  <TouchableOpacity
                    key={s}
                    onPress={() => setSelectedSize(s)}
                    style={[
                      styles.sizeChip,
                      isSelected
                        ? { backgroundColor: colors.primary, borderColor: colors.primary }
                        : { backgroundColor: colors.card, borderColor: colors.border },
                    ]}
                  >
                    <Text style={[styles.sizeText, { fontFamily: 'Inter_600SemiBold', color: isSelected ? '#fff' : colors.foreground }]}>
                      {s}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* Quantity */}
        <View style={styles.variantSection}>
          <Text style={[styles.variantLabel, { color: colors.foreground, fontFamily: 'Inter_600SemiBold' }]}>
            Quantity
          </Text>
          <View style={styles.qtyRow}>
            <TouchableOpacity
              onPress={() => setQuantity(Math.max(1, quantity - 1))}
              style={[styles.qtyBtn, { borderColor: colors.border, backgroundColor: colors.card }]}
            >
              <Feather name="minus" size={18} color={colors.foreground} />
            </TouchableOpacity>
            <Text style={[styles.qtyValue, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>
              {quantity}
            </Text>
            <TouchableOpacity
              onPress={() => setQuantity(quantity + 1)}
              style={[styles.qtyBtn, { borderColor: colors.border, backgroundColor: colors.card }]}
            >
              <Feather name="plus" size={18} color={colors.foreground} />
            </TouchableOpacity>
          </View>
        </View>

        {/* CTA buttons */}
        <TouchableOpacity onPress={handleAddToCart} style={[styles.addCartBtn, { backgroundColor: colors.primary }]}>
          <Feather name="shopping-cart" size={18} color="#fff" />
          <Text style={[styles.addCartText, { fontFamily: 'Inter_700Bold' }]}>Add to Cart</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleBuyNow} style={[styles.buyNowBtn, { backgroundColor: colors.primary }]}>
          <Feather name="zap" size={18} color="#fff" />
          <Text style={[styles.buyNowText, { fontFamily: 'Inter_700Bold' }]}>⚡ Buy Now</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setTab('chat')}
          style={[styles.chatBtn, { borderColor: colors.border, backgroundColor: colors.card }]}
        >
          <Feather name="message-circle" size={18} color={colors.primary} />
          <Text style={[styles.chatBtnText, { color: colors.primary, fontFamily: 'Inter_600SemiBold' }]}>
            Chat with {store?.name ?? 'Urban Wear'}
          </Text>
        </TouchableOpacity>

        {/* Trust badge */}
        <View style={styles.trustRow}>
          <Feather name="lock" size={13} color={colors.mutedForeground} />
          <Text style={[styles.trustText, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
            {' '}Secure & Trusted Checkout
          </Text>
        </View>
      </View>
    </ScrollView>
  );

  const renderCartTab = () => (
    <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
      {/* Added to cart confirmation */}
      <View style={[styles.addedBanner, { backgroundColor: colors.primary + '15' }]}>
        <Feather name="check-circle" size={18} color={colors.primary} />
        <Text style={[styles.addedText, { color: colors.primary, fontFamily: 'Inter_600SemiBold' }]}>
          {' '}Added to Cart ✓
        </Text>
      </View>

      {cartItems.map((item, i) => (
        <View key={i} style={[styles.cartItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.cartThumb, { backgroundColor: (item.colorHex ?? '#25D366') + '22' }]}>
            <Text style={[styles.cartThumbText, { color: item.colorHex ?? '#25D366', fontFamily: 'Inter_700Bold' }]}>
              {item.title.slice(0, 2).toUpperCase()}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.cartItemTitle, { color: colors.foreground, fontFamily: 'Inter_600SemiBold' }]}>
              {item.title}
            </Text>
            <Text style={[styles.cartItemVariant, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
              {item.selectedColor} / Size {item.selectedSize} · Qty: {item.quantity}
            </Text>
          </View>
          <Text style={[styles.cartItemPrice, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>
            {formatCurrency(item.price, item.currency)}
          </Text>
        </View>
      ))}

      {/* Totals */}
      <View style={[styles.totalsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.totalRow}>
          <Text style={[styles.totalLabel, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>Cart ({cartBadge})</Text>
          <Text style={[styles.totalValue, { color: colors.foreground, fontFamily: 'Inter_500Medium' }]}>{formatCurrency(cartTotal, 'KSh')}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={[styles.totalLabel, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>Delivery</Text>
          <Text style={[styles.totalValue, { color: colors.primary, fontFamily: 'Inter_500Medium' }]}>Free</Text>
        </View>
        <View style={[styles.totalRow, styles.totalFinalRow, { borderTopColor: colors.border }]}>
          <Text style={[styles.totalFinalLabel, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>Total</Text>
          <Text style={[styles.totalFinalValue, { color: colors.primary, fontFamily: 'Inter_700Bold' }]}>{formatCurrency(cartTotal, 'KSh')}</Text>
        </View>
      </View>

      <TouchableOpacity onPress={() => setTab('checkout')} style={[styles.buyNowBtn, { backgroundColor: colors.primary, marginHorizontal: 16 }]}>
        <Feather name="zap" size={18} color="#fff" />
        <Text style={[styles.buyNowText, { fontFamily: 'Inter_700Bold' }]}>⚡ Buy Now</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => setTab('product')}
        style={[styles.viewCartBtn, { borderColor: colors.border, marginHorizontal: 16 }]}
      >
        <Text style={[styles.viewCartText, { color: colors.foreground, fontFamily: 'Inter_600SemiBold' }]}>View Cart</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => setTab('chat')}
        style={[styles.chatBtn, { borderColor: colors.border, backgroundColor: colors.card, marginHorizontal: 16 }]}
      >
        <Feather name="message-circle" size={18} color={colors.primary} />
        <Text style={[styles.chatBtnText, { color: colors.primary, fontFamily: 'Inter_600SemiBold' }]}>
          Chat with {store?.name ?? 'Urban Wear'}
        </Text>
      </TouchableOpacity>

      <View style={[styles.trustRow, { justifyContent: 'center', marginTop: 8 }]}>
        <Feather name="lock" size={13} color={colors.mutedForeground} />
        <Text style={[styles.trustText, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
          {' '}Secure & Trusted Checkout
        </Text>
      </View>
    </ScrollView>
  );

  const renderChatTab = () => (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* Chat header */}
      <View style={[styles.chatHeader, { borderBottomColor: colors.border }]}>
        <View style={[styles.chatAvatar, { backgroundColor: colors.primary }]}>
          <Text style={[styles.chatAvatarText, { fontFamily: 'Inter_700Bold' }]}>
            {(store?.name ?? 'UW').slice(0, 2).toUpperCase()}
          </Text>
        </View>
        <View>
          <Text style={[styles.chatStoreName, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>
            {store?.name ?? 'Urban Wear'} ✓
          </Text>
          <View style={styles.onlineRow}>
            <View style={[styles.onlineDot, { backgroundColor: '#25D366' }]} />
            <Text style={[styles.onlineText, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
              {' '}Online
            </Text>
          </View>
        </View>
      </View>

      {/* Offer accepted UI */}
      {offerState === 'agreement' && (
        <View style={[styles.agreementBanner, { backgroundColor: colors.primary + '15', borderBottomColor: colors.border }]}>
          <Feather name="check-circle" size={16} color={colors.primary} />
          <Text style={[styles.agreementText, { color: colors.primary, fontFamily: 'Inter_600SemiBold' }]}>
            {' '}Offer accepted 🎉  New price: {formatCurrency(agreedPrice, 'KSh')}
          </Text>
          <TouchableOpacity
            onPress={() => setTab('checkout')}
            style={[styles.checkoutMiniBtn, { backgroundColor: colors.primary }]}
          >
            <Text style={[styles.checkoutMiniBtnText, { fontFamily: 'Inter_700Bold' }]}>⚡ Buy Now</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Messages */}
      <FlatList
        ref={listRef}
        data={chatMessages}
        keyExtractor={(m) => m.id}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const isSeller = item.role === 'seller';
          return (
            <View>
              <View style={[styles.chatBubbleRow, isSeller ? styles.bubbleLeft : styles.bubbleRight]}>
                {isSeller && (
                  <View style={[styles.chatBubbleAvatar, { backgroundColor: colors.primary }]}>
                    <Text style={{ color: '#fff', fontSize: 9, fontWeight: '700' }}>UW</Text>
                  </View>
                )}
                <View style={[
                  styles.chatBubble,
                  isSeller
                    ? [styles.sellerBubble, { backgroundColor: colors.card, borderColor: colors.border }]
                    : [styles.customerBubble, { backgroundColor: colors.primary }],
                ]}>
                  <Text style={[styles.bubbleText, { color: isSeller ? colors.foreground : '#fff', fontFamily: 'Inter_400Regular' }]}>
                    {item.text}
                  </Text>
                </View>
              </View>
              {item.options && (
                <View style={[styles.optionRow, { marginLeft: 36 }]}>
                  {item.options.map((opt: string) => (
                    <TouchableOpacity
                      key={opt}
                      onPress={() => { setSelectedColor(opt); setChatInput(`I'd like ${opt}`); }}
                      style={[styles.optionChip, { borderColor: colors.primary, backgroundColor: colors.primary + '12' }]}
                    >
                      <Text style={[styles.optionChipText, { color: colors.primary, fontFamily: 'Inter_500Medium' }]}>{opt}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          );
        }}
        ListFooterComponent={isChatLoading ? (
          <View style={styles.chatBubbleRow}>
            <View style={[styles.chatBubbleAvatar, { backgroundColor: colors.primary }]}>
              <Text style={{ color: '#fff', fontSize: 9, fontWeight: '700' }}>UW</Text>
            </View>
            <View style={[styles.chatBubble, styles.sellerBubble, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.bubbleText, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>···</Text>
            </View>
          </View>
        ) : null}
      />

      {/* Counter offer */}
      {offerState === 'seller_counter' && (
        <View style={[styles.counterOfferBar, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.counterLabel, { color: colors.foreground, fontFamily: 'Inter_600SemiBold' }]}>
              Accept {formatCurrency(agreedPrice, 'KSh')}?
            </Text>
            <Text style={[styles.counterSub, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
              Offer expires in ~10 min
            </Text>
          </View>
          <TouchableOpacity onPress={handleAcceptOffer} style={[styles.acceptBtn, { backgroundColor: colors.primary }]}>
            <Text style={[styles.acceptBtnText, { fontFamily: 'Inter_700Bold' }]}>Accept</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setOfferState('none')}
            style={[styles.declineBtn, { borderColor: colors.border }]}
          >
            <Text style={[styles.declineBtnText, { color: colors.foreground, fontFamily: 'Inter_500Medium' }]}>Decline</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Make offer button */}
      {offerState === 'none' && !showOfferInput && (
        <TouchableOpacity
          onPress={() => setOfferInput(true)}
          style={[styles.makeOfferBar, { backgroundColor: colors.muted, borderTopColor: colors.border }]}
        >
          <Feather name="tag" size={14} color={colors.primary} />
          <Text style={[styles.makeOfferText, { color: colors.primary, fontFamily: 'Inter_500Medium' }]}>
            {' '}Make an offer
          </Text>
        </TouchableOpacity>
      )}

      {showOfferInput && (
        <View style={[styles.offerInputBar, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
          <Text style={[styles.offerInputLabel, { color: colors.foreground, fontFamily: 'Inter_500Medium' }]}>KSh</Text>
          <TextInput
            style={[styles.offerInput, { color: colors.foreground, fontFamily: 'Inter_400Regular', backgroundColor: colors.muted }]}
            placeholder="Enter your offer"
            placeholderTextColor={colors.mutedForeground}
            value={offerPrice}
            onChangeText={setOfferPrice}
            keyboardType="number-pad"
            autoFocus
          />
          <TouchableOpacity onPress={handleMakeOffer} style={[styles.sendOfferBtn, { backgroundColor: colors.primary }]}>
            <Text style={[styles.sendOfferText, { fontFamily: 'Inter_700Bold' }]}>Send</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Chat input */}
      <View style={[styles.chatInputBar, { backgroundColor: colors.card, borderTopColor: colors.border, paddingBottom: insets.bottom + 4 }]}>
        <TextInput
          style={[styles.chatInput, { backgroundColor: colors.muted, color: colors.foreground, fontFamily: 'Inter_400Regular' }]}
          placeholder="Type your message..."
          placeholderTextColor={colors.mutedForeground}
          value={chatInput}
          onChangeText={setChatInput}
          onSubmitEditing={handleSendMessage}
          returnKeyType="send"
        />
        <TouchableOpacity onPress={handleSendMessage} style={[styles.chatSendBtn, { backgroundColor: chatInput.trim() ? colors.primary : colors.muted }]}>
          <Feather name="send" size={16} color={chatInput.trim() ? '#fff' : colors.mutedForeground} />
        </TouchableOpacity>
      </View>

      {/* Buy now footer */}
      <View style={[styles.chatFooterTotal, { backgroundColor: colors.background, borderTopColor: colors.border, paddingBottom: insets.bottom + 4 }]}>
        <Text style={[styles.chatFooterLabel, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
          Total: <Text style={{ color: colors.foreground, fontFamily: 'Inter_700Bold' }}>{formatCurrency(agreedPrice, 'KSh')}</Text>
        </Text>
        <TouchableOpacity onPress={() => setTab('checkout')} style={[styles.chatFooterBtn, { backgroundColor: colors.primary }]}>
          <Feather name="zap" size={15} color="#fff" />
          <Text style={[styles.chatFooterBtnText, { fontFamily: 'Inter_700Bold' }]}>  Buy Now</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );

  const renderCheckoutTab = () => (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      <Text style={[styles.checkoutTitle, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>Checkout</Text>

      {/* Order summary */}
      <View style={[styles.orderSummary, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={[styles.orderThumb, { backgroundColor: (product.colorHex ?? '#25D366') + '22' }]}>
          <Text style={[styles.orderThumbText, { color: product.colorHex ?? '#25D366', fontFamily: 'Inter_700Bold' }]}>
            {product.title.slice(0, 2).toUpperCase()}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.orderItemTitle, { color: colors.foreground, fontFamily: 'Inter_600SemiBold' }]}>{product.title}</Text>
          <Text style={[styles.orderItemVariant, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
            {selectedColor} / Size {selectedSize}
          </Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={[styles.orderItemPrice, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>
            {formatCurrency(agreedPrice, 'KSh')}
          </Text>
          <TouchableOpacity>
            <Text style={[styles.changeText, { color: colors.primary, fontFamily: 'Inter_500Medium' }]}>Change</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Delivery info */}
      <Text style={[styles.checkoutSection, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>Deliver To</Text>
      <TextInput
        style={[styles.checkoutInput, { backgroundColor: colors.muted, color: colors.foreground, fontFamily: 'Inter_400Regular', borderColor: colors.border }]}
        placeholder="Your name"
        placeholderTextColor={colors.mutedForeground}
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={[styles.checkoutInput, { backgroundColor: colors.muted, color: colors.foreground, fontFamily: 'Inter_400Regular', borderColor: colors.border }]}
        placeholder="Nairobi, Kenya"
        placeholderTextColor={colors.mutedForeground}
        value={address}
        onChangeText={setAddress}
      />

      {/* Delivery options */}
      <Text style={[styles.checkoutSection, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>Delivery Option</Text>
      {[
        { id: 'same_day' as const, label: 'Same Day Delivery (Nairobi)', price: 'Free', sub: 'Get it today by 5 PM' },
        { id: 'next_day' as const, label: 'Next Day Delivery', price: 'KSh 200', sub: 'Get it tomorrow' },
      ].map((opt) => (
        <TouchableOpacity
          key={opt.id}
          onPress={() => setDeliveryOption(opt.id)}
          style={[styles.deliveryOption, {
            borderColor: deliveryOption === opt.id ? colors.primary : colors.border,
            backgroundColor: deliveryOption === opt.id ? colors.primary + '08' : colors.card,
          }]}
        >
          <View style={[styles.radioOuter, { borderColor: deliveryOption === opt.id ? colors.primary : colors.border }]}>
            {deliveryOption === opt.id && <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.deliveryLabel, { color: colors.foreground, fontFamily: 'Inter_600SemiBold' }]}>{opt.label}</Text>
            <Text style={[styles.deliverySub, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>{opt.sub}</Text>
          </View>
          <Text style={[styles.deliveryPrice, { color: colors.primary, fontFamily: 'Inter_700Bold' }]}>{opt.price}</Text>
        </TouchableOpacity>
      ))}

      {/* Total */}
      <View style={[styles.totalsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.totalRow}>
          <Text style={[styles.totalLabel, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>Subtotal</Text>
          <Text style={[styles.totalValue, { color: colors.foreground, fontFamily: 'Inter_500Medium' }]}>{formatCurrency(agreedPrice, 'KSh')}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={[styles.totalLabel, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>Delivery</Text>
          <Text style={[styles.totalValue, { color: deliveryFee === 0 ? colors.primary : colors.foreground, fontFamily: 'Inter_500Medium' }]}>
            {deliveryFee === 0 ? 'Free' : formatCurrency(deliveryFee, 'KSh')}
          </Text>
        </View>
        <View style={[styles.totalRow, styles.totalFinalRow, { borderTopColor: colors.border }]}>
          <Text style={[styles.totalFinalLabel, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>Total</Text>
          <Text style={[styles.totalFinalValue, { color: colors.primary, fontFamily: 'Inter_700Bold' }]}>{formatCurrency(orderTotal, 'KSh')}</Text>
        </View>
      </View>

      {/* Payment method */}
      <Text style={[styles.checkoutSection, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>Payment Method</Text>
      {[
        { id: 'mpesa' as const, label: 'M-Pesa', icon: 'smartphone' as const },
        { id: 'card' as const, label: 'Card', icon: 'credit-card' as const },
      ].map((pm) => (
        <TouchableOpacity
          key={pm.id}
          onPress={() => setPaymentMethod(pm.id)}
          style={[styles.payOption, {
            borderColor: paymentMethod === pm.id ? colors.primary : colors.border,
            backgroundColor: paymentMethod === pm.id ? colors.primary + '08' : colors.card,
          }]}
        >
          <View style={[styles.radioOuter, { borderColor: paymentMethod === pm.id ? colors.primary : colors.border }]}>
            {paymentMethod === pm.id && <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />}
          </View>
          <Feather name={pm.icon} size={18} color={paymentMethod === pm.id ? colors.primary : colors.mutedForeground} />
          <Text style={[styles.payLabel, { color: colors.foreground, fontFamily: 'Inter_600SemiBold' }]}>{pm.label}</Text>
        </TouchableOpacity>
      ))}

      {/* Phone for M-Pesa */}
      {paymentMethod === 'mpesa' && (
        <TextInput
          style={[styles.checkoutInput, { backgroundColor: colors.muted, color: colors.foreground, fontFamily: 'Inter_400Regular', borderColor: colors.border }]}
          placeholder="+254 7XX XXX XXX"
          placeholderTextColor={colors.mutedForeground}
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />
      )}

      <TouchableOpacity
        onPress={handlePlaceOrder}
        style={[styles.payBtn, { backgroundColor: colors.primary }]}
      >
        <Text style={[styles.payBtnText, { fontFamily: 'Inter_700Bold' }]}>
          Pay {formatCurrency(orderTotal, 'KSh')} →
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderConfirmed = () => (
    <View style={styles.confirmedContainer}>
      <LinearGradient colors={['#25D366', '#128C7E']} style={styles.confirmedCheck}>
        <Feather name="check" size={40} color="#fff" />
      </LinearGradient>
      <Text style={[styles.confirmedTitle, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>
        Thank you, {name || 'Customer'}! 🎉
      </Text>
      <Text style={[styles.confirmedSub, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
        Your order has been placed successfully.
      </Text>

      <View style={[styles.confirmedCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.confirmedRow}>
          <Text style={[styles.confirmedLabel, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>Order</Text>
          <Text style={[styles.confirmedValue, { color: colors.primary, fontFamily: 'Inter_700Bold' }]}>
            #UW-{Math.floor(Math.random() * 90000 + 10000)}
          </Text>
        </View>
        <View style={styles.confirmedRow}>
          <Text style={[styles.confirmedLabel, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>Estimated Delivery</Text>
          <Text style={[styles.confirmedValue, { color: colors.foreground, fontFamily: 'Inter_600SemiBold' }]}>
            {deliveryOption === 'same_day' ? 'Today by 5 PM 🚚' : 'Tomorrow by 5 PM'}
          </Text>
        </View>
        <View style={styles.confirmedRow}>
          <Text style={[styles.confirmedLabel, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>Total Paid</Text>
          <Text style={[styles.confirmedValue, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>
            {formatCurrency(orderTotal, 'KSh')}
          </Text>
        </View>
      </View>

      <TouchableOpacity style={[styles.trackBtn, { backgroundColor: colors.primary }]} onPress={() => router.back()}>
        <Feather name="map-pin" size={16} color="#fff" />
        <Text style={[styles.trackBtnText, { fontFamily: 'Inter_700Bold' }]}>  Track Order</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.continueBtn, { borderColor: colors.border }]}
        onPress={() => { setTab('product'); setCartItems([]); }}
      >
        <Text style={[styles.continueBtnText, { color: colors.foreground, fontFamily: 'Inter_600SemiBold' }]}>Continue Shopping</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topInset + 16, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <Feather name="x" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <View style={styles.storeInfo}>
          <View style={[styles.storeAvatar, { backgroundColor: colors.primary }]}>
            <Text style={[styles.storeAvatarText, { fontFamily: 'Inter_700Bold' }]}>
              {(store?.name ?? 'UW').slice(0, 2).toUpperCase()}
            </Text>
          </View>
          <View>
            <View style={styles.storeNameRow}>
              <Text style={[styles.storeName, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>
                {store?.name ?? 'Urban Wear'}
              </Text>
              <Feather name="check-circle" size={13} color={colors.primary} />
            </View>
            <Text style={[styles.storeTime, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
              Today, 10:30 AM
            </Text>
          </View>
        </View>
        {tab !== 'confirmed' && (
          <TouchableOpacity onPress={() => setTab('cart')} style={styles.cartIcon}>
            <Feather name="shopping-cart" size={22} color={colors.foreground} />
            {cartBadge > 0 && (
              <View style={[styles.cartBadge, { backgroundColor: colors.destructive }]}>
                <Text style={styles.cartBadgeText}>{cartBadge}</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Chat/Checkout tabs */}
      {tab !== 'confirmed' && tab !== 'product' && tab !== 'cart' && (
        <View style={[styles.tabBar, { borderBottomColor: colors.border }]}>
          {(['chat', 'checkout'] as const).map((t) => (
            <TouchableOpacity
              key={t}
              onPress={() => setTab(t)}
              style={[styles.tabBarItem, tab === t && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
            >
              {t === 'checkout' && cartBadge > 0 && (
                <View style={[styles.tabBadge, { backgroundColor: colors.destructive }]}>
                  <Text style={styles.tabBadgeText}>{cartBadge}</Text>
                </View>
              )}
              <Text style={[styles.tabBarText, { fontFamily: 'Inter_600SemiBold', color: tab === t ? colors.primary : colors.mutedForeground }]}>
                {t.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Content */}
      <View style={{ flex: 1 }}>
        {tab === 'product' && renderProductTab()}
        {tab === 'cart' && renderCartTab()}
        {tab === 'chat' && renderChatTab()}
        {tab === 'checkout' && renderCheckoutTab()}
        {tab === 'confirmed' && renderConfirmed()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1, gap: 10 },
  closeBtn: { padding: 4 },
  storeInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  storeAvatar: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  storeAvatarText: { fontSize: 13, color: '#fff' },
  storeNameRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  storeName: { fontSize: 14 },
  storeTime: { fontSize: 11, marginTop: 1 },
  cartIcon: { position: 'relative', padding: 4 },
  cartBadge: { position: 'absolute', top: 0, right: 0, width: 16, height: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  cartBadgeText: { fontSize: 9, color: '#fff', fontWeight: '700' },
  tabBar: { flexDirection: 'row', borderBottomWidth: 1 },
  tabBarItem: { flex: 1, alignItems: 'center', paddingVertical: 12, position: 'relative' },
  tabBarText: { fontSize: 13 },
  tabBadge: { position: 'absolute', top: 8, right: 20, width: 16, height: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  tabBadgeText: { fontSize: 9, color: '#fff', fontWeight: '700' },
  productImage: { height: 240, justifyContent: 'flex-end' },
  productImageInner: { alignItems: 'center', justifyContent: 'center', flex: 1, padding: 20 },
  productImageText: { fontSize: 20, textAlign: 'center', lineHeight: 28, opacity: 0.8 },
  productDetails: { padding: 16, gap: 4 },
  storeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  storeBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  storeText: { fontSize: 11, color: '#fff' },
  ratingRow: { flexDirection: 'row', alignItems: 'center' },
  ratingText: { fontSize: 13 },
  ratingCount: { fontSize: 12 },
  productTitle: { fontSize: 20, marginBottom: 4 },
  productPrice: { fontSize: 24, marginBottom: 2 },
  originalPrice: { fontSize: 14, textDecorationLine: 'line-through', marginBottom: 12 },
  variantSection: { marginTop: 12 },
  variantLabel: { fontSize: 14, marginBottom: 8 },
  colorRow: { flexDirection: 'row', gap: 10 },
  colorSwatch: { width: 32, height: 32, borderRadius: 16, borderWidth: 1, borderColor: '#E5E7EB' },
  sizeRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  sizeChip: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5 },
  sizeText: { fontSize: 14 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  qtyBtn: { width: 38, height: 38, borderRadius: 10, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  qtyValue: { fontSize: 20, minWidth: 30, textAlign: 'center' },
  addCartBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 14, gap: 8, marginTop: 16 },
  addCartText: { fontSize: 16, color: '#fff' },
  buyNowBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 14, gap: 8, marginTop: 8 },
  buyNowText: { fontSize: 16, color: '#fff' },
  chatBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 14, borderRadius: 14, borderWidth: 1, gap: 8, marginTop: 8 },
  chatBtnText: { fontSize: 15 },
  trustRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  trustText: { fontSize: 12 },
  addedBanner: { flexDirection: 'row', alignItems: 'center', margin: 16, borderRadius: 12, padding: 12 },
  addedText: { fontSize: 14 },
  cartItem: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, borderRadius: 14, borderWidth: 1, padding: 12, gap: 12, marginBottom: 8 },
  cartThumb: { width: 52, height: 52, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  cartThumbText: { fontSize: 16 },
  cartItemTitle: { fontSize: 14 },
  cartItemVariant: { fontSize: 12, marginTop: 2 },
  cartItemPrice: { fontSize: 16 },
  totalsCard: { marginHorizontal: 16, borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 12 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 },
  totalLabel: { fontSize: 14 },
  totalValue: { fontSize: 14 },
  totalFinalRow: { borderTopWidth: 1, marginTop: 4, paddingTop: 10 },
  totalFinalLabel: { fontSize: 16 },
  totalFinalValue: { fontSize: 18 },
  viewCartBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 14, borderRadius: 14, borderWidth: 1, marginTop: 8 },
  viewCartText: { fontSize: 15 },
  chatHeader: { flexDirection: 'row', alignItems: 'center', padding: 14, borderBottomWidth: 1, gap: 10 },
  chatAvatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  chatAvatarText: { fontSize: 14, color: '#fff' },
  chatStoreName: { fontSize: 15 },
  onlineRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  onlineDot: { width: 7, height: 7, borderRadius: 4 },
  onlineText: { fontSize: 12 },
  agreementBanner: { flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 1, gap: 8, flexWrap: 'wrap' },
  agreementText: { fontSize: 13, flex: 1 },
  checkoutMiniBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  checkoutMiniBtnText: { fontSize: 12, color: '#fff' },
  chatBubbleRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginBottom: 4 },
  bubbleLeft: { justifyContent: 'flex-start' },
  bubbleRight: { justifyContent: 'flex-end' },
  chatBubbleAvatar: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  chatBubble: { maxWidth: '78%', borderRadius: 18, padding: 12 },
  sellerBubble: { borderWidth: 1, borderBottomLeftRadius: 4 },
  customerBubble: { borderBottomRightRadius: 4 },
  bubbleText: { fontSize: 14, lineHeight: 20 },
  optionRow: { flexDirection: 'row', gap: 8, marginTop: 6 },
  optionChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  optionChipText: { fontSize: 13 },
  counterOfferBar: { flexDirection: 'row', alignItems: 'center', padding: 12, borderTopWidth: 1, gap: 8 },
  counterLabel: { fontSize: 14 },
  counterSub: { fontSize: 12, marginTop: 2 },
  acceptBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  acceptBtnText: { fontSize: 13, color: '#fff' },
  declineBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  declineBtnText: { fontSize: 13 },
  makeOfferBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 10, borderTopWidth: 1 },
  makeOfferText: { fontSize: 14 },
  offerInputBar: { flexDirection: 'row', alignItems: 'center', padding: 10, borderTopWidth: 1, gap: 8 },
  offerInputLabel: { fontSize: 14, flexShrink: 0 },
  offerInput: { flex: 1, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, fontSize: 15 },
  sendOfferBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20 },
  sendOfferText: { fontSize: 14, color: '#fff' },
  chatInputBar: { flexDirection: 'row', alignItems: 'center', padding: 10, borderTopWidth: 1, gap: 8 },
  chatInput: { flex: 1, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14 },
  chatSendBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  chatFooterTotal: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingTop: 8, borderTopWidth: 1 },
  chatFooterLabel: { fontSize: 14 },
  chatFooterBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 9, borderRadius: 20 },
  chatFooterBtnText: { fontSize: 14, color: '#fff' },
  checkoutTitle: { fontSize: 22, marginBottom: 16 },
  orderSummary: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, borderWidth: 1, padding: 12, gap: 12, marginBottom: 20 },
  orderThumb: { width: 52, height: 52, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  orderThumbText: { fontSize: 16 },
  orderItemTitle: { fontSize: 14 },
  orderItemVariant: { fontSize: 12, marginTop: 2 },
  orderItemPrice: { fontSize: 16 },
  changeText: { fontSize: 12, marginTop: 2 },
  checkoutSection: { fontSize: 15, marginBottom: 10, marginTop: 4 },
  checkoutInput: { borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, marginBottom: 10 },
  deliveryOption: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, borderWidth: 1.5, padding: 14, gap: 10, marginBottom: 8 },
  radioOuter: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  radioInner: { width: 10, height: 10, borderRadius: 5 },
  deliveryLabel: { fontSize: 13 },
  deliverySub: { fontSize: 12, marginTop: 2 },
  deliveryPrice: { fontSize: 13 },
  payOption: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, borderWidth: 1.5, padding: 14, gap: 10, marginBottom: 8 },
  payLabel: { fontSize: 14 },
  payBtn: { padding: 16, borderRadius: 16, alignItems: 'center', marginTop: 8 },
  payBtnText: { fontSize: 17, color: '#fff' },
  confirmedContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 16 },
  confirmedCheck: { width: 88, height: 88, borderRadius: 44, alignItems: 'center', justifyContent: 'center' },
  confirmedTitle: { fontSize: 24, textAlign: 'center' },
  confirmedSub: { fontSize: 15, textAlign: 'center' },
  confirmedCard: { borderRadius: 16, borderWidth: 1, padding: 16, width: '100%', gap: 8 },
  confirmedRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
  confirmedLabel: { fontSize: 13 },
  confirmedValue: { fontSize: 14 },
  trackBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 28, paddingVertical: 14, borderRadius: 14, gap: 6, width: '100%', justifyContent: 'center' },
  trackBtnText: { fontSize: 16, color: '#fff' },
  continueBtn: { paddingVertical: 14, borderRadius: 14, borderWidth: 1, width: '100%', alignItems: 'center' },
  continueBtnText: { fontSize: 15 },
});
