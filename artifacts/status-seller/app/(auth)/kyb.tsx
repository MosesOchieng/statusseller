/**
 * KYB — Know Your Business verification wizard
 * Steps: Business Info → Upload Documents → Review → Pending → Verified → Business Setup
 */
import React, { useState } from 'react';
import {
  Alert,
  Image,
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
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useColors } from '@/hooks/useColors';

type Step = 'business_info' | 'upload_docs' | 'review' | 'pending' | 'verified' | 'setup';

const BUSINESS_TYPES = ['Sole Proprietor', 'Limited Company', 'Partnership', 'NGO/CBO'] as const;
const BUSINESS_CATEGORIES = ['Retail / E-Commerce', 'Fashion & Apparel', 'Electronics', 'Food & Beverage', 'Beauty & Health', 'Services', 'Other'] as const;

interface SetupItem {
  id: string;
  icon: React.ComponentProps<typeof Feather>['name'];
  title: string;
  subtitle: string;
  color: string;
  done: boolean;
}

export default function KYBScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === 'web' ? 0 : insets.top;

  const [step, setStep] = useState<Step>('business_info');

  // Business info
  const [bizType, setBizType] = useState<string>('Sole Proprietor');
  const [bizName, setBizName] = useState('');
  const [regNumber, setRegNumber] = useState('');
  const [taxPin, setTaxPin] = useState('');
  const [category, setCategory] = useState('Retail / E-Commerce');
  const [address, setAddress] = useState('');

  // Documents
  const [ownerIdUri, setOwnerIdUri] = useState<string | null>(null);
  const [bizRegUri, setBizRegUri] = useState<string | null>(null);
  const [logoUri, setLogoUri] = useState<string | null>(null);

  // Setup checklist
  const [setupItems, setSetupItems] = useState<SetupItem[]>([
    { id: 'profile', icon: 'user', title: 'Store Profile', subtitle: 'Add your store info & logo', color: '#3B82F6', done: false },
    { id: 'assistant', icon: 'cpu', title: 'Business Assistant', subtitle: 'Configure your AI assistant', color: '#8B5CF6', done: false },
    { id: 'payment', icon: 'credit-card', title: 'Payment Setup', subtitle: 'Connect M-Pesa & card', color: '#25D366', done: false },
    { id: 'delivery', icon: 'truck', title: 'Delivery Setup', subtitle: 'Set delivery areas & fees', color: '#F59E0B', done: false },
  ]);

  const pickDocument = async (setter: (uri: string) => void) => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please allow access to your photos.');
        return;
      }
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 });
    if (!result.canceled) setter(result.assets[0].uri);
  };

  const stepIndex = (['business_info', 'upload_docs', 'review', 'pending', 'verified', 'setup'] as Step[]).indexOf(step);
  const totalSteps = 4; // progress bar steps

  // ---- STEP RENDERERS ----

  const renderBusinessInfo = () => (
    <ScrollView contentContainerStyle={styles.stepContent} keyboardShouldPersistTaps="handled">
      <Text style={[styles.stepTitle, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>Business Information</Text>
      <Text style={[styles.stepSub, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
        Tell us about your business to get verified
      </Text>

      <Text style={[styles.fieldLabel, { color: colors.foreground, fontFamily: 'Inter_500Medium' }]}>Business Type</Text>
      <View style={styles.pillRow}>
        {BUSINESS_TYPES.map((t) => (
          <TouchableOpacity
            key={t}
            onPress={() => setBizType(t)}
            style={[styles.pill, { backgroundColor: bizType === t ? colors.primary : colors.muted, borderRadius: 99 }]}
          >
            <Text style={[styles.pillText, { color: bizType === t ? '#fff' : colors.foreground, fontFamily: bizType === t ? 'Inter_600SemiBold' : 'Inter_400Regular' }]}>
              {t}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[styles.fieldLabel, { color: colors.foreground, fontFamily: 'Inter_500Medium' }]}>Business Name *</Text>
      <TextInput
        style={[styles.input, { backgroundColor: colors.muted, color: colors.foreground, borderColor: colors.border, fontFamily: 'Inter_400Regular' }]}
        placeholder="e.g., Urban Wear Ltd"
        placeholderTextColor={colors.mutedForeground}
        value={bizName}
        onChangeText={setBizName}
      />

      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.fieldLabel, { color: colors.foreground, fontFamily: 'Inter_500Medium' }]}>Registration No.</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.muted, color: colors.foreground, borderColor: colors.border, fontFamily: 'Inter_400Regular' }]}
            placeholder="BN/2024/XXXX"
            placeholderTextColor={colors.mutedForeground}
            value={regNumber}
            onChangeText={setRegNumber}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.fieldLabel, { color: colors.foreground, fontFamily: 'Inter_500Medium' }]}>Tax PIN</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.muted, color: colors.foreground, borderColor: colors.border, fontFamily: 'Inter_400Regular' }]}
            placeholder="AXXXXXXX"
            placeholderTextColor={colors.mutedForeground}
            value={taxPin}
            onChangeText={setTaxPin}
            autoCapitalize="characters"
          />
        </View>
      </View>

      <Text style={[styles.fieldLabel, { color: colors.foreground, fontFamily: 'Inter_500Medium' }]}>Business Category</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
        <View style={{ flexDirection: 'row', gap: 8, paddingRight: 8 }}>
          {BUSINESS_CATEGORIES.map((c) => (
            <TouchableOpacity
              key={c}
              onPress={() => setCategory(c)}
              style={[styles.pill, { backgroundColor: category === c ? colors.primary : colors.muted, borderRadius: 99 }]}
            >
              <Text style={[styles.pillText, { color: category === c ? '#fff' : colors.foreground, fontFamily: category === c ? 'Inter_600SemiBold' : 'Inter_400Regular' }]}>
                {c}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <Text style={[styles.fieldLabel, { color: colors.foreground, fontFamily: 'Inter_500Medium' }]}>Business Address</Text>
      <TextInput
        style={[styles.input, { backgroundColor: colors.muted, color: colors.foreground, borderColor: colors.border, fontFamily: 'Inter_400Regular' }]}
        placeholder="e.g., Tom Mboya St, Nairobi"
        placeholderTextColor={colors.mutedForeground}
        value={address}
        onChangeText={setAddress}
      />

      <TouchableOpacity
        onPress={() => {
          if (!bizName) { Alert.alert('Required', 'Please enter your business name.'); return; }
          setStep('upload_docs');
        }}
        style={[styles.nextBtn, { backgroundColor: colors.primary }]}
      >
        <Text style={[styles.nextBtnText, { fontFamily: 'Inter_700Bold' }]}>Continue →</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderUploadDocs = () => (
    <ScrollView contentContainerStyle={styles.stepContent}>
      <Text style={[styles.stepTitle, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>Upload Documents</Text>
      <Text style={[styles.stepSub, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
        We need these to verify your business
      </Text>

      {[
        { label: 'Owner / Director ID', sublabel: 'National ID, Passport or Driving Licence', uri: ownerIdUri, setter: (u: string) => setOwnerIdUri(u), required: true },
        { label: 'Business Registration', sublabel: 'Certificate of Incorporation or BN', uri: bizRegUri, setter: (u: string) => setBizRegUri(u), required: true },
        { label: 'Business Logo', sublabel: 'PNG or JPG, min 500×500px', uri: logoUri, setter: (u: string) => setLogoUri(u), required: false },
      ].map((doc) => (
        <View key={doc.label} style={styles.docItem}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.docLabel, { color: colors.foreground, fontFamily: 'Inter_600SemiBold' }]}>
              {doc.label}{doc.required && ' *'}
            </Text>
            <Text style={[styles.docSub, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>{doc.sublabel}</Text>
          </View>
          {doc.uri ? (
            <TouchableOpacity onPress={() => pickDocument(doc.setter)} style={styles.docPreviewWrap}>
              <Image source={{ uri: doc.uri }} style={styles.docPreview} />
              <View style={[styles.docReplace, { backgroundColor: colors.primary }]}>
                <Feather name="refresh-cw" size={12} color="#fff" />
              </View>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => pickDocument(doc.setter)}
              style={[styles.docUploadBtn, { backgroundColor: colors.primary + '15', borderColor: colors.primary + '40' }]}
            >
              <Feather name="upload" size={18} color={colors.primary} />
              <Text style={[styles.docUploadText, { color: colors.primary, fontFamily: 'Inter_600SemiBold' }]}>Upload</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}

      <View style={[styles.infoBox, { backgroundColor: colors.primary + '10', borderColor: colors.primary + '30' }]}>
        <Feather name="shield" size={16} color={colors.primary} />
        <Text style={[styles.infoBoxText, { color: colors.primary, fontFamily: 'Inter_400Regular' }]}>
          {'  '}Your documents are encrypted and stored securely. We never share them with third parties.
        </Text>
      </View>

      <TouchableOpacity
        onPress={() => {
          if (!ownerIdUri || !bizRegUri) { Alert.alert('Required', 'Please upload your ID and business registration.'); return; }
          setStep('review');
        }}
        style={[styles.nextBtn, { backgroundColor: colors.primary }]}
      >
        <Text style={[styles.nextBtnText, { fontFamily: 'Inter_700Bold' }]}>Review & Submit →</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setStep('business_info')} style={styles.backLink}>
        <Text style={[styles.backLinkText, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>← Back</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderReview = () => (
    <ScrollView contentContainerStyle={styles.stepContent}>
      <Text style={[styles.stepTitle, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>Review & Submit</Text>
      <Text style={[styles.stepSub, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
        Confirm your information before submitting
      </Text>

      <View style={[styles.reviewCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.reviewSection, { color: colors.primary, fontFamily: 'Inter_700Bold' }]}>Business Details</Text>
        {[
          { label: 'Business Type', value: bizType },
          { label: 'Business Name', value: bizName || '—' },
          { label: 'Registration No.', value: regNumber || '—' },
          { label: 'Tax PIN', value: taxPin || '—' },
          { label: 'Category', value: category },
          { label: 'Address', value: address || '—' },
        ].map((row) => (
          <View key={row.label} style={[styles.reviewRow, { borderTopColor: colors.border }]}>
            <Text style={[styles.reviewLabel, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>{row.label}</Text>
            <Text style={[styles.reviewValue, { color: colors.foreground, fontFamily: 'Inter_500Medium' }]}>{row.value}</Text>
          </View>
        ))}
      </View>

      <View style={[styles.reviewCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.reviewSection, { color: colors.primary, fontFamily: 'Inter_700Bold' }]}>Documents</Text>
        {[
          { label: 'Owner ID', uri: ownerIdUri },
          { label: 'Business Reg.', uri: bizRegUri },
          { label: 'Logo', uri: logoUri },
        ].map((d) => (
          <View key={d.label} style={[styles.reviewRow, { borderTopColor: colors.border }]}>
            <Text style={[styles.reviewLabel, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>{d.label}</Text>
            {d.uri ? (
              <View style={styles.reviewDocRow}>
                <Image source={{ uri: d.uri }} style={styles.reviewDocThumb} />
                <Feather name="check-circle" size={14} color="#22C55E" />
              </View>
            ) : (
              <Text style={[styles.reviewValue, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>Not uploaded</Text>
            )}
          </View>
        ))}
      </View>

      <TouchableOpacity
        onPress={() => {
          if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          setStep('pending');
        }}
        style={[styles.nextBtn, { backgroundColor: colors.primary }]}
      >
        <Text style={[styles.nextBtnText, { fontFamily: 'Inter_700Bold' }]}>Submit for Verification</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setStep('upload_docs')} style={styles.backLink}>
        <Text style={[styles.backLinkText, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>← Back</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderPending = () => (
    <View style={styles.centeredStep}>
      <View style={[styles.pendingIcon, { backgroundColor: '#F59E0B15' }]}>
        <Feather name="clock" size={40} color="#F59E0B" />
      </View>
      <Text style={[styles.centeredTitle, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>Under Review</Text>
      <Text style={[styles.centeredSub, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
        Your documents are being verified. This usually takes 1–2 business hours.
      </Text>

      <View style={[styles.pendingCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {[
          { label: 'Business Info', status: 'completed' },
          { label: 'Documents Uploaded', status: 'completed' },
          { label: 'Identity Verification', status: 'in_progress' },
          { label: 'Business Registration', status: 'pending' },
          { label: 'Final Approval', status: 'pending' },
        ].map((item, i) => (
          <View key={i} style={[styles.pendingRow, i > 0 && { borderTopColor: colors.border, borderTopWidth: 1 }]}>
            <View style={[
              styles.pendingDot,
              item.status === 'completed' ? { backgroundColor: '#22C55E' } :
              item.status === 'in_progress' ? { backgroundColor: '#F59E0B' } :
              { backgroundColor: colors.border },
            ]} />
            <Text style={[styles.pendingLabel, { color: item.status === 'pending' ? colors.mutedForeground : colors.foreground, fontFamily: 'Inter_400Regular' }]}>
              {item.label}
            </Text>
            {item.status === 'completed' && <Feather name="check" size={14} color="#22C55E" />}
            {item.status === 'in_progress' && (
              <Text style={[styles.pendingStatus, { color: '#F59E0B', fontFamily: 'Inter_500Medium' }]}>In Progress</Text>
            )}
          </View>
        ))}
      </View>

      {/* Simulate approval */}
      <TouchableOpacity onPress={() => setStep('verified')} style={[styles.nextBtn, { backgroundColor: colors.primary }]}>
        <Text style={[styles.nextBtnText, { fontFamily: 'Inter_700Bold' }]}>Simulate: View Verified ✓</Text>
      </TouchableOpacity>
    </View>
  );

  const renderVerified = () => (
    <View style={styles.centeredStep}>
      <LinearGradient colors={['#25D366', '#128C7E']} style={styles.verifiedIcon}>
        <Feather name="check" size={44} color="#fff" />
      </LinearGradient>
      <Text style={[styles.centeredTitle, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>
        Business Verified{'\n'}Congratulations! 🎉
      </Text>
      <Text style={[styles.centeredSub, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
        Your business has been verified. You can now start selling on StatusSeller.
      </Text>

      <View style={[styles.pendingCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {[
          'Business account created',
          'M-Pesa payments enabled',
          'Shop link generated',
          'AI Sales Assistant activated',
        ].map((item, i) => (
          <View key={i} style={[styles.pendingRow, i > 0 && { borderTopColor: colors.border, borderTopWidth: 1 }]}>
            <View style={[styles.pendingDot, { backgroundColor: '#22C55E' }]} />
            <Text style={[styles.pendingLabel, { color: colors.foreground, fontFamily: 'Inter_400Regular' }]}>{item}</Text>
            <Feather name="check" size={14} color="#22C55E" />
          </View>
        ))}
      </View>

      <TouchableOpacity onPress={() => setStep('setup')} style={[styles.nextBtn, { backgroundColor: colors.primary }]}>
        <Text style={[styles.nextBtnText, { fontFamily: 'Inter_700Bold' }]}>Set Up Your Business →</Text>
      </TouchableOpacity>
    </View>
  );

  const renderSetup = () => (
    <ScrollView contentContainerStyle={styles.stepContent}>
      <Text style={[styles.stepTitle, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>Business Setup</Text>
      <Text style={[styles.stepSub, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
        Complete these steps to start selling
      </Text>

      <View style={styles.setupProgress}>
        <Text style={[styles.setupProgressText, { color: colors.primary, fontFamily: 'Inter_600SemiBold' }]}>
          {setupItems.filter((i) => i.done).length}/{setupItems.length} completed
        </Text>
        <View style={[styles.setupProgressBar, { backgroundColor: colors.border }]}>
          <View style={[styles.setupProgressFill, { backgroundColor: colors.primary, width: `${(setupItems.filter((i) => i.done).length / setupItems.length) * 100}%` }]} />
        </View>
      </View>

      {setupItems.map((item) => (
        <TouchableOpacity
          key={item.id}
          onPress={() => setSetupItems((prev) => prev.map((i) => i.id === item.id ? { ...i, done: true } : i))}
          style={[styles.setupCard, { backgroundColor: colors.card, borderColor: item.done ? colors.primary : colors.border }]}
        >
          <View style={[styles.setupIcon, { backgroundColor: item.color + '15' }]}>
            <Feather name={item.icon} size={22} color={item.done ? '#22C55E' : item.color} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.setupTitle, { color: colors.foreground, fontFamily: 'Inter_600SemiBold' }]}>{item.title}</Text>
            <Text style={[styles.setupSub, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>{item.subtitle}</Text>
          </View>
          {item.done ? (
            <View style={[styles.setupDoneBadge, { backgroundColor: '#22C55E15' }]}>
              <Feather name="check-circle" size={18} color="#22C55E" />
            </View>
          ) : (
            <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
          )}
        </TouchableOpacity>
      ))}

      <TouchableOpacity
        onPress={() => router.replace('/(tabs)' as any)}
        style={[styles.nextBtn, { backgroundColor: setupItems.filter((i) => i.done).length >= 2 ? colors.primary : colors.border }]}
      >
        <Text style={[styles.nextBtnText, { fontFamily: 'Inter_700Bold' }]}>
          {setupItems.every((i) => i.done) ? 'Start Selling 🚀' : 'Continue to Dashboard →'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topInset + 16, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => {
            if (step === 'business_info') router.back();
            else if (step === 'upload_docs') setStep('business_info');
            else if (step === 'review') setStep('upload_docs');
          }}
          style={styles.backBtn}
        >
          {step !== 'pending' && step !== 'verified' && step !== 'setup' && (
            <Feather name="arrow-left" size={22} color={colors.foreground} />
          )}
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTitle, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>
            {step === 'pending' ? 'Verification Status' :
             step === 'verified' ? 'Verified ✓' :
             step === 'setup' ? 'Business Setup' :
             'Verify Business'}
          </Text>
        </View>
        {/* Step indicator */}
        {stepIndex < 3 && (
          <View style={styles.stepDots}>
            {[0, 1, 2].map((i) => (
              <View
                key={i}
                style={[
                  styles.stepDot,
                  { backgroundColor: i <= stepIndex ? colors.primary : colors.border },
                ]}
              />
            ))}
          </View>
        )}
      </View>

      {/* Progress bar */}
      {stepIndex < 3 && (
        <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
          <View style={[styles.progressFill, { backgroundColor: colors.primary, width: `${((stepIndex + 1) / totalSteps) * 100}%` }]} />
        </View>
      )}

      {step === 'business_info' && renderBusinessInfo()}
      {step === 'upload_docs' && renderUploadDocs()}
      {step === 'review' && renderReview()}
      {step === 'pending' && renderPending()}
      {step === 'verified' && renderVerified()}
      {step === 'setup' && renderSetup()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1 },
  backBtn: { width: 32, padding: 4 },
  headerTitle: { fontSize: 18 },
  stepDots: { flexDirection: 'row', gap: 5 },
  stepDot: { width: 8, height: 8, borderRadius: 4 },
  progressBar: { height: 3, marginHorizontal: 0 },
  progressFill: { height: 3, borderRadius: 1.5 },
  stepContent: { padding: 20, paddingBottom: 60 },
  stepTitle: { fontSize: 22, marginBottom: 6 },
  stepSub: { fontSize: 14, marginBottom: 24, lineHeight: 20 },
  fieldLabel: { fontSize: 13, marginBottom: 8, marginTop: 4 },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  pill: { paddingHorizontal: 14, paddingVertical: 8 },
  pillText: { fontSize: 13 },
  input: { borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, marginBottom: 4 },
  row: { flexDirection: 'row', gap: 12 },
  docItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, gap: 12, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  docLabel: { fontSize: 14 },
  docSub: { fontSize: 12, marginTop: 2 },
  docPreviewWrap: { position: 'relative' },
  docPreview: { width: 56, height: 56, borderRadius: 10 },
  docReplace: { position: 'absolute', bottom: 0, right: 0, width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  docUploadBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, borderWidth: 1 },
  docUploadText: { fontSize: 13 },
  infoBox: { flexDirection: 'row', alignItems: 'flex-start', borderRadius: 12, borderWidth: 1, padding: 12, marginTop: 16, marginBottom: 8 },
  infoBoxText: { fontSize: 13, lineHeight: 18, flex: 1 },
  nextBtn: { padding: 16, borderRadius: 16, alignItems: 'center', marginTop: 20 },
  nextBtnText: { fontSize: 16, color: '#fff' },
  backLink: { alignItems: 'center', marginTop: 12, padding: 8 },
  backLinkText: { fontSize: 14 },
  reviewCard: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 16 },
  reviewSection: { fontSize: 13, letterSpacing: 0.5, marginBottom: 8 },
  reviewRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderTopWidth: 1 },
  reviewLabel: { fontSize: 13 },
  reviewValue: { fontSize: 13 },
  reviewDocRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  reviewDocThumb: { width: 36, height: 36, borderRadius: 8 },
  centeredStep: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28 },
  pendingIcon: { width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  verifiedIcon: { width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  centeredTitle: { fontSize: 24, textAlign: 'center', marginBottom: 10, lineHeight: 32 },
  centeredSub: { fontSize: 14, textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  pendingCard: { borderRadius: 16, borderWidth: 1, padding: 0, width: '100%', marginBottom: 24, overflow: 'hidden' },
  pendingRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14 },
  pendingDot: { width: 10, height: 10, borderRadius: 5, flexShrink: 0 },
  pendingLabel: { flex: 1, fontSize: 14 },
  pendingStatus: { fontSize: 12 },
  setupProgress: { marginBottom: 20 },
  setupProgressText: { fontSize: 13, marginBottom: 8 },
  setupProgressBar: { height: 6, borderRadius: 3, overflow: 'hidden' },
  setupProgressFill: { height: 6, borderRadius: 3 },
  setupCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, borderWidth: 1.5, padding: 16, gap: 14, marginBottom: 10 },
  setupIcon: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  setupTitle: { fontSize: 15 },
  setupSub: { fontSize: 12, marginTop: 2 },
  setupDoneBadge: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
});
