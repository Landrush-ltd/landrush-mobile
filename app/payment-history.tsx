import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Spacing, FontSize, BorderRadius, Shadow } from '../src/constants/theme';
import type { ThemeColors } from '../src/constants/theme';
import { useColors } from '../src/context/ThemeContext';

type PaymentType = 'access_fee' | 'listing_fee';
type PaymentStatus = 'success' | 'failed' | 'pending';

interface PaymentRecord {
  id: string;
  type: PaymentType;
  amount: number;
  status: PaymentStatus;
  reference: string;
  date: string;
  description: string;
}

const TYPE_LABEL: Record<PaymentType, string> = {
  access_fee: 'Access Fee',
  listing_fee: 'Listing Fee',
};

const mockPayments: PaymentRecord[] = [
  {
    id: 'p1',
    type: 'access_fee',
    amount: 5000,
    status: 'success',
    reference: 'LDR-20240512-001',
    date: 'Mon, 12 May 2025 · 10:45 AM',
    description: 'One-time platform access fee',
  },
  {
    id: 'p2',
    type: 'listing_fee',
    amount: 2500,
    status: 'success',
    reference: 'LDR-20240520-002',
    date: 'Mon, 20 May 2025 · 2:10 PM',
    description: '12 Acres of Farmland — listing publish fee',
  },
  {
    id: 'p3',
    type: 'listing_fee',
    amount: 2500,
    status: 'failed',
    reference: 'LDR-20240601-003',
    date: 'Sun, 1 Jun 2025 · 9:00 AM',
    description: '5 Plots Industrial Zone — listing publish fee',
  },
];

export default function PaymentHistoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const STATUS_CONFIG: Record<PaymentStatus, { label: string; color: string; bg: string; icon: string }> = {
    success: { label: 'Successful', color: colors.success, bg: '#E8F5E9', icon: 'checkmark-circle' },
    failed:  { label: 'Failed',     color: colors.error,   bg: '#FFEBEE', icon: 'close-circle' },
    pending: { label: 'Pending',    color: '#E65100',      bg: '#FFF3E0', icon: 'time' },
  };

  const total = mockPayments
    .filter((p) => p.status === 'success')
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <View style={styles.container}>
      {/* Header + summary merged */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
        <View style={styles.headerDecoA} />
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={20} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Payment History</Text>
          <View style={{ width: 36 }} />
        </View>

        {/* Summary card inline */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total spent</Text>
          <Text style={styles.summaryAmount}>₦{total.toLocaleString()}</Text>
          <Text style={styles.summaryNote}>Platform fees only · Land transaction payments not included</Text>
        </View>
      </View>

      <FlatList
        data={mockPayments}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={48} color={colors.textTertiary} />
            <Text style={styles.emptyTitle}>No Payments Yet</Text>
            <Text style={styles.emptySubtitle}>Your payment receipts will appear here.</Text>
          </View>
        }
        renderItem={({ item }) => {
          const status = STATUS_CONFIG[item.status];
          return (
            <View style={styles.card}>
              <View style={styles.cardLeft}>
                <View style={[styles.iconCircle, { backgroundColor: status.bg }]}>
                  <Ionicons name={status.icon as any} size={22} color={status.color} />
                </View>
              </View>
              <View style={styles.cardBody}>
                <View style={styles.cardTop}>
                  <Text style={styles.cardType}>{TYPE_LABEL[item.type]}</Text>
                  <Text style={styles.cardAmount}>₦{item.amount.toLocaleString()}</Text>
                </View>
                <Text style={styles.cardDesc} numberOfLines={1}>{item.description}</Text>
                <View style={styles.cardBottom}>
                  <Text style={styles.cardDate}>{item.date}</Text>
                  <View style={[styles.statusPill, { backgroundColor: status.bg }]}>
                    <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
                  </View>
                </View>
                <Text style={styles.cardRef}>Ref: {item.reference}</Text>
              </View>
            </View>
          );
        }}
        ListFooterComponent={<View style={{ height: Spacing.huge }} />}
      />
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
    title: {
      fontSize: FontSize.xl,
      fontWeight: '800',
      color: colors.textPrimary,
    },
    summaryCard: {
      backgroundColor: 'rgba(255,255,255,0.1)',
      borderRadius: BorderRadius.xl,
      padding: Spacing.xl,
      gap: Spacing.sm,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.12)',
    },
    summaryLabel: {
      fontSize: FontSize.sm,
      color: colors.textSecondary,
      fontWeight: '500',
    },
    summaryAmount: {
      fontSize: FontSize.xxxl,
      fontWeight: '800',
      color: colors.lime,
    },
    summaryNote: {
      fontSize: FontSize.xs,
      color: colors.textSecondary,
      marginTop: Spacing.xs,
      lineHeight: 16,
    },
    list: {
      paddingHorizontal: Spacing.xl,
      gap: Spacing.md,
    },
    card: {
      flexDirection: 'row',
      gap: Spacing.md,
      backgroundColor: colors.white,
      borderRadius: BorderRadius.lg,
      padding: Spacing.lg,
      ...Shadow.sm,
    },
    cardLeft: {
      alignItems: 'center',
      paddingTop: 2,
    },
    iconCircle: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cardBody: {
      flex: 1,
      gap: 4,
    },
    cardTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    cardType: {
      fontSize: FontSize.md,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    cardAmount: {
      fontSize: FontSize.md,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    cardDesc: {
      fontSize: FontSize.sm,
      color: colors.textSecondary,
    },
    cardBottom: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 2,
    },
    cardDate: {
      fontSize: FontSize.xs,
      color: colors.textTertiary,
    },
    statusPill: {
      paddingHorizontal: Spacing.sm,
      paddingVertical: 2,
      borderRadius: BorderRadius.full,
    },
    statusText: {
      fontSize: FontSize.xs,
      fontWeight: '600',
    },
    cardRef: {
      fontSize: FontSize.xs,
      color: colors.textTertiary,
      fontFamily: 'monospace',
      marginTop: 2,
    },
    emptyState: {
      alignItems: 'center',
      paddingVertical: Spacing.huge * 2,
      gap: Spacing.md,
    },
    emptyTitle: {
      fontSize: FontSize.xl,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    emptySubtitle: {
      fontSize: FontSize.md,
      color: colors.textSecondary,
      textAlign: 'center',
    },
  });
}
