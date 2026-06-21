import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Linking,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, FontSize, BorderRadius, Shadow } from '../src/constants/theme';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

interface FAQItem {
  q: string;
  a: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    q: 'How do I verify my account?',
    a: 'Go to Profile → Verification and submit your NIN and Redan Certificate. Verification is reviewed within 24–48 hours.',
  },
  {
    q: 'What is an Access Fee?',
    a: 'A one-time platform fee that unlocks full listing details including agent contact, exact location, and documents. It is not a deposit on the land.',
  },
  {
    q: 'How do I book an inspection?',
    a: 'Open any listing and tap "Book Inspection". Choose a preferred date and time; the agent will confirm or suggest an alternative.',
  },
  {
    q: 'Can I list my own land on Landrush?',
    a: 'Yes. Tap the "+" button on the bottom tab bar to start the Create Listing flow. Your listing will be reviewed before going live.',
  },
  {
    q: 'How do I cancel a booking?',
    a: 'Go to Bookings → Pending and tap "Cancel" on the relevant card. Cancellations at least 24 hours before the inspection are free.',
  },
  {
    q: 'Is my payment information secure?',
    a: 'Yes. Landrush uses PCI-compliant payment processing. We never store your card details on our servers.',
  },
  {
    q: 'How do I report a suspicious listing?',
    a: 'Open the listing, scroll to the bottom, and tap "Report Listing". Our team reviews reports within 12 hours.',
  },
];

const CONTACT_ITEMS = [
  {
    icon: 'chatbubble-ellipses-outline' as const,
    label: 'Live Chat',
    subtitle: 'Typically replies in < 5 minutes',
    color: Colors.lime,
    onPress: () => {},
  },
  {
    icon: 'mail-outline' as const,
    label: 'Email Support',
    subtitle: 'support@landrush.ng',
    color: Colors.primary,
    onPress: () => Linking.openURL('mailto:support@landrush.ng'),
  },
  {
    icon: 'logo-whatsapp' as const,
    label: 'WhatsApp',
    subtitle: '+234 800 LANDRUSH',
    color: '#25D366',
    onPress: () => Linking.openURL('https://wa.me/2348001234567'),
  },
  {
    icon: 'call-outline' as const,
    label: 'Call Us',
    subtitle: 'Mon–Fri · 8 AM – 6 PM WAT',
    color: Colors.info,
    onPress: () => Linking.openURL('tel:+2348001234567'),
  },
];

export default function HelpScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const filteredFAQ = FAQ_ITEMS.filter(
    (item) =>
      item.q.toLowerCase().includes(search.toLowerCase()) ||
      item.a.toLowerCase().includes(search.toLowerCase()),
  );

  const toggleFAQ = (i: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenIndex(openIndex === i ? null : i);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Help & Support</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Hero banner */}
        <View style={styles.heroBanner}>
          <Ionicons name="headset-outline" size={36} color={Colors.lime} />
          <Text style={styles.heroTitle}>How can we help?</Text>
          <Text style={styles.heroSub}>Search our FAQ or reach us directly below.</Text>
        </View>

        {/* FAQ search */}
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={18} color={Colors.textTertiary} />
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Search questions..."
            placeholderTextColor={Colors.textTertiary}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color={Colors.textTertiary} />
            </TouchableOpacity>
          )}
        </View>

        {/* FAQ accordion */}
        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>

        {filteredFAQ.length === 0 ? (
          <View style={styles.noResults}>
            <Ionicons name="search-outline" size={32} color={Colors.textTertiary} />
            <Text style={styles.noResultsText}>No results for "{search}"</Text>
          </View>
        ) : (
          <View style={styles.faqList}>
            {filteredFAQ.map((item, i) => (
              <TouchableOpacity
                key={i}
                style={styles.faqItem}
                onPress={() => toggleFAQ(i)}
                activeOpacity={0.8}
              >
                <View style={styles.faqRow}>
                  <Text style={styles.faqQuestion}>{item.q}</Text>
                  <Ionicons
                    name={openIndex === i ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color={Colors.textSecondary}
                  />
                </View>
                {openIndex === i && (
                  <Text style={styles.faqAnswer}>{item.a}</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Contact options */}
        <Text style={[styles.sectionTitle, { marginTop: Spacing.xxl }]}>Contact Us</Text>

        <View style={styles.contactGrid}>
          {CONTACT_ITEMS.map((item) => (
            <TouchableOpacity
              key={item.label}
              style={styles.contactCard}
              onPress={item.onPress}
              activeOpacity={0.8}
            >
              <View style={[styles.contactIcon, { backgroundColor: `${item.color}18` }]}>
                <Ionicons name={item.icon} size={24} color={item.color} />
              </View>
              <Text style={styles.contactLabel}>{item.label}</Text>
              <Text style={styles.contactSub}>{item.subtitle}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Version / legal footer */}
        <View style={styles.footer}>
          <TouchableOpacity onPress={() => {}}>
            <Text style={styles.footerLink}>Terms of Service</Text>
          </TouchableOpacity>
          <Text style={styles.footerDot}>·</Text>
          <TouchableOpacity onPress={() => {}}>
            <Text style={styles.footerLink}>Privacy Policy</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.version}>Landrush v1.0.0</Text>

        <View style={{ height: Spacing.huge }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    backgroundColor: Colors.white,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.borderLight,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.chipInactive,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  content: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
  },
  heroBanner: {
    backgroundColor: Colors.splashBg,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xxl,
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  heroTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.white,
    marginTop: Spacing.sm,
  },
  heroSub: {
    fontSize: FontSize.md,
    color: 'rgba(255,255,255,0.65)',
    textAlign: 'center',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.xl,
    ...Shadow.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  noResults: {
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.xxl,
  },
  noResultsText: {
    fontSize: FontSize.md,
    color: Colors.textTertiary,
  },
  faqList: {
    gap: Spacing.sm,
  },
  faqItem: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...Shadow.sm,
  },
  faqRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  faqQuestion: {
    flex: 1,
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  faqAnswer: {
    marginTop: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  contactGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  contactCard: {
    width: '47%',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    gap: Spacing.sm,
    ...Shadow.sm,
  },
  contactIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactLabel: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  contactSub: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.xxxl,
  },
  footerLink: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    fontWeight: '500',
  },
  footerDot: {
    fontSize: FontSize.sm,
    color: Colors.textTertiary,
  },
  version: {
    textAlign: 'center',
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    marginTop: Spacing.sm,
  },
});
