import React, { useState, useMemo } from 'react';
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
import { Spacing, FontSize, BorderRadius, Shadow } from '../src/constants/theme';
import type { ThemeColors } from '../src/constants/theme';
import { useColors } from '../src/context/ThemeContext';

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

export default function HelpScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [search, setSearch] = useState('');
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const CONTACT_ITEMS = [
    {
      icon: 'chatbubble-ellipses-outline' as const,
      label: 'Live Chat',
      subtitle: 'Typically replies in < 5 minutes',
      color: colors.lime,
      onPress: () => {},
    },
    {
      icon: 'mail-outline' as const,
      label: 'Email Support',
      subtitle: 'support@landrush.ng',
      color: colors.primary,
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
      color: colors.info,
      onPress: () => Linking.openURL('tel:+2348001234567'),
    },
  ];

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
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
        <View style={styles.headerDecoA} />
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={20} color={colors.textPrimary} />
          </TouchableOpacity>
          <View style={{ alignItems: 'center' }}>
            <Text style={styles.title}>Help & Support</Text>
            <Text style={styles.headerSub}>We're here to help</Text>
          </View>
          <View style={styles.headsetCircle}>
            <Ionicons name="headset-outline" size={18} color={colors.lime} />
          </View>
        </View>

        {/* Inline search */}
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={18} color="rgba(255,255,255,0.5)" />
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Search questions…"
            placeholderTextColor="rgba(255,255,255,0.4)"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color="rgba(255,255,255,0.5)" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* FAQ accordion */}
        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>

        {filteredFAQ.length === 0 ? (
          <View style={styles.noResults}>
            <Ionicons name="search-outline" size={32} color={colors.textTertiary} />
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
                    color={colors.textSecondary}
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

function makeStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      backgroundColor: colors.white,
      paddingHorizontal: Spacing.lg,
      paddingBottom: Spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
    },
    headerDecoA: {
      position: 'absolute',
      width: 160,
      height: 160,
      borderRadius: 80,
      backgroundColor: 'transparent',
      top: -60,
      right: -40,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: Spacing.md,
      marginBottom: Spacing.lg,
    },
    backButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: 'rgba(255,255,255,0.12)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    headsetCircle: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: 'rgba(159,187,68,0.18)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      fontSize: FontSize.xl,
      fontWeight: '800',
      color: colors.textPrimary,
    },
    headerSub: {
      fontSize: FontSize.xs,
      color: colors.textSecondary,
      marginTop: 1,
    },
    content: {
      paddingHorizontal: Spacing.xl,
      paddingTop: Spacing.xl,
    },
    searchBox: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
      backgroundColor: 'rgba(255,255,255,0.12)',
      borderRadius: BorderRadius.xl,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.15)',
      paddingHorizontal: Spacing.lg,
      height: 44,
    },
    searchInput: {
      flex: 1,
      fontSize: FontSize.md,
      color: colors.white,
    },
    sectionTitle: {
      fontSize: FontSize.lg,
      fontWeight: '700',
      color: colors.textPrimary,
      marginBottom: Spacing.md,
    },
    noResults: {
      alignItems: 'center',
      gap: Spacing.md,
      paddingVertical: Spacing.xxl,
    },
    noResultsText: {
      fontSize: FontSize.md,
      color: colors.textTertiary,
    },
    faqList: {
      gap: Spacing.sm,
    },
    faqItem: {
      backgroundColor: colors.white,
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
      color: colors.textPrimary,
      lineHeight: 20,
    },
    faqAnswer: {
      marginTop: Spacing.md,
      fontSize: FontSize.md,
      color: colors.textSecondary,
      lineHeight: 22,
    },
    contactGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: Spacing.md,
    },
    contactCard: {
      width: '47%',
      backgroundColor: colors.white,
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
      color: colors.textPrimary,
    },
    contactSub: {
      fontSize: FontSize.xs,
      color: colors.textSecondary,
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
      color: colors.primary,
      fontWeight: '500',
    },
    footerDot: {
      fontSize: FontSize.sm,
      color: colors.textTertiary,
    },
    version: {
      textAlign: 'center',
      fontSize: FontSize.xs,
      color: colors.textTertiary,
      marginTop: Spacing.sm,
    },
  });
}
