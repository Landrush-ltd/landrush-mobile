import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Spacing, FontSize, FontFamily, BorderRadius, Shadow, LetterSpacing } from '../../src/constants/theme';
import type { ThemeColors } from '../../src/constants/theme';
import { useColors } from '../../src/context/ThemeContext';
import { useBookings, useCancelBooking } from '../../src/hooks/useBookings';
import type { Booking } from '../../src/hooks/useBookings';

type BookingStatus = Booking['status'];
type FilterTab = 'pending' | 'upcoming' | 'past';

const TABS: { key: FilterTab; label: string; count: (b: Booking[]) => number }[] = [
  { key: 'pending',  label: 'Pending',  count: (b) => b.filter((x) => x.status === 'pending' || x.status === 'rescheduled').length },
  { key: 'upcoming', label: 'Upcoming', count: (b) => b.filter((x) => x.status === 'upcoming').length },
  { key: 'past',     label: 'Past',     count: (b) => b.filter((x) => x.status === 'past' || x.status === 'cancelled').length },
];

export default function BookingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<FilterTab>('pending');
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { data: bookings = [], isLoading } = useBookings();
  const cancelBooking = useCancelBooking();

  const STATUS: Record<BookingStatus, { label: string; color: string; bg: string; icon: string }> = {
    pending:     { label: 'Pending Confirmation', color: '#E65100', bg: '#FFF3E0', icon: 'time-outline' },
    upcoming:    { label: 'Confirmed',            color: colors.primary, bg: `${colors.lime}22`, icon: 'checkmark-circle-outline' },
    rescheduled: { label: 'Reschedule Requested', color: '#5C6BC0', bg: '#EDE7F6', icon: 'refresh-outline' },
    past:        { label: 'Completed',            color: colors.info, bg: '#E3F2FD', icon: 'archive-outline' },
    cancelled:   { label: 'Cancelled',            color: colors.error, bg: '#FFEBEE', icon: 'close-circle-outline' },
  };

  const filtered = bookings.filter((b) => {
    if (activeTab === 'pending')  return b.status === 'pending' || b.status === 'rescheduled';
    if (activeTab === 'upcoming') return b.status === 'upcoming';
    return b.status === 'past' || b.status === 'cancelled';
  });

  return (
    <View style={styles.root}>
      {/* White header */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
        <Text style={styles.headerTitle}>Bookings</Text>
        <Text style={styles.headerSub}>{bookings.length} inspection requests</Text>
        <View style={styles.tabRow}>
          {TABS.map((tab) => {
            const count  = tab.count(bookings);
            const active = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[styles.tab, active && styles.tabActive]}
                onPress={() => setActiveTab(tab.key)}
              >
                <Text style={[styles.tabText, active && styles.tabTextActive]}>{tab.label}</Text>
                {count > 0 && (
                  <View style={[styles.tabBadge, active && styles.tabBadgeActive]}>
                    <Text style={[styles.tabBadgeText, active && styles.tabBadgeTextActive]}>{count}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Ionicons name="calendar-outline" size={40} color={colors.textTertiary} />
            </View>
            <Text style={styles.emptyTitle}>
              No {activeTab} bookings
            </Text>
            <Text style={styles.emptySub}>
              {activeTab === 'past'
                ? 'Completed inspections will appear here'
                : 'Book an inspection from any listing to get started'}
            </Text>
            {activeTab !== 'past' && (
              <TouchableOpacity style={styles.emptyBtn} onPress={() => router.push('/(tabs)')}>
                <Text style={styles.emptyBtnText}>Discover Listings</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          filtered.map((booking) => {
            const s = STATUS[booking.status];
            return (
              <TouchableOpacity key={booking.id} style={styles.card} activeOpacity={0.92}>
                {/* Hero image */}
                <View style={styles.cardImageWrap}>
                  <Image source={{ uri: booking.listingImage }} style={styles.cardImage} />
                  {/* Status chip overlay */}
                  <View style={[styles.statusChip, { backgroundColor: s.bg }]}>
                    <Ionicons name={s.icon as any} size={12} color={s.color} />
                    <Text style={[styles.statusText, { color: s.color }]}>{s.label}</Text>
                  </View>
                  <Text style={styles.cardPrice}>{booking.price}</Text>
                </View>

                {/* Body */}
                <View style={styles.cardBody}>
                  <Text style={styles.cardTitle} numberOfLines={1}>{booking.listingTitle}</Text>

                  <View style={styles.metaGrid}>
                    <View style={styles.metaItem}>
                      <Ionicons name="location-outline" size={13} color={colors.textTertiary} />
                      <Text style={styles.metaText} numberOfLines={1}>{booking.location}</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Ionicons name="calendar-outline" size={13} color={colors.textTertiary} />
                      <Text style={styles.metaText}>{booking.date}</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Ionicons name="time-outline" size={13} color={colors.textTertiary} />
                      <Text style={styles.metaText}>{booking.time}</Text>
                    </View>
                  </View>

                  {/* Agent row */}
                  <View style={styles.agentRow}>
                    <Image source={{ uri: booking.agentAvatar }} style={styles.agentAvatar} />
                    <Text style={styles.agentName}>{booking.agentName}</Text>
                    <TouchableOpacity
                      style={styles.msgBtn}
                      onPress={() => router.push({ pathname: '/chat/[conversationId]', params: { conversationId: 'conv-1' } })}
                    >
                      <Ionicons name="chatbubble-outline" size={14} color={colors.primary} />
                      <Text style={styles.msgBtnText}>Message</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Action buttons */}
                  {(booking.status === 'pending' || booking.status === 'rescheduled') && (
                    <View style={styles.actionRow}>
                      <TouchableOpacity
                        style={styles.acceptBtn}
                        onPress={() => Alert.alert('Booking Accepted', 'Your inspection has been confirmed.')}
                      >
                        <Ionicons name="checkmark" size={16} color={colors.textPrimary} />
                        <Text style={styles.acceptBtnText}>Accept</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.rescheduleBtn}
                        onPress={() => Alert.alert('Reschedule', 'Reschedule flow coming soon.')}
                      >
                        <Text style={styles.rescheduleBtnText}>Reschedule</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.cancelBtn}
                        onPress={() =>
                          Alert.alert('Cancel Inspection?', 'This action cannot be undone.', [
                            { text: 'No', style: 'cancel' },
                            { text: 'Yes, Cancel', style: 'destructive', onPress: () => cancelBooking.mutate(booking.id) },
                          ])
                        }
                      >
                        <Text style={styles.cancelBtnText}>Cancel</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {booking.status === 'upcoming' && (
                    <TouchableOpacity
                      style={styles.calBtn}
                      onPress={() =>
                        Alert.alert(
                          'Added to Calendar',
                          `"${booking.listingTitle}" inspection on ${booking.date} at ${booking.time} has been added.`,
                        )
                      }
                    >
                      <Ionicons name="calendar-outline" size={15} color={colors.primary} />
                      <Text style={styles.calBtnText}>Add to Calendar</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </TouchableOpacity>
            );
          })
        )}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

function makeStyles(colors: ThemeColors) {
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: colors.background,
    },

    // ── Header ────────────────────────────────────────────────────
    header: {
      backgroundColor: colors.white,
      paddingHorizontal: Spacing.lg,
      paddingBottom: Spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
    },
    headerTitle: {
      fontSize: FontSize.xxl,
      fontFamily: FontFamily.extraBold,
      fontWeight: '800',
      color: colors.textPrimary,
      letterSpacing: LetterSpacing.tight,
      marginBottom: 2,
    },
    headerSub: {
      fontSize: FontSize.sm,
      color: colors.textSecondary,
      marginBottom: Spacing.md,
    },
    tabRow: {
      flexDirection: 'row',
      gap: Spacing.sm,
    },
    tab: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingHorizontal: Spacing.md,
      paddingVertical: 7,
      borderRadius: BorderRadius.full,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.borderLight,
    },
    tabActive: {
      backgroundColor: colors.textPrimary,
      borderColor: colors.textPrimary,
    },
    tabText: {
      fontSize: FontSize.sm,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    tabTextActive: {
      color: colors.white,
    },
    tabBadge: {
      backgroundColor: colors.border,
      borderRadius: BorderRadius.full,
      minWidth: 18,
      height: 18,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 4,
    },
    tabBadgeActive: {
      backgroundColor: 'rgba(255,255,255,0.25)',
    },
    tabBadgeText: {
      fontSize: 10,
      fontWeight: '700',
      color: colors.textSecondary,
    },
    tabBadgeTextActive: {
      color: colors.white,
    },

    // ── Scroll / Cards ────────────────────────────────────────────
    scroll: {
      flex: 1,
    },
    scrollContent: {
      padding: Spacing.lg,
      gap: Spacing.lg,
    },
    card: {
      backgroundColor: colors.white,
      borderRadius: BorderRadius.xl,
      overflow: 'hidden',
      ...Shadow.md,
    },
    cardImageWrap: {
      height: 160,
      position: 'relative',
    },
    cardImage: {
      width: '100%',
      height: '100%',
    },
    statusChip: {
      position: 'absolute',
      top: Spacing.md,
      left: Spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: Spacing.sm,
      paddingVertical: 4,
      borderRadius: BorderRadius.full,
    },
    statusText: {
      fontSize: FontSize.xs,
      fontWeight: '700',
    },
    cardPrice: {
      position: 'absolute',
      bottom: Spacing.md,
      right: Spacing.md,
      fontSize: FontSize.md,
      fontWeight: '800',
      color: colors.white,
      textShadowColor: 'rgba(0,0,0,0.5)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 3,
    },
    cardBody: {
      padding: Spacing.lg,
      gap: Spacing.md,
    },
    cardTitle: {
      fontSize: FontSize.lg,
      fontFamily: FontFamily.bold,
      fontWeight: '700',
      color: colors.textPrimary,
      letterSpacing: LetterSpacing.snug,
    },
    metaGrid: {
      gap: 6,
    },
    metaItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
    },
    metaText: {
      fontSize: FontSize.sm,
      color: colors.textSecondary,
      flex: 1,
    },
    agentRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
      paddingTop: Spacing.sm,
      borderTopWidth: 1,
      borderTopColor: colors.borderLight,
    },
    agentAvatar: {
      width: 28,
      height: 28,
      borderRadius: 14,
    },
    agentName: {
      flex: 1,
      fontSize: FontSize.sm,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    msgBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: Spacing.md,
      paddingVertical: 5,
      borderRadius: BorderRadius.full,
      borderWidth: 1,
      borderColor: colors.primary,
    },
    msgBtnText: {
      fontSize: FontSize.xs,
      fontWeight: '600',
      color: colors.primary,
    },

    // ── Action buttons ────────────────────────────────────────────
    actionRow: {
      flexDirection: 'row',
      gap: Spacing.sm,
    },
    acceptBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
      height: 40,
      backgroundColor: colors.lime,
      borderRadius: BorderRadius.lg,
    },
    acceptBtnText: {
      fontSize: FontSize.sm,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    rescheduleBtn: {
      flex: 1,
      height: 40,
      borderRadius: BorderRadius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    rescheduleBtnText: {
      fontSize: FontSize.sm,
      fontWeight: '600',
      color: colors.textPrimary,
    },
    cancelBtn: {
      flex: 1,
      height: 40,
      borderRadius: BorderRadius.lg,
      borderWidth: 1,
      borderColor: colors.error,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cancelBtnText: {
      fontSize: FontSize.sm,
      fontWeight: '600',
      color: colors.error,
    },
    calBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: Spacing.sm,
      height: 42,
      borderRadius: BorderRadius.lg,
      backgroundColor: `${colors.lime}20`,
      borderWidth: 1,
      borderColor: `${colors.lime}50`,
    },
    calBtnText: {
      fontSize: FontSize.sm,
      fontWeight: '700',
      color: colors.primary,
    },

    // ── Empty state ───────────────────────────────────────────────
    empty: {
      alignItems: 'center',
      paddingVertical: 80,
      gap: Spacing.md,
    },
    emptyIcon: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.borderLight,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: Spacing.sm,
    },
    emptyTitle: {
      fontSize: FontSize.xl,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    emptySub: {
      fontSize: FontSize.md,
      color: colors.textSecondary,
      textAlign: 'center',
      paddingHorizontal: Spacing.xxl,
      lineHeight: 22,
    },
    emptyBtn: {
      marginTop: Spacing.md,
      backgroundColor: colors.lime,
      paddingHorizontal: Spacing.xxl,
      paddingVertical: Spacing.lg,
      borderRadius: BorderRadius.full,
    },
    emptyBtnText: {
      fontSize: FontSize.md,
      fontWeight: '700',
      color: colors.textPrimary,
    },
  });
}
