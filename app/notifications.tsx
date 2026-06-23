import React, { useMemo } from 'react';
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
import {
  useNotificationsData,
  useMarkNotificationRead,
  useMarkAllRead,
  type AppNotification,
} from '../src/hooks/useNotificationsData';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

type NotificationGroup = { label: string; items: AppNotification[] };

function typeToIcon(
  type: AppNotification['type'],
  colors: ReturnType<typeof useColors>,
): { icon: IoniconsName; iconColor: string; iconBg: string } {
  switch (type) {
    case 'inspection': return { icon: 'calendar',         iconColor: colors.primary,  iconBg: `${colors.lime}28` };
    case 'payment':    return { icon: 'checkmark-circle', iconColor: '#1565C0',        iconBg: '#E3F2FD' };
    case 'message':    return { icon: 'chatbubble',       iconColor: colors.info,      iconBg: '#E3F2FD' };
    case 'listing':    return { icon: 'pricetag',         iconColor: colors.success,   iconBg: '#E8F5E9' };
    case 'system':     return { icon: 'person-circle',    iconColor: colors.warning,   iconBg: '#FFF8E1' };
  }
}

function groupByDate(items: AppNotification[]): NotificationGroup[] {
  const groups: Record<string, AppNotification[]> = {};
  const today = new Date(); today.setHours(0,0,0,0);
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);

  for (const item of items) {
    let label = item.time;
    const t = item.time.toLowerCase();
    if (t.includes('ago') || t.includes('h ago') || t.includes('m ago')) label = 'Today';
    else if (t === 'yesterday') label = 'Yesterday';
    if (!groups[label]) groups[label] = [];
    groups[label].push(item);
  }
  return Object.entries(groups).map(([label, items]) => ({ label, items }));
}

export default function NotificationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const { data: notifications = [] } = useNotificationsData();
  const markRead = useMarkNotificationRead();
  const markAllReadMutation = useMarkAllRead();

  const groups = groupByDate(notifications);
  const totalUnread = notifications.filter((n) => n.unread).length;

  const markAllRead = () => markAllReadMutation.mutate();

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
                const isUnread = item.unread;
                const { icon, iconColor, iconBg } = typeToIcon(item.type, colors);
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.item,
                      ii < group.items.length - 1 && styles.itemBorder,
                      isUnread && styles.itemUnread,
                    ]}
                    onPress={() => { if (isUnread) markRead.mutate(item.id); }}
                    activeOpacity={0.7}
                  >
                    {/* Unread dot */}
                    {isUnread && <View style={styles.unreadDot} />}

                    <View style={[styles.iconCircle, { backgroundColor: iconBg }]}>
                      <Ionicons name={icon} size={22} color={iconColor} />
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
