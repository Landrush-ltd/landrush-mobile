import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Spacing, FontSize, FontFamily, BorderRadius, Shadow, LetterSpacing } from '../src/constants/theme';
import type { ThemeColors } from '../src/constants/theme';
import { useColors } from '../src/context/ThemeContext';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

interface NotificationItem {
  id: string;
  icon: IoniconsName;
  iconColor: string;
  iconBg: string;
  title: string;
  subtitle: string;
  time: string;
  unread?: boolean;
}

interface NotificationGroup {
  label: string;
  items: NotificationItem[];
}

export default function NotificationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  const groups: NotificationGroup[] = [
    {
      label: 'Today',
      items: [
        {
          id: '1',
          icon: 'calendar',
          iconColor: colors.primary,
          iconBg: `${colors.lime}28`,
          title: 'Inspection Confirmed',
          subtitle: 'Your inspection for 12 Acres of Farmland has been confirmed for Monday, 12 May at 10:00 AM.',
          time: '2m ago',
          unread: true,
        },
        {
          id: '2',
          icon: 'checkmark-circle',
          iconColor: '#1565C0',
          iconBg: '#E3F2FD',
          title: 'Payment Successful',
          subtitle: 'Your access fee payment of ₦5,000 was processed successfully.',
          time: '1h ago',
          unread: true,
        },
      ],
    },
    {
      label: 'Yesterday',
      items: [
        {
          id: '3',
          icon: 'close-circle',
          iconColor: colors.error,
          iconBg: '#FFEBEE',
          title: 'Listing Rejected',
          subtitle: 'Your listing "5 Plots Industrial Zone" was rejected. Please review the feedback and resubmit.',
          time: '3:45 PM',
        },
        {
          id: '4',
          icon: 'checkmark-circle',
          iconColor: colors.success,
          iconBg: '#E8F5E9',
          title: 'Listing Approved',
          subtitle: 'Your listing "8 Plots Corner Piece, Lekki" is now live on Landrush.',
          time: '10:12 AM',
        },
      ],
    },
    {
      label: 'June 3',
      items: [
        {
          id: '5',
          icon: 'person',
          iconColor: colors.warning,
          iconBg: '#FFF8E1',
          title: 'New Booking Request',
          subtitle: 'Adewale Properties has requested an inspection for your listing.',
          time: '8:00 AM',
        },
        {
          id: '6',
          icon: 'chatbubble',
          iconColor: colors.info,
          iconBg: '#E3F2FD',
          title: 'New Message',
          subtitle: 'Chukwu Okafor sent you a message about "3 Plots of Land — Uyo GRA".',
          time: '7:14 AM',
        },
      ],
    },
  ];

  const totalUnread = groups
    .flatMap((g) => g.items)
    .filter((i) => i.unread && !readIds.has(i.id)).length;

  const markAllRead = () => {
    const allIds = groups.flatMap((g) => g.items.map((i) => i.id));
    setReadIds(new Set(allIds));
  };

  return (
    <View style={styles.root}>
      {/* Dark header */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <View style={styles.headerDecoA} />
        <View style={styles.headerDecoB} />

        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Notifications</Text>
            {totalUnread > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>{totalUnread}</Text>
              </View>
            )}
          </View>

          <TouchableOpacity onPress={markAllRead} disabled={totalUnread === 0}>
            <Text style={[styles.markAllText, totalUnread === 0 && { opacity: 0.4 }]}>
              Mark all read
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* White card body */}
      <ScrollView
        style={styles.card}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.cardContent}
      >
        {groups.map((group, gi) => (
          <View key={group.label} style={gi > 0 ? styles.groupGap : undefined}>
            <Text style={styles.groupLabel}>{group.label}</Text>
            <View style={styles.groupItems}>
              {group.items.map((item, ii) => {
                const isUnread = item.unread && !readIds.has(item.id);
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.item,
                      ii < group.items.length - 1 && styles.itemBorder,
                      isUnread && styles.itemUnread,
                    ]}
                    onPress={() => setReadIds((prev) => new Set([...prev, item.id]))}
                    activeOpacity={0.7}
                  >
                    {/* Unread dot */}
                    {isUnread && <View style={styles.unreadDot} />}

                    <View style={[styles.iconCircle, { backgroundColor: item.iconBg }]}>
                      <Ionicons name={item.icon} size={22} color={item.iconColor} />
                    </View>

                    <View style={styles.itemText}>
                      <View style={styles.itemTitleRow}>
                        <Text style={[styles.itemTitle, isUnread && styles.itemTitleUnread]}>
                          {item.title}
                        </Text>
                        <Text style={styles.itemTime}>{item.time}</Text>
                      </View>
                      <Text style={styles.itemSubtitle} numberOfLines={2}>
                        {item.subtitle}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

function makeStyles(colors: ThemeColors) {
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: colors.white,
    },
    header: {
      paddingHorizontal: Spacing.lg,
      paddingBottom: Spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
      backgroundColor: colors.white,
    },
    headerDecoA: { display: 'none' },
    headerDecoB: { display: 'none' },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    backBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerCenter: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
    },
    headerTitle: {
      fontSize: FontSize.xl,
      fontFamily: FontFamily.extraBold,
      fontWeight: '800',
      color: colors.textPrimary,
      letterSpacing: LetterSpacing.snug,
    },
    unreadBadge: {
      backgroundColor: colors.lime,
      borderRadius: BorderRadius.full,
      minWidth: 20,
      height: 20,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 5,
    },
    unreadBadgeText: {
      fontSize: FontSize.xs,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    markAllText: {
      fontSize: FontSize.sm,
      fontWeight: '600',
      color: colors.lime,
    },
    card: {
      flex: 1,
      backgroundColor: colors.white,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
    },
    cardContent: {
      paddingTop: Spacing.xl,
      paddingHorizontal: Spacing.lg,
    },
    groupGap: {
      marginTop: Spacing.xxl,
    },
    groupLabel: {
      fontSize: FontSize.sm,
      fontWeight: '700',
      color: colors.textTertiary,
      textTransform: 'uppercase',
      letterSpacing: 0.6,
      marginBottom: Spacing.sm,
    },
    groupItems: {
      backgroundColor: colors.white,
      borderRadius: BorderRadius.lg,
      borderWidth: 1,
      borderColor: colors.borderLight,
      overflow: 'hidden',
    },
    item: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: Spacing.md,
      paddingVertical: Spacing.lg,
      paddingHorizontal: Spacing.md,
      position: 'relative',
    },
    itemBorder: {
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
    },
    itemUnread: {
      backgroundColor: `${colors.lime}0A`,
    },
    unreadDot: {
      position: 'absolute',
      top: Spacing.lg + 8,
      left: 4,
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.lime,
    },
    iconCircle: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    itemText: {
      flex: 1,
      gap: 4,
    },
    itemTitleRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: Spacing.sm,
    },
    itemTitle: {
      flex: 1,
      fontSize: FontSize.md,
      fontWeight: '600',
      color: colors.textPrimary,
    },
    itemTitleUnread: {
      fontWeight: '700',
    },
    itemSubtitle: {
      fontSize: FontSize.sm,
      color: colors.textSecondary,
      lineHeight: 18,
    },
    itemTime: {
      fontSize: FontSize.xs,
      color: colors.textTertiary,
      flexShrink: 0,
      marginTop: 2,
    },
  });
}
